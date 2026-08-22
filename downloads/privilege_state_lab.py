"""Inspect one current-token privilege and optionally enable it temporarily."""

from __future__ import annotations

import argparse
import win32api
import win32con
import win32security


def find_state(token, target_luid):
    for luid, attributes in win32security.GetTokenInformation(
        token, win32security.TokenPrivileges
    ):
        if luid == target_luid:
            return attributes
    return None


parser = argparse.ArgumentParser()
parser.add_argument("privilege", nargs="?", default=win32security.SE_CHANGE_NOTIFY_NAME)
parser.add_argument("--enable", action="store_true")
args = parser.parse_args()

access = win32security.TOKEN_QUERY
if args.enable:
    access |= win32security.TOKEN_ADJUST_PRIVILEGES
token = win32security.OpenProcessToken(win32api.GetCurrentProcess(), access)
try:
    luid = win32security.LookupPrivilegeValue(None, args.privilege)
    before = find_state(token, luid)
    print(f"Privilege: {args.privilege}")
    print(f"Present: {before is not None}; attributes before: {before!r}")
    if args.enable:
        if before is None:
            print("Cannot enable it because the privilege is absent from this token.")
        else:
            previous = win32security.AdjustTokenPrivileges(
                token, False, [(luid, win32con.SE_PRIVILEGE_ENABLED)]
            )
            try:
                after = find_state(token, luid)
                print(f"Attributes while enabled: {after!r}")
            finally:
                win32security.AdjustTokenPrivileges(token, False, previous)
                print(f"Attributes restored: {find_state(token, luid)!r}")
    else:
        print("Read-only run. Add --enable for a temporary change with restoration.")
finally:
    win32api.CloseHandle(token)
