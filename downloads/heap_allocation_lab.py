"""Allocate, inspect, write, size, and free one process-heap block."""

import argparse
import ctypes
import os
from ctypes import wintypes


HEAP_ZERO_MEMORY = 0x00000008
SIZE_T_ERROR = ctypes.c_size_t(-1).value

kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
kernel32.GetProcessHeap.argtypes = []
kernel32.GetProcessHeap.restype = wintypes.HANDLE
kernel32.HeapAlloc.argtypes = [wintypes.HANDLE, wintypes.DWORD, ctypes.c_size_t]
kernel32.HeapAlloc.restype = wintypes.LPVOID
kernel32.HeapSize.argtypes = [wintypes.HANDLE, wintypes.DWORD, wintypes.LPCVOID]
kernel32.HeapSize.restype = ctypes.c_size_t
kernel32.HeapFree.argtypes = [wintypes.HANDLE, wintypes.DWORD, wintypes.LPVOID]
kernel32.HeapFree.restype = wintypes.BOOL


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--bytes", type=int, default=100)
    args = parser.parse_args()
    if not 1 <= args.bytes <= 1024 * 1024:
        parser.error("--bytes must be between 1 and 1048576")

    heap = kernel32.GetProcessHeap()
    if not heap:
        raise ctypes.WinError(ctypes.get_last_error())
    pointer = kernel32.HeapAlloc(heap, HEAP_ZERO_MEMORY, args.bytes)
    if not pointer:
        raise ctypes.WinError(ctypes.get_last_error())
    pointer = int(pointer)

    try:
        payload = bytes((index % 251) + 1 for index in range(args.bytes))
        ctypes.memmove(pointer, payload, len(payload))
        usable_size = kernel32.HeapSize(heap, 0, pointer)
        if usable_size == SIZE_T_ERROR:
            raise ctypes.WinError(ctypes.get_last_error())
        result = ctypes.string_at(pointer, args.bytes)
        print(f"PID: {os.getpid()}")
        print(f"process heap: 0x{int(heap):X}")
        print(f"block pointer: 0x{pointer:X}")
        print(f"requested bytes: {args.bytes}")
        print(f"reported usable bytes: {usable_size}")
        print(f"checksum: {sum(result)}")
        input("Find the containing heap region in VMMap, then press Enter to free the block...")
    finally:
        if not kernel32.HeapFree(heap, 0, pointer):
            raise ctypes.WinError(ctypes.get_last_error())
        print("freed block through the same process heap")


if __name__ == "__main__":
    main()
