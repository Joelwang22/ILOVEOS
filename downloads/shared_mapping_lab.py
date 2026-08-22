"""Demonstrate named shared memory and an isolated copy-on-write file view."""

import argparse
import ctypes
import mmap
import os
import tempfile
from pathlib import Path


DEFAULT_NAME = r"Local\ILOVEOS_SharedMappingLab"
SIZE = 4096
CREATOR_TEXT = b"creator says hello"
READER_TEXT = b"reader updated shared bytes"


def view_address(view):
    return ctypes.addressof(ctypes.c_char.from_buffer(view))


def write_text(view, value):
    if len(value) + 1 > SIZE:
        raise ValueError("message is too large")
    view.seek(0)
    view.write(value + b"\0")


def read_text(view):
    view.seek(0)
    return view.read(SIZE).split(b"\0", 1)[0]


def creator(name):
    with mmap.mmap(-1, SIZE, tagname=name, access=mmap.ACCESS_WRITE) as view:
        write_text(view, CREATOR_TEXT)
        print(f"PID: {os.getpid()}")
        print(f"name: {name}")
        print(f"view address: 0x{view_address(view):X}")
        print(f"initial bytes: {read_text(view)!r}")
        input("Start reader mode, let it write, then press Enter to read the shared update...")
        print(f"creator now reads: {read_text(view)!r}")
        input("Let the reader close, inspect lifetime, then press Enter to close the creator view...")


def reader(name):
    with mmap.mmap(-1, SIZE, tagname=name, access=mmap.ACCESS_WRITE) as view:
        initial = read_text(view)
        if initial != CREATOR_TEXT:
            raise SystemExit("The expected creator mapping is not active. Start creator mode first.")
        print(f"PID: {os.getpid()}")
        print(f"name: {name}")
        print(f"view address: 0x{view_address(view):X}")
        print(f"reader initially sees: {initial!r}")
        write_text(view, READER_TEXT)
        print(f"reader wrote: {read_text(view)!r}")
        input("Let creator mode observe the update, then press Enter to close the reader view...")


def copy_view():
    path = None
    try:
        with tempfile.NamedTemporaryFile(prefix="iloveos-cow-", suffix=".bin", delete=False) as stream:
            path = Path(stream.name)
            stream.write(b"ORIGINAL FILE BYTES")
        with path.open("r+b") as stream:
            with mmap.mmap(stream.fileno(), 0, access=mmap.ACCESS_COPY) as view:
                print(f"PID: {os.getpid()}")
                print(f"temporary file: {path}")
                print(f"copy-view address: 0x{view_address(view):X}")
                print(f"before private write: {view[:]!r}")
                view[0:8] = b"PRIVATE!"
                print(f"after private write: {view[:]!r}")
        print(f"reopened file bytes: {path.read_bytes()!r}")
    finally:
        if path is not None:
            path.unlink(missing_ok=True)
            print("deleted controlled copy-on-write file")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=("creator", "reader", "copy"))
    parser.add_argument("--name", default=DEFAULT_NAME)
    args = parser.parse_args()
    if args.mode == "creator":
        creator(args.name)
    elif args.mode == "reader":
        reader(args.name)
    else:
        copy_view()


if __name__ == "__main__":
    main()
