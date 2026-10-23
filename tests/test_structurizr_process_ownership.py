"""Retain the Popen child identity until its entire owned group is stopped."""
import pathlib
import signal
import subprocess
import sys
import unittest
from unittest.mock import Mock, patch

sys.dont_write_bytecode = True
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / 'tools/structurizr'))
import runtime


class ProcessOwnershipTest(unittest.TestCase):
    def test_root_is_reaped_only_after_owned_group_cleanup(self):
        events = []
        process = Mock(pid=100)
        process.wait.side_effect = lambda **kwargs: events.append('reap') or 0
        with patch.object(runtime.subprocess, 'Popen', return_value=process) as start, \
             patch.object(runtime.os, 'waitid', return_value=object()) as observe, \
             patch.object(runtime.os, 'killpg', side_effect=lambda pgid, sig: events.append(('group', pgid))), \
             patch.object(runtime, 'live_group_members', return_value=[], create=True):
            self.assertEqual(runtime.run_bounded(['sandbox'], None, None, {}), 0)
            self.assertEqual(events, [('group', 100), 'reap'])
            self.assertTrue(observe.call_args.args[2] & runtime.os.WNOWAIT)
            self.assertTrue(start.call_args.kwargs['start_new_session'])
            self.assertEqual(start.call_args.kwargs['stdin'], subprocess.DEVNULL)
            process.kill.assert_not_called()
            process.poll.assert_not_called()

    def test_startup_timeout_signals_only_reserved_group_before_reaping(self):
        process = Mock(pid=100)
        process.wait.return_value = 0
        with patch.dict(runtime.PIN, {'wallSeconds': 0}), \
             patch.object(runtime.subprocess, 'Popen', return_value=process), \
             patch.object(runtime.os, 'waitid', return_value=None), \
             patch.object(runtime.os, 'killpg') as stop, \
             patch.object(runtime, 'live_group_members', return_value=[], create=True):
            with self.assertRaisesRegex(TimeoutError, 'descendants stopped'):
                runtime.run_bounded(['sandbox'], None, None, {})
            stop.assert_called_once_with(100, signal.SIGKILL)
            process.wait.assert_called_once()
            process.kill.assert_not_called()

    def test_lost_child_ownership_never_signals_a_potentially_reused_group(self):
        process = Mock(pid=100)
        with patch.object(runtime.subprocess, 'Popen', return_value=process), \
             patch.object(runtime.os, 'waitid', side_effect=ChildProcessError), \
             patch.object(runtime.os, 'killpg') as stop:
            with self.assertRaisesRegex(RuntimeError, 'ownership lost'):
                runtime.run_bounded(['sandbox'], None, None, {})
            stop.assert_not_called()


    def test_pending_cancellation_is_delivered_only_after_spawn_ownership_is_guarded(self):
        process = Mock(pid=100)
        process.wait.return_value = -9
        delivered = False
        masked = set()
        def change_mask(how, signals):
            nonlocal delivered, masked
            previous = masked.copy()
            masked = masked | set(signals) if how == signal.SIG_BLOCK else set(signals)
            if how == signal.SIG_SETMASK and not masked and not delivered:
                delivered = True
                raise InterruptedError('pending cancellation at handoff')
            return previous
        def spawn(*args, **kwargs):
            self.assertTrue({signal.SIGINT, signal.SIGTERM} <= masked)
            return process
        with patch.object(runtime.subprocess, 'Popen', side_effect=spawn), \
             patch.object(runtime.signal, 'pthread_sigmask', side_effect=change_mask), \
             patch.object(runtime.os, 'waitid', return_value=None), \
             patch.object(runtime.os, 'killpg') as stop, \
             patch.object(runtime, 'live_group_members', return_value=[], create=True):
            with self.assertRaisesRegex(InterruptedError, 'handoff'):
                runtime.run_bounded(['sandbox'], None, None, {})
            stop.assert_called_once_with(100, signal.SIGKILL)
            process.wait.assert_called_once()


    def test_child_restores_the_original_signal_mask_before_exec(self):
        process = Mock(pid=100)
        process.wait.return_value = 0
        with patch.object(runtime.subprocess, 'Popen', return_value=process) as start, \
             patch.object(runtime.os, 'waitid', return_value=object()), \
             patch.object(runtime.os, 'killpg'), \
             patch.object(runtime, 'live_group_members', return_value=[]), \
             patch.object(runtime.signal, 'pthread_sigmask', return_value={signal.SIGUSR1}) as mask, \
             patch.object(runtime, 'limits') as limits:
            runtime.run_bounded(['sandbox'], None, None, {})
            mask.reset_mock()
            start.call_args.kwargs['preexec_fn']()
            limits.assert_called_once()
            mask.assert_called_once_with(signal.SIG_SETMASK, {signal.SIGUSR1})


if __name__ == '__main__':
    unittest.main()
