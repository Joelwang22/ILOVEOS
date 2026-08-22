"""Stage a three-page reservation, commitment, protection change, and release."""

import ctypes
import os
from ctypes import wintypes


MEM_COMMIT = 0x1000
MEM_RESERVE = 0x2000
MEM_RELEASE = 0x8000
PAGE_NOACCESS = 0x01
PAGE_READONLY = 0x02
PAGE_READWRITE = 0x04


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


kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
kernel32.GetSystemInfo.argtypes = [ctypes.POINTER(SYSTEM_INFO)]
kernel32.GetSystemInfo.restype = None
kernel32.VirtualAlloc.argtypes = [wintypes.LPVOID, ctypes.c_size_t, wintypes.DWORD, wintypes.DWORD]
kernel32.VirtualAlloc.restype = wintypes.LPVOID
kernel32.VirtualProtect.argtypes = [wintypes.LPVOID, ctypes.c_size_t, wintypes.DWORD, ctypes.POINTER(wintypes.DWORD)]
kernel32.VirtualProtect.restype = wintypes.BOOL
kernel32.VirtualFree.argtypes = [wintypes.LPVOID, ctypes.c_size_t, wintypes.DWORD]
kernel32.VirtualFree.restype = wintypes.BOOL


def alloc_checked(address, size, allocation_type, protection):
    result = kernel32.VirtualAlloc(address, size, allocation_type, protection)
    if not result:
        raise ctypes.WinError(ctypes.get_last_error())
    return int(result)


def main():
    system = SYSTEM_INFO()
    kernel32.GetSystemInfo(ctypes.byref(system))
    page_size = system.dwPageSize
    region_size = 3 * page_size
    base = None
    print(f"PID: {os.getpid()}")
    print(f"page size: 0x{page_size:X} ({page_size} bytes)")
    print(f"allocation granularity: 0x{system.dwAllocationGranularity:X}")

    try:
        base = alloc_checked(None, region_size, MEM_RESERVE, PAGE_NOACCESS)
        print(f"reserved base: 0x{base:X}")
        print(f"page addresses: {[f'0x{base + i * page_size:X}' for i in range(3)]}")
        input("Inspect the reserved range, then press Enter to commit page 0...")

        page0 = alloc_checked(base, page_size, MEM_COMMIT, PAGE_READWRITE)
        ctypes.c_ubyte.from_address(page0).value = 0x41
        print(f"page 0 committed and touched at 0x{page0:X}")
        input("Inspect committed page 0, then press Enter to commit page 1...")

        page1_address = base + page_size
        page1 = alloc_checked(page1_address, page_size, MEM_COMMIT, PAGE_READWRITE)
        ctypes.c_ubyte.from_address(page1).value = 0x42
        print(f"page 1 committed and touched at 0x{page1:X}")
        input("Inspect both committed pages, then press Enter to make page 1 read-only...")

        old_protection = wintypes.DWORD()
        if not kernel32.VirtualProtect(page1, page_size, PAGE_READONLY, ctypes.byref(old_protection)):
            raise ctypes.WinError(ctypes.get_last_error())
        print(f"page 1 old protection: 0x{old_protection.value:X}")
        print("page 1 is now read-only; the starter will not write through it")
        input("Inspect the final mixed state, then press Enter to release the reservation...")
    finally:
        if base is not None:
            if not kernel32.VirtualFree(base, 0, MEM_RELEASE):
                raise ctypes.WinError(ctypes.get_last_error())
            print(f"released full reservation at 0x{base:X}")


if __name__ == "__main__":
    main()
