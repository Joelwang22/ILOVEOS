"""Starter for the Find Python inside Windows guided investigation."""

import win32api


pid = win32api.GetCurrentProcessId()
user = win32api.GetUserName()

print(f"{user} is running process {pid}")
input("Press Enter after you finish inspecting this process...")
