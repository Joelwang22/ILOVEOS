"""A failure-aware CreateProcessW observation lab for ILOVEOS."""

import argparse
import ctypes
import os
from ctypes import wintypes


STARTF_USESHOWWINDOW = 0x00000001
SW_HIDE = 0
WAIT_OBJECT_0 = 0x00000000
INFINITE = 0xFFFFFFFF


class STARTUPINFOW(ctypes.Structure):
    _fields_ = [
        ("cb", wintypes.DWORD),
        ("lpReserved", wintypes.LPWSTR),
        ("lpDesktop", wintypes.LPWSTR),
        ("lpTitle", wintypes.LPWSTR),
        ("dwX", wintypes.DWORD),
        ("dwY", wintypes.DWORD),
        ("dwXSize", wintypes.DWORD),
        ("dwYSize", wintypes.DWORD),
        ("dwXCountChars", wintypes.DWORD),
        ("dwYCountChars", wintypes.DWORD),
        ("dwFillAttribute", wintypes.DWORD),
        ("dwFlags", wintypes.DWORD),
        ("wShowWindow", wintypes.WORD),
        ("cbReserved2", wintypes.WORD),
        ("lpReserved2", ctypes.POINTER(wintypes.BYTE)),
        ("hStdInput", wintypes.HANDLE),
        ("hStdOutput", wintypes.HANDLE),
        ("hStdError", wintypes.HANDLE),
    ]


class PROCESS_INFORMATION(ctypes.Structure):
    _fields_ = [
        ("hProcess", wintypes.HANDLE),
        ("hThread", wintypes.HANDLE),
        ("dwProcessId", wintypes.DWORD),
        ("dwThreadId", wintypes.DWORD),
    ]


kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
kernel32.CreateProcessW.argtypes = [
    wintypes.LPCWSTR,
    wintypes.LPWSTR,
    wintypes.LPVOID,
    wintypes.LPVOID,
    wintypes.BOOL,
    wintypes.DWORD,
    wintypes.LPVOID,
    wintypes.LPCWSTR,
    ctypes.POINTER(STARTUPINFOW),
    ctypes.POINTER(PROCESS_INFORMATION),
]
kernel32.CreateProcessW.restype = wintypes.BOOL
kernel32.WaitForSingleObject.argtypes = [wintypes.HANDLE, wintypes.DWORD]
kernel32.WaitForSingleObject.restype = wintypes.DWORD
kernel32.GetExitCodeProcess.argtypes = [wintypes.HANDLE, ctypes.POINTER(wintypes.DWORD)]
kernel32.GetExitCodeProcess.restype = wintypes.BOOL
kernel32.CloseHandle.argtypes = [wintypes.HANDLE]
kernel32.CloseHandle.restype = wintypes.BOOL


def close_checked(handle, label):
    if handle and not kernel32.CloseHandle(handle):
        print(f"warning: closing {label} failed: {ctypes.WinError(ctypes.get_last_error())}")
    else:
        print(f"closed {label}")


def main():
    parser = argparse.ArgumentParser()
    default_target = os.path.join(os.environ.get("SystemRoot", r"C:\Windows"), "System32", "notepad.exe")
    parser.add_argument("target", nargs="?", default=default_target, help="explicit harmless executable path")
    parser.add_argument("--hide", action="store_true", help="request SW_HIDE for the initial window")
    args = parser.parse_args()

    target = os.path.abspath(args.target)
    startup = STARTUPINFOW()
    startup.cb = ctypes.sizeof(startup)
    if args.hide:
        startup.dwFlags = STARTF_USESHOWWINDOW
        startup.wShowWindow = SW_HIDE

    process = PROCESS_INFORMATION()
    command_line = ctypes.create_unicode_buffer(f'"{target}"')
    created = kernel32.CreateProcessW(
        target,
        command_line,
        None,
        None,
        False,
        0,
        None,
        None,
        ctypes.byref(startup),
        ctypes.byref(process),
    )
    if not created:
        raise ctypes.WinError(ctypes.get_last_error())

    try:
        print(f"child PID: {process.dwProcessId}")
        print(f"initial TID: {process.dwThreadId}")
        print(f"hide requested: {args.hide}")
        input("Inspect the child, then close it and press Enter to wait for completion...")
        result = kernel32.WaitForSingleObject(process.hProcess, INFINITE)
        if result != WAIT_OBJECT_0:
            raise RuntimeError(f"unexpected wait result: 0x{result:08X}")
        exit_code = wintypes.DWORD()
        if not kernel32.GetExitCodeProcess(process.hProcess, ctypes.byref(exit_code)):
            raise ctypes.WinError(ctypes.get_last_error())
        print(f"child exit code: {exit_code.value}")
    finally:
        close_checked(process.hThread, "initial thread handle")
        close_checked(process.hProcess, "process handle")


if __name__ == "__main__":
    main()
