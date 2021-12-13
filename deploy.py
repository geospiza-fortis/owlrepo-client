#!/usr/bin/env python
"""Deploy the app to app engine on GCP.

This is a hack that allows for build variants in different environments. Until
build environment variables are made generally available in the app engine yaml,
this script will suffice. In short, we copy the staging dotenv file into the
production dotenv file before we deploy. This allows the buildpack, and in turn
vite, to see a different set of environment variables at build time.
"""
import argparse
import shutil
import signal
import sys
import tempfile
from pathlib import Path
from subprocess import run


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("environment", type=str, choices=["staging", "production"])
    args = parser.parse_args()

    prod = ".env.production"
    cleanup = None
    if args.environment == "staging":
        # we replace the production env file with the staging one
        tmpdir = tempfile.gettempdir()
        prod = ".env.production"
        staging = ".env.staging"
        shutil.copyfile(prod, f"{tmpdir}/{prod}")
        shutil.copyfile(staging, prod)

        # setup the cleanup handler
        def cleanup(*args, **kwargs):
            shutil.copyfile(f"{tmpdir}/{prod}", prod)
            sys.exit(0)

        signal.signal(signal.SIGINT, cleanup)

    print("Current production dotenv file:\n")
    print(Path(prod).read_text())

    project = "owlrepo" if args.environment == "production" else "owlrepo-nonprod"
    run(f"gcloud app deploy --project {project}".split(), shell=True)

    if cleanup:
        cleanup()


if __name__ == "__main__":
    main()
