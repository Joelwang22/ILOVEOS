"""Compare process architecture and selected Registry views without writing."""

import ctypes
import platform
import struct
import winreg


def read_view(flag: int):
    path = r"SOFTWARE\Microsoft\Windows NT\CurrentVersion"
    with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, path, 0, winreg.KEY_READ | flag) as key:
        return winreg.QueryValueEx(key, "ProductName")


print(f"Python pointer width: {struct.calcsize('P') * 8}")
print(f"Python machine label: {platform.machine()}")
print(f"Native machine label: {platform.uname().machine}")
buffer = ctypes.create_unicode_buffer(260)
length = ctypes.windll.kernel32.GetWindowsDirectoryW(buffer, len(buffer))
print(f"Windows directory: {buffer.value if length else '(query failed)'}")

for label, flag in (
    ("32-bit Registry view", winreg.KEY_WOW64_32KEY),
    ("64-bit Registry view", winreg.KEY_WOW64_64KEY),
):
    try:
        value, value_type = read_view(flag)
        print(f"{label}: {value!r}, type={value_type}")
    except OSError as exc:
        print(f"{label}: unavailable ({exc})")

print(r"Capture this process in Process Monitor to see the resolved Registry paths.")
