"""Create or open one named Windows event for the ILOVEOS Object Manager lab."""

import argparse
import os

import pywintypes
import win32con
import win32event


EVENT_NAME = r"Local\ILOVEOS_ObjectLab"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=("creator", "opener"))
    args = parser.parse_args()

    handle = None
    try:
        if args.mode == "creator":
            handle = win32event.CreateEvent(None, True, False, EVENT_NAME)
        else:
            handle = win32event.OpenEvent(win32con.SYNCHRONIZE, False, EVENT_NAME)
        print(f"mode: {args.mode}")
        print(f"PID: {os.getpid()}")
        print(f"name: {EVENT_NAME}")
        print(f"process-local handle value: {int(handle)}")
        input("Inspect WinObj and Process Explorer, then press Enter to close this handle...")
    except pywintypes.error as error:
        print(f"Windows error {error.winerror} from {error.funcname}: {error.strerror}")
        raise
    finally:
        if handle is not None:
            handle.Close()
            print("handle closed")


if __name__ == "__main__":
    main()
