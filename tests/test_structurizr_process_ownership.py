"""A stale /proc children entry must never authorize killing a reused PID."""
import pathlib
import subprocess
import sys
import unittest
from unittest.mock import Mock, patch

sys.dont_write_bytecode = True
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / 'tools/structurizr'))
import runtime


class ProcessOwnershipTest(unittest.TestCase):
    def test_reused_child_pid_with_unrelated_parent_is_never_signalled(self):
        process = Mock(pid=100)
        process.wait.side_effect = [subprocess.TimeoutExpired('sandbox', 60), 0]
        def read_text(path, *args, **kwargs):
            name = str(path)
            if name.endswith('/children'):
                return '200' if name.startswith('/proc/100/') else ''
            pid = int(name.split('/')[2])
            parent = 99 if pid == 100 else 999  # 200 was reused by an unrelated session.
            fields = ['S', str(parent)] + ['0'] * 17 + ['12345']
            return f'{pid} (process) ' + ' '.join(fields)
        poll = Mock()
        poll.poll.return_value = [(10, 1)]
        with patch.object(runtime.subprocess, 'Popen', return_value=process), \
             patch.object(runtime.pathlib.Path, 'read_text', read_text), \
             patch.object(runtime.os, 'pidfd_open', side_effect=lambda pid: pid // 10) as opened, \
             patch.object(runtime.os, 'close'), \
             patch.object(runtime.signal, 'pidfd_send_signal') as signal, \
             patch.object(runtime.select, 'poll', return_value=poll):
            with self.assertRaisesRegex(RuntimeError, 'identity changed'):
                runtime.run_bounded(['sandbox'], None, None, {})
            self.assertEqual([call.args[0] for call in opened.call_args_list], [])
            signal.assert_not_called()
            process.kill.assert_called_once()


    def test_discovered_processes_are_observed_without_being_signalled(self):
        process = Mock(pid=100)
        process.wait.side_effect = [subprocess.TimeoutExpired('sandbox', 60), 0]
        replaced_parent = False
        def read_text(path, *args, **kwargs):
            nonlocal replaced_parent
            name = str(path)
            if name == '/proc/100/task/100/children':
                return '200'
            if name == '/proc/200/task/200/children':
                replaced_parent = True
                return '300'  # Child of the replacement, not our original parent.
            if name.endswith('/children'):
                return ''
            pid = int(name.split('/')[2])
            parent = {100: 99, 200: 100, 300: 200}[pid]
            birth = '67890' if pid == 200 and replaced_parent else '12345'
            return f'{pid} (process) ' + ' '.join(['S', str(parent)] + ['0'] * 17 + [birth])
        poll = Mock()
        poll.poll.return_value = [(20, 1)]
        with patch.object(runtime.subprocess, 'Popen', return_value=process), \
             patch.object(runtime.pathlib.Path, 'read_text', read_text), \
             patch.object(runtime.os, 'pidfd_open', side_effect=lambda pid: pid // 10) as opened, \
             patch.object(runtime.os, 'close'), \
             patch.object(runtime.signal, 'pidfd_send_signal') as signal, \
             patch.object(runtime.select, 'poll', return_value=poll):
            with self.assertRaisesRegex(TimeoutError, 'descendants stopped'):
                runtime.run_bounded(['sandbox'], None, None, {})
            signal.assert_not_called()
            self.assertEqual([call.args[0] for call in opened.call_args_list], [200])
            self.assertFalse(replaced_parent, 'cleanup must not recursively follow a replaceable parent')
            process.kill.assert_called_once()


if __name__ == '__main__':
    unittest.main()
