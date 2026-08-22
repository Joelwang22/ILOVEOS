"""Compare predictable and permuted cache-line access over one bytearray."""

import argparse
import math
import os
import platform
import time


def scan_sequential(buffer, line_size):
    checksum = 0
    visits = 0
    for index in range(0, len(buffer), line_size):
        checksum += buffer[index]
        visits += 1
    return checksum, visits


def scan_strided(buffer, line_size, stride_lines):
    line_count = len(buffer) // line_size
    checksum = 0
    for visit in range(line_count):
        line = (visit * stride_lines) % line_count
        checksum += buffer[line * line_size]
    return checksum, line_count


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mib", type=int, default=64)
    parser.add_argument("--mode", choices=("sequential", "strided"), required=True)
    parser.add_argument("--line-size", type=int, default=64)
    parser.add_argument("--stride-lines", type=int, default=8191)
    args = parser.parse_args()
    if not 1 <= args.mib <= 512:
        parser.error("--mib must be between 1 and 512")
    if args.line_size <= 0 or args.line_size & (args.line_size - 1):
        parser.error("--line-size must be a positive power of two")

    byte_count = args.mib * 1024 * 1024
    byte_count -= byte_count % args.line_size
    line_count = byte_count // args.line_size
    if math.gcd(args.stride_lines, line_count) != 1:
        parser.error("--stride-lines must be coprime with the cache-line count")

    buffer = bytearray([1]) * byte_count
    print(f"PID: {os.getpid()}")
    print(f"Python: {platform.python_version()} ({platform.architecture()[0]})")
    print(f"buffer: {byte_count} bytes ({args.mib} MiB)")
    print(f"mode: {args.mode}")
    print(f"sampled lines: {line_count}")

    started = time.perf_counter()
    if args.mode == "sequential":
        checksum, visits = scan_sequential(buffer, args.line_size)
    else:
        checksum, visits = scan_strided(buffer, args.line_size, args.stride_lines)
    elapsed = time.perf_counter() - started

    print(f"checksum: {checksum}")
    print(f"visits: {visits}")
    print(f"elapsed: {elapsed * 1000:.3f} ms")
    print(f"million visits per second: {visits / elapsed / 1_000_000:.3f}")


if __name__ == "__main__":
    main()
