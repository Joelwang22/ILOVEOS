"""Export a process virtual-address map with a corrected VirtualQueryEx traversal."""

import argparse
import csv
import ctypes
from ctypes import wintypes
from pathlib import Path

import win32api
import win32con


MEM_COMMIT = 0x1000
MEM_RESERVE = 0x2000
MEM_FREE = 0x10000
MEM_PRIVATE = 0x20000
MEM_MAPPED = 0x40000
MEM_IMAGE = 0x1000000

PAGE_GUARD = 0x100
PAGE_NOCACHE = 0x200
PAGE_WRITECOMBINE = 0x400

STATE_NAMES = {MEM_COMMIT: "Committed", MEM_RESERVE: "Reserved", MEM_FREE: "Free"}
TYPE_NAMES = {MEM_PRIVATE: "Private", MEM_MAPPED: "Mapped", MEM_IMAGE: "Image"}
PROTECTION_NAMES = {
    0x01: "NoAccess",
    0x02: "ReadOnly",
    0x04: "ReadWrite",
    0x08: "WriteCopy",
    0x10: "Execute",
    0x20: "ExecuteRead",
    0x40: "ExecuteReadWrite",
    0x80: "ExecuteWriteCopy",
}


class PROCESSOR_INFO(ctypes.Structure):
    _fields_ = [("wProcessorArchitecture", wintypes.WORD), ("wReserved", wintypes.WORD)]


class SYSTEM_INFO_UNION(ctypes.Union):
    _fields_ = [("dwOemId", wintypes.DWORD), ("processor", PROCESSOR_INFO)]


class SYSTEM_INFO(ctypes.Structure):
    _anonymous_ = ("system",)
    _fields_ = [
        ("system", SYSTEM_INFO_UNION),
        ("dwPageSize", wintypes.DWORD),
        ("lpMinimumApplicationAddress", wintypes.LPVOID),
        ("lpMaximumApplicationAddress", wintypes.LPVOID),
        ("dwActiveProcessorMask", ctypes.c_size_t),
        ("dwNumberOfProcessors", wintypes.DWORD),
        ("dwProcessorType", wintypes.DWORD),
        ("dwAllocationGranularity", wintypes.DWORD),
        ("wProcessorLevel", wintypes.WORD),
        ("wProcessorRevision", wintypes.WORD),
    ]


class MEMORY_BASIC_INFORMATION(ctypes.Structure):
    _fields_ = [
        ("BaseAddress", wintypes.LPVOID),
        ("AllocationBase", wintypes.LPVOID),
        ("AllocationProtect", wintypes.DWORD),
        ("PartitionId", wintypes.WORD),
        ("RegionSize", ctypes.c_size_t),
        ("State", wintypes.DWORD),
        ("Protect", wintypes.DWORD),
        ("Type", wintypes.DWORD),
    ]


kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
kernel32.GetSystemInfo.argtypes = [ctypes.POINTER(SYSTEM_INFO)]
kernel32.GetSystemInfo.restype = None
kernel32.VirtualQueryEx.argtypes = [
    wintypes.HANDLE,
    wintypes.LPCVOID,
    ctypes.POINTER(MEMORY_BASIC_INFORMATION),
    ctypes.c_size_t,
]
kernel32.VirtualQueryEx.restype = ctypes.c_size_t


def protection_text(value):
    if not value:
        return ""
    parts = [PROTECTION_NAMES.get(value & 0xFF, f"UnknownBase(0x{value & 0xFF:X})")]
    if value & PAGE_GUARD:
        parts.append("Guard")
    if value & PAGE_NOCACHE:
        parts.append("NoCache")
    if value & PAGE_WRITECOMBINE:
        parts.append("WriteCombine")
    return "+".join(parts)


def format_address(value, width):
    return "" if value is None else f"0x{int(value):0{width}X}"


def iter_regions(process):
    system = SYSTEM_INFO()
    kernel32.GetSystemInfo(ctypes.byref(system))
    address = 0
    maximum = int(system.lpMaximumApplicationAddress)
    expected_size = ctypes.sizeof(MEMORY_BASIC_INFORMATION)
    while address <= maximum:
        region = MEMORY_BASIC_INFORMATION()
        written = kernel32.VirtualQueryEx(process, address, ctypes.byref(region), expected_size)
        if not written:
            raise ctypes.WinError(ctypes.get_last_error())
        if written < expected_size:
            raise RuntimeError(f"VirtualQueryEx returned {written} bytes, expected {expected_size}")
        base = int(region.BaseAddress or 0)
        size = int(region.RegionSize)
        if size <= 0:
            raise RuntimeError(f"VirtualQueryEx returned a zero-sized region at 0x{address:X}")
        yield region
        next_address = base + size
        if next_address <= address:
            raise RuntimeError("address traversal did not advance")
        address = next_address


def region_row(region, width):
    base = int(region.BaseAddress or 0)
    size = int(region.RegionSize)
    free = region.State == MEM_FREE
    return {
        "BaseAddress": format_address(base, width),
        "EndAddressInclusive": format_address(base + size - 1, width),
        "AllocationBase": "" if free else format_address(region.AllocationBase, width),
        "RegionSizeBytes": size,
        "RegionSizeKiB": f"{size / 1024:.2f}",
        "State": STATE_NAMES.get(region.State, f"Unknown(0x{region.State:X})"),
        "Protect": "" if region.State != MEM_COMMIT else protection_text(region.Protect),
        "AllocationProtect": "" if free else protection_text(region.AllocationProtect),
        "Type": "" if free or region.State == MEM_RESERVE else TYPE_NAMES.get(region.Type, f"Unknown(0x{region.Type:X})"),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("pid", type=int)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    if args.pid <= 0:
        parser.error("pid must be positive")
    width = ctypes.sizeof(ctypes.c_void_p) * 2
    process = win32api.OpenProcess(win32con.PROCESS_QUERY_INFORMATION, False, args.pid)
    try:
        fieldnames = list(region_row(MEMORY_BASIC_INFORMATION(), width))
        with args.output.open("w", newline="", encoding="utf-8") as stream:
            writer = csv.DictWriter(stream, fieldnames=fieldnames)
            writer.writeheader()
            count = 0
            for region in iter_regions(int(process)):
                writer.writerow(region_row(region, width))
                count += 1
    finally:
        win32api.CloseHandle(process)
    print(f"wrote {count} regions for PID {args.pid} to {args.output.resolve()}")
    print(f"observer pointer width: {width * 4} bits")


if __name__ == "__main__":
    main()
