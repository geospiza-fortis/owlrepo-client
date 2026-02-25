#!/usr/bin/env -S uv run python
"""Deploy the app to App Engine on GCP.

Uses per-environment app.yaml files (app.yaml, app.nonprod.yaml)
which define build_env_variables for Vite to pick up at build time.
"""
import argparse
from subprocess import run


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("environment", type=str, choices=["staging", "production"])
    args = parser.parse_args()

    if args.environment == "staging":
        yaml = "app.nonprod.yaml"
        project = "owlrepo-nonprod"
    else:
        yaml = "app.yaml"
        project = "owlrepo"

    cmd = ["gcloud", "app", "deploy", yaml, "--project", project]
    print(f"Running command: {' '.join(cmd)}")
    run(cmd, check=True)


if __name__ == "__main__":
    main()