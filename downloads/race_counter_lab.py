"""Expose a lost update with a controlled schedule, then protect it."""

import argparse
import threading
import time


def run(mode: str, workers: int) -> None:
    counter = 0
    print_lock = threading.Lock()
    update_lock = threading.Lock()
    read_barrier = threading.Barrier(workers) if mode == "controlled" else None

    def log(message: str) -> None:
        with print_lock:
            print(f"{threading.current_thread().name}: {message}")

    def unsafe_controlled() -> None:
        nonlocal counter
        observed = counter
        log(f"read {observed}")
        read_barrier.wait()
        counter = observed + 1
        log(f"wrote {observed + 1}")

    def unsafe_free() -> None:
        nonlocal counter
        observed = counter
        time.sleep(0)
        counter = observed + 1

    def locked() -> None:
        nonlocal counter
        with update_lock:
            observed = counter
            time.sleep(0)
            counter = observed + 1
            log(f"changed {observed} to {counter}")

    target = {
        "controlled": unsafe_controlled,
        "free": unsafe_free,
        "locked": locked,
    }[mode]
    threads = [threading.Thread(target=target, name=f"worker-{index + 1}") for index in range(workers)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()

    print(f"mode: {mode}")
    print(f"expected: {workers}")
    print(f"actual: {counter}")
    if mode == "locked":
        assert counter == workers


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=("controlled", "free", "locked"))
    parser.add_argument("--workers", type=int, default=2)
    args = parser.parse_args()
    if args.workers < 2:
        raise SystemExit("workers must be at least 2")
    run(args.mode, args.workers)


if __name__ == "__main__":
    main()
