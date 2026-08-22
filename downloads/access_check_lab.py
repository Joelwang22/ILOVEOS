"""Predict and verify read/write access on a disposable file.

Current pywin32 builds do not expose AccessCheck, so this focused edge uses
ctypes while retaining the same token, descriptor, generic-mapping, and
cleanup model taught by the win32security lessons.
"""

from __future__ import annotations

import ctypes
import os
import tempfile
from ctypes import wintypes

TOKEN_DUPLICATE = 0x0002
TOKEN_QUERY = 0x0008
SECURITY_IMPERSONATION = 2
SE_FILE_OBJECT = 1
OWNER_SECURITY_INFORMATION = 0x00000001
GROUP_SECURITY_INFORMATION = 0x00000002
DACL_SECURITY_INFORMATION = 0x00000004
GENERIC_READ = 0x80000000
GENERIC_WRITE = 0x40000000
FILE_GENERIC_READ = 0x00120089
FILE_GENERIC_WRITE = 0x00120116
FILE_GENERIC_EXECUTE = 0x001200A0
FILE_ALL_ACCESS = 0x001F01FF
ERROR_INSUFFICIENT_BUFFER = 122


class GENERIC_MAPPING(ctypes.Structure):
    _fields_ = [
        ("GenericRead", wintypes.DWORD),
        ("GenericWrite", wintypes.DWORD),
        ("GenericExecute", wintypes.DWORD),
        ("GenericAll", wintypes.DWORD),
    ]


advapi32 = ctypes.WinDLL("Advapi32.dll", use_last_error=True)
kernel32 = ctypes.WinDLL("Kernel32.dll", use_last_error=True)

GetCurrentProcess = kernel32.GetCurrentProcess
GetCurrentProcess.argtypes = []
GetCurrentProcess.restype = wintypes.HANDLE
OpenProcessToken = advapi32.OpenProcessToken
OpenProcessToken.argtypes = [wintypes.HANDLE, wintypes.DWORD, ctypes.POINTER(wintypes.HANDLE)]
OpenProcessToken.restype = wintypes.BOOL
DuplicateToken = advapi32.DuplicateToken
DuplicateToken.argtypes = [wintypes.HANDLE, ctypes.c_int, ctypes.POINTER(wintypes.HANDLE)]
DuplicateToken.restype = wintypes.BOOL
GetNamedSecurityInfoW = advapi32.GetNamedSecurityInfoW
GetNamedSecurityInfoW.argtypes = [
    wintypes.LPWSTR,
    ctypes.c_int,
    wintypes.DWORD,
    ctypes.c_void_p,
    ctypes.c_void_p,
    ctypes.c_void_p,
    ctypes.c_void_p,
    ctypes.POINTER(ctypes.c_void_p),
]
GetNamedSecurityInfoW.restype = wintypes.DWORD
MapGenericMask = advapi32.MapGenericMask
MapGenericMask.argtypes = [ctypes.POINTER(wintypes.DWORD), ctypes.POINTER(GENERIC_MAPPING)]
MapGenericMask.restype = None
AccessCheck = advapi32.AccessCheck
AccessCheck.argtypes = [
    ctypes.c_void_p,
    wintypes.HANDLE,
    wintypes.DWORD,
    ctypes.POINTER(GENERIC_MAPPING),
    ctypes.c_void_p,
    ctypes.POINTER(wintypes.DWORD),
    ctypes.POINTER(wintypes.DWORD),
    ctypes.POINTER(wintypes.BOOL),
]
AccessCheck.restype = wintypes.BOOL
CloseHandle = kernel32.CloseHandle
CloseHandle.argtypes = [wintypes.HANDLE]
CloseHandle.restype = wintypes.BOOL
LocalFree = kernel32.LocalFree
LocalFree.argtypes = [ctypes.c_void_p]
LocalFree.restype = ctypes.c_void_p


def fail(operation: str) -> None:
    raise ctypes.WinError(ctypes.get_last_error(), f"{operation} failed")


def evaluate(descriptor, token, generic_access: int, mapping: GENERIC_MAPPING) -> None:
    requested = wintypes.DWORD(generic_access)
    MapGenericMask(ctypes.byref(requested), ctypes.byref(mapping))
    size = wintypes.DWORD(256)
    while True:
        privileges = ctypes.create_string_buffer(size.value)
        granted = wintypes.DWORD()
        allowed = wintypes.BOOL()
        if AccessCheck(
            descriptor,
            token,
            requested.value,
            ctypes.byref(mapping),
            privileges,
            ctypes.byref(size),
            ctypes.byref(granted),
            ctypes.byref(allowed),
        ):
            print(
                f"generic=0x{generic_access:08X}, mapped=0x{requested.value:08X}, "
                f"granted=0x{granted.value:08X}, allowed={bool(allowed.value)}"
            )
            return
        if ctypes.get_last_error() != ERROR_INSUFFICIENT_BUFFER:
            fail("AccessCheck")


fd, path = tempfile.mkstemp(prefix="iloveos_access_", suffix=".txt")
os.close(fd)
process_token = wintypes.HANDLE()
impersonation_token = wintypes.HANDLE()
descriptor = ctypes.c_void_p()
try:
    if not OpenProcessToken(
        GetCurrentProcess(), TOKEN_QUERY | TOKEN_DUPLICATE, ctypes.byref(process_token)
    ):
        fail("OpenProcessToken")
    if not DuplicateToken(
        process_token, SECURITY_IMPERSONATION, ctypes.byref(impersonation_token)
    ):
        fail("DuplicateToken")
    result = GetNamedSecurityInfoW(
        path,
        SE_FILE_OBJECT,
        OWNER_SECURITY_INFORMATION | GROUP_SECURITY_INFORMATION | DACL_SECURITY_INFORMATION,
        None,
        None,
        None,
        None,
        ctypes.byref(descriptor),
    )
    if result:
        raise ctypes.WinError(result, "GetNamedSecurityInfoW failed")

    generic_mapping = GENERIC_MAPPING(
        FILE_GENERIC_READ,
        FILE_GENERIC_WRITE,
        FILE_GENERIC_EXECUTE,
        FILE_ALL_ACCESS,
    )
    print(f"Disposable target: {path}")
    evaluate(descriptor, impersonation_token, GENERIC_READ, generic_mapping)
    evaluate(descriptor, impersonation_token, GENERIC_WRITE, generic_mapping)
    with open(path, "rb") as stream:
        stream.read(1)
    print("The real read open also succeeded.")
finally:
    if descriptor:
        LocalFree(descriptor)
    if impersonation_token:
        CloseHandle(impersonation_token)
    if process_token:
        CloseHandle(process_token)
    os.unlink(path)
    print("Removed the disposable file.")
