"""Audit a same-user token duplication and optional process launch.

The default is a dry run. Use only with a process and account you own in a VM.
"""

from __future__ import annotations

import argparse
import win32api
import win32con
import win32process
import win32security


def sid_for(token):
    return win32security.GetTokenInformation(token, win32security.TokenUser)[0]


def same_sid(left, right) -> bool:
    return win32security.ConvertSidToStringSid(left) == win32security.ConvertSidToStringSid(right)


def close(handle) -> None:
    if handle is not None:
        win32api.CloseHandle(handle)


parser = argparse.ArgumentParser()
parser.add_argument("pid", type=int, help="PID of a process you own")
parser.add_argument("command", nargs="?", default="notepad.exe")
parser.add_argument("--launch", action="store_true")
args = parser.parse_args()

process = source_token = current_token = primary = child_process = child_thread = None
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
    if not args.launch:
        print("Dry run complete. Add --launch only after reviewing the source and command.")
    else:
        startup = win32process.STARTUPINFO()
        child_process, child_thread, child_pid, child_tid = win32process.CreateProcessAsUser(
            primary,
            None,
            args.command,
            None,
            None,
            False,
            win32con.CREATE_NEW_CONSOLE,
            None,
            None,
            startup,
        )
        print(f"Created PID {child_pid}, TID {child_tid}")
finally:
    close(child_thread)
    close(child_process)
    close(primary)
    close(current_token)
    close(source_token)
    close(process)
