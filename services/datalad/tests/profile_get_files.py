import os

from datalad.api import Dataset
from datalad_service.common.annex import get_repo_files
import vmprof

from .dataset_fixtures import *


def test_profile_get_repo_files(datalad_store, new_dataset):
    ds_id = os.path.basename(new_dataset.path)
    ds = Dataset(os.path.join(datalad_store.annex_path, ds_id))
    for each in range(5000):
        filename = 'file-{}'.format(each)
        path = os.path.join(new_dataset.path, filename)
        with open(path, 'a'):
            os.utime(path)
    # Add all generated files
    ds.save('.')
    # Profile get_repo_files by itself
    with open('{}.prof'.format(__name__), 'w+b') as fd:
        vmprof.enable(fd.fileno())
        for n in range(1):
            get_repo_files(ds)
        vmprof.disable()
