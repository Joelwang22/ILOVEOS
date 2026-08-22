"""Limit concurrent workers with a Win32 semaphore."""

import argparse
import logging
import threading
import time

import pywintypes
import win32api
import win32event


SEMAPHORE_NAME = r"Local\ILOVEOS_CapacityLab"
logging.basicConfig(level=logging.INFO, format="%(threadName)s: %(message)s")
log = logging.getLogger("semaphore-lab")


def run(capacity: int, workers: int, timeout_ms: int) -> None:
    semaphore = None
    state_lock = threading.Lock()
    active = 0
    peak = 0

    def worker() -> None:
        nonlocal active, peak
        acquired = False
        result = win32event.WaitForSingleObject(semaphore, timeout_ms)
        if result == win32event.WAIT_TIMEOUT:
            log.info("timed out, no permit acquired")
            return
        if result != win32event.WAIT_OBJECT_0:
            raise RuntimeError(f"unexpected wait result: {result}")
        acquired = True
        try:
            with state_lock:
                active += 1
                peak = max(peak, active)
                assert active <= capacity
                log.info("entered, active=%d", active)
            time.sleep(0.4)
        finally:
            with state_lock:
                active -= 1
                log.info("leaving, active=%d", active)
            if acquired:
                previous_count = win32event.ReleaseSemaphore(semaphore, 1)
                log.info("released, previous available count=%d", previous_count)

    try:
        semaphore = win32event.CreateSemaphore(None, capacity, capacity, SEMAPHORE_NAME)
        threads = [threading.Thread(target=worker, name=f"worker-{i + 1}") for i in range(workers)]
        input("Inspect the semaphore handle, then press Enter to start workers...")
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join()
        print(f"peak active: {peak}, capacity: {capacity}")
    except pywintypes.error as error:
        raise SystemExit(f"Windows error {error.winerror} from {error.funcname}: {error.strerror}")
    finally:
        if semaphore is not None:
            win32api.CloseHandle(semaphore)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--capacity", type=int, default=3)
    parser.add_argument("--workers", type=int, default=10)
    parser.add_argument("--timeout-ms", type=int, default=5_000)
    args = parser.parse_args()
    if min(args.capacity, args.workers) < 1 or args.timeout_ms < 0:
        raise SystemExit("capacity and workers must be positive, timeout must not be negative")
    run(args.capacity, args.workers, args.timeout_ms)


if __name__ == "__main__":
    main()
