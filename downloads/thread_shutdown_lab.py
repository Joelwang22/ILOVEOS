"""Demonstrate cooperative cancellation, cleanup, joining, and failure propagation."""

import argparse
import os
import queue
import sys
import threading
import time
from pathlib import Path


def worker(worker_id, stop, errors, report, report_lock, fail):
    print(f"worker-{worker_id} native TID: {threading.get_native_id()}")
    try:
        for unit in range(20):
            if stop.wait(0.08):
                break
            if fail and worker_id == 1 and unit == 4:
                raise RuntimeError("injected worker-1 failure")
            with report_lock:
                report.write(f"worker={worker_id} unit={unit}\n")
                report.flush()
    except BaseException as error:
        errors.put(error)
        stop.set()
    finally:
        with report_lock:
            report.write(f"worker={worker_id} cleanup\n")
            report.flush()
        print(f"worker-{worker_id} cleanup complete")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=("normal", "fail"))
    parser.add_argument("--output", type=Path, default=Path("thread_shutdown_report.log"))
    args = parser.parse_args()
    stop = threading.Event()
    errors = queue.Queue()
    report_lock = threading.Lock()
    workers = []
    print(f"PID: {os.getpid()}")
    with args.output.open("w", encoding="utf-8") as report:
        for worker_id in range(3):
            thread = threading.Thread(
                name=f"ILOVEOS-shutdown-{worker_id}",
                target=worker,
                args=(worker_id, stop, errors, report, report_lock, args.mode == "fail"),
            )
            workers.append(thread)
            thread.start()
        if args.mode == "normal":
            time.sleep(0.7)
            print("main requests cooperative stop")
            stop.set()
        for thread in workers:
            thread.join()
        print("all workers joined; main can close the report")
    if not errors.empty():
        error = errors.get()
        print(f"worker failure propagated to main: {error}")
        return 1
    print("normal completion")
    return 0


if __name__ == "__main__":
    sys.exit(main())
