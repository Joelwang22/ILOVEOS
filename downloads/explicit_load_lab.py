"""Resolve MessageBoxW through a typed function pointer and release the DLL."""

import ctypes
import os
from ctypes import wintypes
from pathlib import Path


MB_OK = 0x00000000
IDOK = 1

kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
kernel32.LoadLibraryW.argtypes = [wintypes.LPCWSTR]
kernel32.LoadLibraryW.restype = wintypes.HMODULE
kernel32.GetProcAddress.argtypes = [wintypes.HMODULE, wintypes.LPCSTR]
kernel32.GetProcAddress.restype = ctypes.c_void_p
kernel32.GetModuleFileNameW.argtypes = [wintypes.HMODULE, wintypes.LPWSTR, wintypes.DWORD]
kernel32.GetModuleFileNameW.restype = wintypes.DWORD
kernel32.FreeLibrary.argtypes = [wintypes.HMODULE]
kernel32.FreeLibrary.restype = wintypes.BOOL

MESSAGE_BOX_W = ctypes.WINFUNCTYPE(
    ctypes.c_int,
    wintypes.HWND,
    wintypes.LPCWSTR,
    wintypes.LPCWSTR,
    wintypes.UINT,
)


def module_path(module):
    buffer = ctypes.create_unicode_buffer(32768)
    length = kernel32.GetModuleFileNameW(module, buffer, len(buffer))
    if not length:
        raise ctypes.WinError(ctypes.get_last_error())
    if length == len(buffer):
        raise RuntimeError("module path did not fit in the fixed buffer")
    return buffer.value


def main():
    dll_path = Path(os.environ.get("SystemRoot", r"C:\Windows")) / "System32" / "user32.dll"
    module = kernel32.LoadLibraryW(str(dll_path))
    if not module:
        raise ctypes.WinError(ctypes.get_last_error())
    module = int(module)

    try:
        address = kernel32.GetProcAddress(module, b"MessageBoxW")
        if not address:
            raise RuntimeError("GetProcAddress could not find MessageBoxW")
        message_box = MESSAGE_BOX_W(address)
        print(f"PID: {os.getpid()}")
        print(f"module path: {module_path(module)}")
        print(f"HMODULE: 0x{module:X}")
        print(f"MessageBoxW address: 0x{int(address):X}")
        print("prototype: int(HWND, LPCWSTR, LPCWSTR, UINT)")
        input("Inspect the module and export address, then press Enter to call MessageBoxW...")
        result = message_box(None, "Unicode works: memory, PE, and loader", "ILOVEOS explicit loading", MB_OK)
        print(f"MessageBoxW result: {result}")
        print(f"result is IDOK: {result == IDOK}")
    finally:
        if not kernel32.FreeLibrary(module):
            raise ctypes.WinError(ctypes.get_last_error())
        print("released the user32.dll LoadLibrary reference")


if __name__ == "__main__":
    main()
