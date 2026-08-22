"""Disposable CPU worker for a reversible Process Explorer priority experiment."""

import argparse
import os
import threading
import time


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--seconds", type=float, default=60.0)
    args = parser.parse_args()
    if args.seconds <= 0:
        parser.error("--seconds must be positive")
    print(f"PID: {os.getpid()}")
    print(f"native TID: {threading.get_native_id()}")
    print("Change only this disposable process in Process Explorer. Avoid High and Real Time.")
    started = time.perf_counter()
    next_report = started + 1.0
    units = 0
    value = 1
    try:
        while time.perf_counter() - started < args.seconds:
            for _ in range(100_000):
                value = (value * 1664525 + 1013904223) & 0xFFFFFFFF
            units += 1
            now = time.perf_counter()
            if now >= next_report:
                print(f"elapsed={now - started:6.1f}s completed_units={units}")
                next_report = now + 1.0
    except KeyboardInterrupt:
        print("stop requested")
    print(f"final units={units} checksum={value}")


if __name__ == "__main__":
    main()
