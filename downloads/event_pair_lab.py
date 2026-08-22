"""Act as the creator or waiter for one named Win32 event."""

import argparse

import pywintypes
import win32api
import win32con
import win32event
import winerror


EVENT_NAME = r"Local\ILOVEOS_InvitationLab"


def creator(manual_reset: bool) -> None:
    event = None
    try:
        event = win32event.CreateEvent(None, manual_reset, False, EVENT_NAME)
        print(f"created {EVENT_NAME}, manual_reset={manual_reset}, initially signaled=False")
        input("Start waiter processes, inspect handles, then press Enter to signal...")
        win32event.SetEvent(event)
        print("event signaled")
        input("Test a late waiter if desired, then press Enter to close the creator handle...")
    finally:
        if event is not None:
            win32api.CloseHandle(event)


def waiter(timeout_ms: int) -> None:
    event = None
    try:
        event = win32event.OpenEvent(win32con.SYNCHRONIZE, False, EVENT_NAME)
        print(f"opened {EVENT_NAME}, waiting for at most {timeout_ms} ms")
        result = win32event.WaitForSingleObject(event, timeout_ms)
        if result == win32event.WAIT_OBJECT_0:
            print("invitation received")
        elif result == win32event.WAIT_TIMEOUT:
            print("invitation timed out")
        else:
            raise RuntimeError(f"unexpected event wait result: {result}")
    except pywintypes.error as error:
        if error.winerror == winerror.ERROR_FILE_NOT_FOUND:
            raise SystemExit("event not found, start creator mode first")
        raise SystemExit(f"Windows error {error.winerror} from {error.funcname}: {error.strerror}")
    finally:
        if event is not None:
            win32api.CloseHandle(event)


def main() -> None:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="role", required=True)
    creator_parser = subparsers.add_parser("creator")
    creator_parser.add_argument("--auto-reset", action="store_true")
    waiter_parser = subparsers.add_parser("waiter")
    waiter_parser.add_argument("--timeout-ms", type=int, default=5_000)
    args = parser.parse_args()
    if args.role == "creator":
        creator(not args.auto_reset)
    elif args.timeout_ms < 0:
        raise SystemExit("timeout must not be negative")
    else:
        waiter(args.timeout_ms)


if __name__ == "__main__":
    main()
