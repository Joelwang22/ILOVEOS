"""Survey the current process address space without changing any memory."""

import argparse
import ctypes
import os
from collections import Counter
from ctypes import wintypes


MEM_COMMIT = 0x1000
MEM_PRIVATE = 0x20000
MEM_MAPPED = 0x40000
MEM_IMAGE = 0x1000000

PAGE_EXECUTE = 0x10
PAGE_EXECUTE_READ = 0x20
PAGE_EXECUTE_READWRITE = 0x40
PAGE_EXECUTE_WRITECOPY = 0x80
EXECUTE_BASE_PROTECTIONS = {
    PAGE_EXECUTE,
    PAGE_EXECUTE_READ,
    PAGE_EXECUTE_READWRITE,
    PAGE_EXECUTE_WRITECOPY,
}

TYPE_NAMES = {
    MEM_PRIVATE: "MEM_PRIVATE",
    MEM_MAPPED: "MEM_MAPPED",
    MEM_IMAGE: "MEM_IMAGE",
}


class _PROCESSOR_WORDS(ctypes.Structure):
    _fields_ = [("wProcessorArchitecture", wintypes.WORD), ("wReserved", wintypes.WORD)]


class _PROCESSOR_INFO(ctypes.Union):
    _anonymous_ = ("words",)
    _fields_ = [("dwOemId", wintypes.DWORD), ("words", _PROCESSOR_WORDS)]


class SYSTEM_INFO(ctypes.Structure):
    _anonymous_ = ("processor",)
    _fields_ = [
        ("processor", _PROCESSOR_INFO),
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
kernel32.GetCurrentProcess.argtypes = []
kernel32.GetCurrentProcess.restype = wintypes.HANDLE
kernel32.GetNativeSystemInfo.argtypes = [ctypes.POINTER(SYSTEM_INFO)]
kernel32.GetNativeSystemInfo.restype = None
kernel32.VirtualQueryEx.argtypes = [
    wintypes.HANDLE,
    wintypes.LPCVOID,
    ctypes.POINTER(MEMORY_BASIC_INFORMATION),
    ctypes.c_size_t,
]
kernel32.VirtualQueryEx.restype = ctypes.c_size_t


def pointer_value(value) -> int:
    return int(value or 0)


def is_executable(protect: int) -> bool:
    return protect & 0xFF in EXECUTE_BASE_PROTECTIONS


def walk_regions():
    system = SYSTEM_INFO()
    kernel32.GetNativeSystemInfo(ctypes.byref(system))
    process = kernel32.GetCurrentProcess()
    address = pointer_value(system.lpMinimumApplicationAddress)
    maximum = pointer_value(system.lpMaximumApplicationAddress)

    while address <= maximum:
        information = MEMORY_BASIC_INFORMATION()
        result = kernel32.VirtualQueryEx(
            process,
            ctypes.c_void_p(address),
            ctypes.byref(information),
            ctypes.sizeof(information),
        )
        if result == 0:
            address += system.dwPageSize
            continue
        base = pointer_value(information.BaseAddress)
        size = int(information.RegionSize)
        if size <= 0:
            raise RuntimeError(f"VirtualQueryEx returned a zero region at 0x{address:X}")
        yield information
        next_address = base + size
        if next_address <= address:
            raise RuntimeError("address-space walk made no forward progress")
        address = next_address


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--no-pause",
        action="store_true",
        help="exit after printing the report, useful for automated checks",
    )
    args = parser.parse_args()
    counts = Counter()
    bytes_by_type = Counter()
    executable = []

    for information in walk_regions():
        if information.State != MEM_COMMIT:
            continue
        type_name = TYPE_NAMES.get(information.Type, f"TYPE_0x{information.Type:X}")
        counts[type_name] += 1
        bytes_by_type[type_name] += int(information.RegionSize)
        if is_executable(information.Protect):
            executable.append(information)

    print(f"PID: {os.getpid()}")
    print(f"pointer width: {ctypes.sizeof(ctypes.c_void_p) * 8} bits")
    print("committed regions by type:")
    for name in sorted(counts):
        print(f"  {name:<12} regions={counts[name]:>5} bytes=0x{bytes_by_type[name]:X}")

    print(f"executable committed regions: {len(executable)}")
    for information in executable[:80]:
        print(
            f"  base=0x{pointer_value(information.BaseAddress):016X} "
            f"size=0x{int(information.RegionSize):X} "
            f"type={TYPE_NAMES.get(information.Type, hex(information.Type))} "
            f"protect=0x{information.Protect:X}"
        )
    if len(executable) > 80:
        print(f"  ... {len(executable) - 80} more executable regions omitted")
    if not args.no_pause:
        input("Compare this process with VMMap, then press Enter to exit...")


if __name__ == "__main__":
    main()
