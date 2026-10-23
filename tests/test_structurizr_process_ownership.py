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
            self.assertEqual([call.args[0] for call in opened.call_args_list], [100])
            self.assertEqual([call.args[0] for call in signal.call_args_list], [10])
            process.kill.assert_called_once()


if __name__ == '__main__':
    unittest.main()
