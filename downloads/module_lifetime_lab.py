"""Load a known DLL by explicit path, pause for inspection, then release it."""

import argparse
import ctypes
import os
from pathlib import Path

import win32api


def main():
    parser = argparse.ArgumentParser()
    default_dll = Path(os.environ.get("SystemRoot", r"C:\Windows")) / "System32" / "version.dll"
    parser.add_argument("--dll", type=Path, default=default_dll)
    args = parser.parse_args()
    path = args.dll.resolve(strict=True)
    print(f"PID: {os.getpid()}")
    print(f"Python pointer width: {ctypes.sizeof(ctypes.c_void_p) * 8} bits")
    print(f"explicit DLL path: {path}")
    input("Inspect whether the DLL is already mapped, then press Enter to call LoadLibrary...")

    module = win32api.LoadLibrary(str(path))
    try:
        print(f"owned HMODULE: 0x{int(module):X}")
        print(f"selected path: {win32api.GetModuleFileName(module)}")
        input("Inspect Image Load and the live module, then press Enter to call FreeLibrary...")
    finally:
        win32api.FreeLibrary(module)
        print("released the LoadLibrary reference")
    input("Refresh the module snapshot, then press Enter to exit...")


if __name__ == "__main__":
    main()
