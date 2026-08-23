"""Create a controlled file-open lifetime for trace and snapshot inspection."""

import argparse
import os
import sys
import tempfile
from pathlib import Path


def remove_created_file(path):
    path.unlink()
    print(f"removed file created by this lab: {path}")


def main():
    parser = argparse.ArgumentParser(
        description="Open one owned temporary file, pause while it is open, then close it."
    )
    parser.add_argument(
        "path",
        nargs="?",
        type=Path,
        help="optional owned temporary-file path (default: a new file under the system temp directory)",
    )
    parser.add_argument(
        "--cleanup",
        action="store_true",
        help="remove the file after the post-close pause, but only if this run created it",
    )
    args = parser.parse_args()

    if args.path is None:
        descriptor, raw_path = tempfile.mkstemp(prefix="ILOVEOS_file_open_", suffix=".txt")
        os.close(descriptor)
        path = Path(raw_path).resolve()
        created = True
    else:
        path = args.path.expanduser().resolve()
        created = not path.exists()
        if created:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("ILOVEOS controlled file-open trace\n", encoding="utf-8")

    print(f"Python executable: {sys.executable}")
    print(f"PID: {os.getpid()}")
    print(f"path: {path}")
    print(f"created by this run: {created}")

    with path.open("r", encoding="utf-8") as stream:
        stream.read(1)
        input("File handle is open. Inspect the trace and handle, then press Enter to close it...")

    print("file handle closed")
    input("File handle is closed. Refresh the snapshot, then press Enter to continue...")

    if not created:
        print("leaving file in place because this run did not create it")
    elif args.cleanup:
        remove_created_file(path)
    elif input("Delete the file created by this lab? [y/N] ").strip().lower() in {"y", "yes"}:
        remove_created_file(path)
    else:
        print(f"leaving file created by this lab in place: {path}")


if __name__ == "__main__":
    main()
