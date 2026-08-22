"""Create busy, timed-wait, and event-wait workers for state observation."""

import os
import threading


def busy_worker(stop, ready):
    print(f"busy native TID: {threading.get_native_id()}")
    ready.wait()
    value = 0
    while not stop.is_set():
        value = (value * 33 + 17) & 0xFFFFFFFF
    print(f"busy worker stopped with value {value}")


def delay_worker(stop, ready):
    print(f"delay native TID: {threading.get_native_id()}")
    ready.wait()
    stop.wait(30.0)
    print("delay worker finished")


def event_worker(signal, ready):
    print(f"event native TID: {threading.get_native_id()}")
    ready.wait()
    signal.wait()
    print("event worker observed its signal")


def main():
    ready = threading.Barrier(4)
    busy_stop = threading.Event()
    delay_stop = threading.Event()
    event_signal = threading.Event()
    workers = [
        threading.Thread(name="ILOVEOS-busy", target=busy_worker, args=(busy_stop, ready)),
        threading.Thread(name="ILOVEOS-delay", target=delay_worker, args=(delay_stop, ready)),
        threading.Thread(name="ILOVEOS-event", target=event_worker, args=(event_signal, ready)),
    ]
    print(f"PID: {os.getpid()}")
    print(f"main native TID: {threading.get_native_id()}")
    for worker in workers:
        worker.start()
    ready.wait()
    try:
        input("Inspect all three workers, then press Enter to signal the event worker...")
        event_signal.set()
        workers[2].join()
        input("Refresh the tools, then press Enter to release the delay and busy workers...")
    finally:
        event_signal.set()
        delay_stop.set()
        busy_stop.set()
        for worker in workers:
            worker.join()
    print("all explicit workers joined")


if __name__ == "__main__":
    main()
