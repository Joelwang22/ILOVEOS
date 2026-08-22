"""Instrumented version of the supplied prime-thread partitioning exercise."""

import argparse
import math
import os
import threading
import time


def is_prime(number):
    if number < 2:
        return False
    for divisor in range(2, math.isqrt(number) + 1):
        if number % divisor == 0:
            return False
    return True


def find_primes(worker_id, limit, worker_count, results, native_ids):
    native_ids[worker_id] = threading.get_native_id()
    for number in range(2 + worker_id, limit + 1, worker_count):
        if is_prime(number):
            results[worker_id].append(number)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("limit", type=int)
    parser.add_argument("workers", type=int)
    parser.add_argument("--show", action="store_true", help="print every prime after timing")
    args = parser.parse_args()
    if args.limit < 2:
        parser.error("limit must be at least 2")
    if not 1 <= args.workers <= 256:
        parser.error("workers must be between 1 and 256")

    results = [[] for _ in range(args.workers)]
    native_ids = [None] * args.workers
    threads = []
    started = time.perf_counter()
    for worker_id in range(args.workers):
        thread = threading.Thread(
            name=f"prime-worker-{worker_id}",
            target=find_primes,
            args=(worker_id, args.limit, args.workers, results, native_ids),
        )
        threads.append(thread)
        thread.start()
    for thread in threads:
        thread.join()
    primes = sorted(prime for worker_result in results for prime in worker_result)
    elapsed_ms = (time.perf_counter() - started) * 1000

    print(f"PID: {os.getpid()}")
    print(f"worker native TIDs: {native_ids}")
    print(f"prime count: {len(primes)}")
    print(f"elapsed excluding prime printing: {elapsed_ms:.3f} ms")
    if args.show:
        print(*primes, sep="\n")


if __name__ == "__main__":
    main()
