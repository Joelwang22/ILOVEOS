"""Inspect Registry views and perform one reversible HKCU value experiment."""

from __future__ import annotations

import argparse
import struct
import winreg

LAB_KEY = r"Software\ILOVEOSLab"
VALUE_NAME = "DemoMode"


def architecture() -> str:
    return f"{struct.calcsize('P') * 8}-bit Python"


def query_optional(key, name: str):
    try:
        return True, *winreg.QueryValueEx(key, name)
    except FileNotFoundError:
        return False, None, None


def inspect_views() -> None:
    print(f"Interpreter: {architecture()}")
    path = r"SOFTWARE\Microsoft\Windows NT\CurrentVersion"
    for label, flag in (
        ("32-bit view", winreg.KEY_WOW64_32KEY),
        ("64-bit view", winreg.KEY_WOW64_64KEY),
    ):
        try:
            with winreg.OpenKey(
                winreg.HKEY_LOCAL_MACHINE,
                path,
                0,
                winreg.KEY_READ | flag,
            ) as key:
                product, value_type = winreg.QueryValueEx(key, "ProductName")
                print(f"{label}: ProductName={product!r}, type={value_type}")
        except OSError as exc:
            print(f"{label}: unavailable ({exc})")


def reversible_demo() -> None:
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, LAB_KEY):
            key_existed = True
    except FileNotFoundError:
        key_existed = False

    with winreg.CreateKeyEx(
        winreg.HKEY_CURRENT_USER,
        LAB_KEY,
        0,
        winreg.KEY_QUERY_VALUE | winreg.KEY_SET_VALUE,
    ) as key:
        existed, old_data, old_type = query_optional(key, VALUE_NAME)
        print(f"Before: existed={existed}, data={old_data!r}, type={old_type!r}")
        try:
            winreg.SetValueEx(key, VALUE_NAME, 0, winreg.REG_DWORD, 1)
            data, value_type = winreg.QueryValueEx(key, VALUE_NAME)
            print(f"During: data={data!r}, type={value_type}")
        finally:
            if existed:
                winreg.SetValueEx(key, VALUE_NAME, 0, old_type, old_data)
                print("Restored the original value and type.")
            else:
                try:
                    winreg.DeleteValue(key, VALUE_NAME)
                except FileNotFoundError:
                    pass
                print("Removed the value created by this run.")
    if not key_existed:
        try:
            winreg.DeleteKey(winreg.HKEY_CURRENT_USER, LAB_KEY)
            print("Removed the empty lab key created by this run.")
        except OSError as exc:
            print(f"Lab key was not empty, so it was preserved: {exc}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--write-lab",
        action="store_true",
        help=f"perform a reversible write only under HKCU\\{LAB_KEY}",
    )
    args = parser.parse_args()
    inspect_views()
    if args.write_lab:
        try:
            reversible_demo()
        except PermissionError as exc:
            raise SystemExit(
                f"The current security context cannot write HKCU\\{LAB_KEY}: {exc}"
            ) from exc
    else:
        print("Read-only run. Add --write-lab for the reversible HKCU experiment.")


if __name__ == "__main__":
    main()
