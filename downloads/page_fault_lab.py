"""Compare first-touch and immediate repeated access to demand-zero pages."""

import argparse
import ctypes
import os
import time
from ctypes import wintypes


MEM_COMMIT = 0x1000
MEM_RESERVE = 0x2000
MEM_RELEASE = 0x8000
PAGE_READWRITE = 0x04
PAGE_SIZE = 0x1000

kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
kernel32.VirtualAlloc.argtypes = [wintypes.LPVOID, ctypes.c_size_t, wintypes.DWORD, wintypes.DWORD]
kernel32.VirtualAlloc.restype = wintypes.LPVOID
kernel32.VirtualFree.argtypes = [wintypes.LPVOID, ctypes.c_size_t, wintypes.DWORD]
kernel32.VirtualFree.restype = wintypes.BOOL


def touch_pages(base, byte_count):
    checksum = 0
    for offset in range(0, byte_count, PAGE_SIZE):
        cell = ctypes.c_ubyte.from_address(base + offset)
        cell.value = (cell.value + 1) & 0xFF
        checksum += cell.value
    return checksum


def timed_touch(label, base, byte_count):
    started = time.perf_counter()
    checksum = touch_pages(base, byte_count)
    elapsed_ms = (time.perf_counter() - started) * 1000
    print(f"{label} checksum: {checksum}")
    print(f"{label} elapsed: {elapsed_ms:.3f} ms")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mib", type=int, default=64)
    args = parser.parse_args()
    if not 1 <= args.mib <= 512:
        parser.error("--mib must be between 1 and 512")
    byte_count = args.mib * 1024 * 1024
    base = kernel32.VirtualAlloc(None, byte_count, MEM_RESERVE | MEM_COMMIT, PAGE_READWRITE)
    if not base:
        raise ctypes.WinError(ctypes.get_last_error())
    base = int(base)

    try:
        print(f"PID: {os.getpid()}")
        print(f"base: 0x{base:X}")
        print(f"size: {args.mib} MiB")
        print(f"pages: {byte_count // PAGE_SIZE}")
        input("Record the committed but untouched state, then press Enter for first touch...")
        timed_touch("first touch", base, byte_count)
        input("Record the first-touch counters, then press Enter for second touch...")
        timed_touch("second touch", base, byte_count)
        input("Record the repeated-touch counters, then press Enter to release...")
    finally:
        if not kernel32.VirtualFree(base, 0, MEM_RELEASE):
            raise ctypes.WinError(ctypes.get_last_error())
        print("released demand-zero test region")


if __name__ == "__main__":
    main()
