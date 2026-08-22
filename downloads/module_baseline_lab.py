"""Inventory modules loaded in this Python process and compare owned baselines."""

import argparse
import ctypes
import hashlib
import json
import os
import struct
import sys
from pathlib import Path
from ctypes import wintypes


MAX_MODULES = 4096
MAX_PATH_CHARS = 32768

kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
psapi = ctypes.WinDLL("psapi", use_last_error=True)

kernel32.GetCurrentProcess.argtypes = []
kernel32.GetCurrentProcess.restype = wintypes.HANDLE
psapi.EnumProcessModules.argtypes = [
    wintypes.HANDLE,
    ctypes.POINTER(wintypes.HMODULE),
    wintypes.DWORD,
    ctypes.POINTER(wintypes.DWORD),
]
psapi.EnumProcessModules.restype = wintypes.BOOL
psapi.GetModuleFileNameExW.argtypes = [
    wintypes.HANDLE,
    wintypes.HMODULE,
    wintypes.LPWSTR,
    wintypes.DWORD,
]
psapi.GetModuleFileNameExW.restype = wintypes.DWORD


def file_hash(path: Path) -> str | None:
    try:
        digest = hashlib.sha256()
        with path.open("rb") as stream:
            for chunk in iter(lambda: stream.read(1024 * 1024), b""):
                digest.update(chunk)
        return digest.hexdigest()
    except OSError:
        return None


def enumerate_modules() -> list[dict]:
    process = kernel32.GetCurrentProcess()
    modules = (wintypes.HMODULE * MAX_MODULES)()
    needed = wintypes.DWORD()
    if not psapi.EnumProcessModules(
        process, modules, ctypes.sizeof(modules), ctypes.byref(needed)
    ):
        raise ctypes.WinError(ctypes.get_last_error())
    count = needed.value // ctypes.sizeof(wintypes.HMODULE)
    if count > MAX_MODULES:
        raise RuntimeError(f"module array needs {count} entries, increase MAX_MODULES")

    records = []
    for module in modules[:count]:
        buffer = ctypes.create_unicode_buffer(MAX_PATH_CHARS)
        length = psapi.GetModuleFileNameExW(process, module, buffer, len(buffer))
        if not length:
            records.append({"base": int(module or 0), "path": None, "sha256": None})
            continue
        if length == len(buffer):
            raise RuntimeError("module path exceeded the fixed buffer")
        path = Path(buffer.value)
        records.append(
            {
                "base": int(module or 0),
                "path": str(path),
                "sha256": file_hash(path),
            }
        )
    return sorted(records, key=lambda record: (record["path"] or "").casefold())


def build_report() -> dict:
    return {
        "schema": 1,
        "pid": os.getpid(),
        "executable": str(Path(sys.executable).resolve()),
        "pointer_bits": struct.calcsize("P") * 8,
        "modules": enumerate_modules(),
    }


def by_path(report: dict) -> dict[str, dict]:
    return {
        record["path"].casefold(): record
        for record in report.get("modules", [])
        if record.get("path")
    }


def compare(before: dict, after: dict) -> None:
    old = by_path(before)
    new = by_path(after)
    print("added modules:")
    for key in sorted(new.keys() - old.keys()):
        print(f"  {new[key]['path']}")
    print("removed modules:")
    for key in sorted(old.keys() - new.keys()):
        print(f"  {old[key]['path']}")
    print("same path, changed hash:")
    for key in sorted(old.keys() & new.keys()):
        if old[key].get("sha256") != new[key].get("sha256"):
            print(f"  {new[key]['path']}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path)
    parser.add_argument("--compare", type=Path, metavar="BASELINE_JSON")
    parser.add_argument(
        "--no-pause",
        action="store_true",
        help="exit after printing the report, useful for automated checks",
    )
    args = parser.parse_args()
    report = build_report()

    print(f"PID: {report['pid']}")
    print(f"executable: {report['executable']}")
    print(f"pointer width: {report['pointer_bits']} bits")
    print(f"loaded modules: {len(report['modules'])}")
    for record in report["modules"]:
        hash_text = record["sha256"][:12] if record["sha256"] else "unreadable"
        print(f"  0x{record['base']:016X}  {hash_text}  {record['path']}")

    if args.compare:
        previous = json.loads(args.compare.read_text(encoding="utf-8"))
        compare(previous, report)
    if args.output:
        args.output.write_text(json.dumps(report, indent=2), encoding="utf-8")
        print(f"saved baseline: {args.output.resolve()}")
    if not args.no_pause:
        input("Compare this PID with Process Explorer and ListDLLs, then press Enter to exit...")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, json.JSONDecodeError) as error:
        raise SystemExit(f"Module baseline failed: {error}")
