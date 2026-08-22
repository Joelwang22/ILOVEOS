"""Create known process state for the ILOVEOS process-inventory lesson."""

import ctypes
import os
import platform
import tempfile
import threading


def waiting_worker(release, ready):
    print(f"worker native TID: {threading.get_native_id()}")
    ready.set()
    release.wait()


def main():
    release = threading.Event()
    ready = threading.Event()
    private_buffer = bytearray(16 * 1024 * 1024)
    for offset in range(0, len(private_buffer), 4096):
        private_buffer[offset] = 0x49

    with tempfile.TemporaryDirectory(prefix="ILOVEOS_process_") as temp_directory:
        path = os.path.join(temp_directory, "held_open.txt")
        held_file = open(path, "w+", encoding="utf-8")
        held_file.write("This file remains open during the first inspection phase.\n")
        held_file.flush()

        worker = threading.Thread(
            name="ILOVEOS-waiting-worker",
            target=waiting_worker,
            args=(release, ready),
        )
        worker.start()
        ready.wait()

        print(f"PID: {os.getpid()}")
        print(f"main native TID: {threading.get_native_id()}")
        print(f"Python architecture: {platform.architecture()[0]}")
        print(f"pointer width: {ctypes.sizeof(ctypes.c_void_p) * 8} bits")
        print(f"private buffer: {len(private_buffer):,} bytes")
        print(f"held-open path: {path}")
        input("Inspect the process now, then press Enter to close the file and worker...")

        held_file.close()
        release.set()
        worker.join()
        print("The file is closed and the explicit worker has terminated.")
        input("Refresh the tools, then press Enter to exit and remove the temporary files...")


if __name__ == "__main__":
    main()
