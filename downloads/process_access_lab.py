"""Open one process with a named access mask, report the result, and close it."""

import argparse
import ctypes
from ctypes import wintypes


ACCESS_MASKS = {
    "all": ("PROCESS_ALL_ACCESS", 0x001FFFFF),
    "query-limited": ("PROCESS_QUERY_LIMITED_INFORMATION", 0x00001000),
}
kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
kernel32.OpenProcess.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.DWORD]
kernel32.OpenProcess.restype = wintypes.HANDLE
kernel32.CloseHandle.argtypes = [wintypes.HANDLE]
kernel32.CloseHandle.restype = wintypes.BOOL


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("pid", type=int)
    parser.add_argument("--access", choices=ACCESS_MASKS, required=True)
    args = parser.parse_args()

    access_name, mask = ACCESS_MASKS[args.access]
    ctypes.set_last_error(0)
    handle = kernel32.OpenProcess(mask, False, args.pid)
    error = ctypes.get_last_error()
    print(
        f"OpenProcess PID={args.pid} access={access_name} "
        f"requested=0x{mask:08X} handle={int(handle or 0):#x} "
        f"error={error}: {ctypes.FormatError(error) if error else 'success'}"
    )
    if not handle:
        return

    ctypes.set_last_error(0)
    if not kernel32.CloseHandle(handle):
        close_error = ctypes.get_last_error()
        raise SystemExit(
            f"CloseHandle failed error={close_error}: {ctypes.FormatError(close_error)}"
        )
    print("CloseHandle: closed process handle")


if __name__ == "__main__":
    main()
