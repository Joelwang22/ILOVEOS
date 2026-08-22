"""Coordinate a party gate and cake transaction with Win32 objects."""

import argparse
import logging
import threading
import time

import pywintypes
import win32api
import win32event


EVENT_NAME = r"Local\ILOVEOS_PartyGateLab"
MUTEX_NAME = r"Local\ILOVEOS_CakeMutexLab"
GUESTS = ("Ava", "Ben", "Chen", "Devi", "Eli")

logging.basicConfig(level=logging.INFO, format="%(threadName)s: %(message)s")
log = logging.getLogger("party-lab")


def wait_for_mutex(mutex, timeout_ms: int) -> tuple[bool, bool]:
    result = win32event.WaitForSingleObject(mutex, timeout_ms)
    if result == win32event.WAIT_OBJECT_0:
        return True, False
    if result == win32event.WAIT_ABANDONED:
        return True, True
    if result == win32event.WAIT_TIMEOUT:
        return False, False
    raise RuntimeError(f"unexpected mutex wait result: {result}")


def run(cake_pieces: int, mutex_timeout_ms: int) -> None:
    gate = None
    mutex = None
    guests = []
    state = {"cake": cake_pieces}

    def guest(name: str) -> None:
        log.info("waiting at the gate")
        gate_result = win32event.WaitForSingleObject(gate, win32event.INFINITE)
        if gate_result != win32event.WAIT_OBJECT_0:
            raise RuntimeError(f"unexpected event wait result: {gate_result}")
        acquired = False
        try:
            acquired, abandoned = wait_for_mutex(mutex, mutex_timeout_ms)
            if not acquired:
                log.info("timed out before acquiring cake mutex")
                return
            if abandoned:
                log.warning("mutex abandoned, validate shared state before continuing")
                if state["cake"] < 0 or state["cake"] > cake_pieces:
                    raise RuntimeError("cake state failed validation")
            if state["cake"] > 0:
                time.sleep(0.35)
                state["cake"] -= 1
                log.info("ate cake, %d pieces remain", state["cake"])
            else:
                log.info("no cake remains")
        finally:
            if acquired:
                win32event.ReleaseMutex(mutex)

    try:
        gate = win32event.CreateEvent(None, True, False, EVENT_NAME)
        mutex = win32event.CreateMutex(None, False, MUTEX_NAME)
        guests = [threading.Thread(target=guest, args=(name,), name=name) for name in GUESTS]
        for thread in guests:
            thread.start()
        input("Inspect the waiting threads, then press Enter to open the gate...")
        win32event.SetEvent(gate)
        for thread in guests:
            thread.join()
        print(f"final cake count: {state['cake']}")
        assert state["cake"] >= 0
    except pywintypes.error as error:
        raise SystemExit(f"Windows error {error.winerror} from {error.funcname}: {error.strerror}")
    finally:
        if gate is not None:
            try:
                win32event.SetEvent(gate)
            except pywintypes.error:
                pass
        for thread in guests:
            if thread.is_alive():
                thread.join(timeout=5)
        if mutex is not None:
            win32api.CloseHandle(mutex)
        if gate is not None:
            win32api.CloseHandle(gate)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cake", type=int, default=3)
    parser.add_argument("--mutex-timeout-ms", type=int, default=5_000)
    args = parser.parse_args()
    if args.cake < 0 or args.mutex_timeout_ms < 0:
        raise SystemExit("cake and timeout must not be negative")
    run(args.cake, args.mutex_timeout_ms)


if __name__ == "__main__":
    main()
