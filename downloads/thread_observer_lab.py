"""Create named Python workers and controlled file events for TID correlation."""

import os
import tempfile
import threading
from pathlib import Path


def worker(index, path, start_gate, ready_barrier, results):
    print(f"worker-{index} native TID: {threading.get_native_id()}")
    ready_barrier.wait()
    start_gate.wait()
    data = path.read_bytes()
    results[index] = len(data)


def main():
    start_gate = threading.Event()
    ready_barrier = threading.Barrier(4)
    results = {}
    with tempfile.TemporaryDirectory(prefix="ILOVEOS_threads_") as temp_directory:
        paths = []
        for index in range(3):
            path = Path(temp_directory, f"worker_{index}.txt")
            path.write_text((f"worker {index}\n" * 2048), encoding="utf-8")
            paths.append(path)

        workers = [
            threading.Thread(
                name=f"ILOVEOS-worker-{index}",
                target=worker,
                args=(index, path, start_gate, ready_barrier, results),
            )
            for index, path in enumerate(paths)
        ]
        print(f"PID: {os.getpid()}")
        print(f"main native TID: {threading.get_native_id()}")
        for path in paths:
            print(f"controlled path: {path}")
        for thread in workers:
            thread.start()
        ready_barrier.wait()
        input("Inspect the waiting workers and start Process Monitor, then press Enter...")
        start_gate.set()
        for thread in workers:
            thread.join()
        print(f"joined results: {dict(sorted(results.items()))}")


if __name__ == "__main__":
    main()
