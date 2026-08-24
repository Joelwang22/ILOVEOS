"""Audit a same-user token duplication without launching a child process.

This artifact performs a dry run only. Use it with a process and account you own.
"""

from __future__ import annotations

import argparse
import win32api
import win32con
import win32security


def sid_for(token):
    return win32security.GetTokenInformation(token, win32security.TokenUser)[0]


def same_sid(left, right) -> bool:
    return win32security.ConvertSidToStringSid(left) == win32security.ConvertSidToStringSid(right)


def close(handle, label: str) -> int:
    if handle is not None:
        win32api.CloseHandle(handle)
        print(f"Closed owned handle: {label}")
        return 1
    return 0


parser = argparse.ArgumentParser()
parser.add_argument("pid", type=int, help="PID of a process you own")
args = parser.parse_args()

process = source_token = current_token = primary = None
closed_handles = 0
try:
    process = win32api.OpenProcess(
        win32con.PROCESS_QUERY_LIMITED_INFORMATION, False, args.pid
    )
    source_token = win32security.OpenProcessToken(
        process, win32security.TOKEN_QUERY | win32security.TOKEN_DUPLICATE
    )
    current_token = win32security.OpenProcessToken(
        win32api.GetCurrentProcess(), win32security.TOKEN_QUERY
    )
    source_sid = sid_for(source_token)
    current_sid = sid_for(current_token)
    print(f"Source SID: {win32security.ConvertSidToStringSid(source_sid)}")
    print(f"Current SID: {win32security.ConvertSidToStringSid(current_sid)}")
    if not same_sid(source_sid, current_sid):
        raise SystemExit("Refusing a different-user token. Select a process you own.")

    desired = (
        win32security.TOKEN_QUERY
        | win32security.TOKEN_DUPLICATE
        | win32security.TOKEN_ASSIGN_PRIMARY
        | win32security.TOKEN_ADJUST_DEFAULT
        | win32con.TOKEN_ADJUST_SESSIONID
    )
    primary = win32security.DuplicateTokenEx(
        source_token,
        win32security.SecurityImpersonation,
        desired,
        win32security.TokenPrimary,
        None,
    )
    print("Created one owned primary-token duplicate.")
    print("Dry run evidence: child process created=no")
finally:
    closed_handles += close(primary, "primary token")
    closed_handles += close(current_token, "current process token")
    closed_handles += close(source_token, "source process token")
    closed_handles += close(process, "source process")
    print(f"Cleanup evidence: owned handles closed={closed_handles}")
