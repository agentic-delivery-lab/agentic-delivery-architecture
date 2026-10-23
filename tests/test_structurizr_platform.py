"""Unsupported hosts must be refused before any cache or network cost."""
import pathlib
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.dont_write_bytecode = True
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / 'tools/structurizr'))
import runtime


class PlatformBoundaryTest(unittest.TestCase):
    def test_unsupported_preparation_has_no_cache_or_download_side_effects(self):
        cases = [('Darwin', 'x86_64', (3, 14)), ('Linux', 'aarch64', (3, 14)),
                 ('Windows', 'AMD64', (3, 14)), ('Linux', 'x86_64', (3, 11))]
        with tempfile.TemporaryDirectory(prefix='architecture-platform-test-') as directory:
            for system, machine, version in cases:
                with self.subTest(system=system, machine=machine, version=version):
                    cache = pathlib.Path(directory) / f'{system}-{machine}-{version[1]}'
                    with patch.object(runtime, 'CACHE', cache), \
                         patch.object(runtime.platform, 'system', return_value=system), \
                         patch.object(runtime.platform, 'machine', return_value=machine), \
                         patch.object(runtime.sys, 'version_info', version), \
                         patch.object(runtime.subprocess, 'run') as download:
                        with self.assertRaisesRegex(ValueError, 'Linux x64.*Python 3.12'):
                            runtime.prepare()
                        download.assert_not_called()
                        self.assertFalse(cache.exists())


if __name__ == '__main__':
    unittest.main()
