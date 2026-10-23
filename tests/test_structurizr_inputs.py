"""Snapshot only regular declared files; never follow model-controlled links."""
import os
import pathlib
import sys
import tempfile
import unittest

sys.dont_write_bytecode = True
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / 'tools/structurizr'))
import runtime


class ModelInputBoundaryTest(unittest.TestCase):
    def test_links_and_special_files_are_rejected_without_blocking(self):
        with tempfile.TemporaryDirectory(prefix='architecture-model-input-') as directory:
            root = pathlib.Path(directory)
            (root / 'declared').mkdir()
            (root / 'outside').mkdir()
            source = root / 'declared/model.dsl'
            source.write_bytes(b'declared source')
            self.assertEqual(runtime.read_model_input(source), b'declared source')
            (root / 'outside/canary').write_text('must never be read')
            (root / 'declared/file-link').symlink_to(root / 'outside/canary')
            (root / 'declared/directory-link').symlink_to(root / 'outside', target_is_directory=True)
            os.mkfifo(root / 'declared/pipe')
            for name in ['file-link', 'directory-link/canary', 'pipe']:
                with self.subTest(name=name), self.assertRaisesRegex(ValueError, 'regular file without symbolic links'):
                    runtime.read_model_input(root / 'declared' / name)


if __name__ == '__main__':
    unittest.main()
