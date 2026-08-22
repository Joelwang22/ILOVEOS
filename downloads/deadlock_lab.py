"""Construct a bounded two-lock cycle, then remove it with one lock order."""

import argparse
import threading


def run(mode: str) -> None:
    locks = {"one": threading.Lock(), "two": threading.Lock()}
    first_lock_barrier = threading.Barrier(2)
    print_lock = threading.Lock()

    def log(message: str) -> None:
        with print_lock:
            print(f"{threading.current_thread().name}: {message}")

    def worker(first_name: str, second_name: str) -> None:
        if mode == "ordered":
            first_name, second_name = "one", "two"
        first = locks[first_name]
        second = locks[second_name]
        with first:
            log(f"owns {first_name}")
            if mode == "deadlock":
                first_lock_barrier.wait()
            log(f"waiting for {second_name}")
            acquired_second = second.acquire(timeout=2)
            if not acquired_second:
                log(f"timed out waiting for {second_name}, cycle exposed")
                return
            try:
                log(f"owns {first_name} and {second_name}")
            finally:
                second.release()

    pairs = (("one", "two"), ("two", "one"))
    threads = [threading.Thread(target=worker, args=pair, name=f"worker-{i + 1}") for i, pair in enumerate(pairs)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join(timeout=5)
    if any(thread.is_alive() for thread in threads):
        raise RuntimeError("worker did not finish within the cleanup deadline")
    print(f"mode {mode} completed")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=("deadlock", "ordered"))
    run(parser.parse_args().mode)


if __name__ == "__main__":
    main()
