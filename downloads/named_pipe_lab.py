"""Run a bounded local named-pipe server or client with explicit framing."""

import argparse
import struct

import pywintypes
import win32api
import win32con
import win32file
import win32pipe
import winerror


PIPE_NAME = r"\\.\pipe\ILOVEOS_MessageLab"
BUFFER_SIZE = 64
MAX_MESSAGE = 4096
WAIT_TIMEOUT_MS = 5000
ENCODING = "utf-8"


def encode_frame(text: str) -> bytes:
    payload = text.encode(ENCODING)
    if len(payload) > MAX_MESSAGE:
        raise ValueError(f"payload exceeds {MAX_MESSAGE} bytes")
    return struct.pack("<I", len(payload)) + payload


def decode_frame(frame: bytes) -> str:
    if len(frame) < 4:
        raise ValueError("frame is shorter than its length header")
    (declared_length,) = struct.unpack("<I", frame[:4])
    if declared_length > MAX_MESSAGE:
        raise ValueError("declared payload exceeds the protocol maximum")
    payload = frame[4:]
    if len(payload) != declared_length:
        raise ValueError(f"declared {declared_length} bytes but received {len(payload)}")
    return payload.decode(ENCODING)


def write_message(pipe_handle, frame: bytes) -> None:
    status, bytes_written = win32file.WriteFile(pipe_handle, frame)
    if status != 0 or bytes_written != len(frame):
        raise OSError(status, f"partial message write: {bytes_written} of {len(frame)} bytes")


def read_message(pipe_handle) -> bytes:
    chunks = []
    total = 0
    while True:
        try:
            status, chunk = win32file.ReadFile(pipe_handle, BUFFER_SIZE)
        except pywintypes.error as error:
            if error.winerror == winerror.ERROR_MORE_DATA:
                chunk = error.args[2] if len(error.args) > 2 and isinstance(error.args[2], bytes) else b""
                status = winerror.ERROR_MORE_DATA
            else:
                raise
        chunks.append(bytes(chunk))
        total += len(chunk)
        if total > MAX_MESSAGE + 4:
            raise ValueError("framed message exceeds the protocol maximum")
        if status == 0:
            return b"".join(chunks)
        if status != winerror.ERROR_MORE_DATA:
            raise OSError(status, "unexpected pipe read status")


def server() -> None:
    pipe_handle = None
    connected = False
    try:
        pipe_handle = win32pipe.CreateNamedPipe(
            PIPE_NAME,
            win32pipe.PIPE_ACCESS_DUPLEX,
            win32pipe.PIPE_TYPE_MESSAGE | win32pipe.PIPE_READMODE_MESSAGE | win32pipe.PIPE_WAIT,
            1,
            BUFFER_SIZE,
            BUFFER_SIZE,
            WAIT_TIMEOUT_MS,
            None,
        )
        print(f"server created {PIPE_NAME}")
        input("Inspect Process Monitor and Handle, then press Enter to accept a client...")
        try:
            win32pipe.ConnectNamedPipe(pipe_handle, None)
            connected = True
        except pywintypes.error as error:
            if error.winerror == winerror.ERROR_PIPE_CONNECTED:
                connected = True
            else:
                raise
        request = decode_frame(read_message(pipe_handle))
        print(f"server received: {request!r}")
        write_message(pipe_handle, encode_frame(f"Hello, {request}"))
        win32file.FlushFileBuffers(pipe_handle)
    finally:
        if pipe_handle is not None:
            if connected:
                try:
                    win32pipe.DisconnectNamedPipe(pipe_handle)
                except pywintypes.error:
                    pass
            win32api.CloseHandle(pipe_handle)


def client(message: str, timeout_ms: int) -> None:
    pipe_handle = None
    try:
        win32pipe.WaitNamedPipe(PIPE_NAME, timeout_ms)
        pipe_handle = win32file.CreateFile(
            PIPE_NAME,
            win32con.GENERIC_READ | win32con.GENERIC_WRITE,
            0,
            None,
            win32con.OPEN_EXISTING,
            0,
            None,
        )
        win32pipe.SetNamedPipeHandleState(
            pipe_handle, win32pipe.PIPE_READMODE_MESSAGE, None, None
        )
        write_message(pipe_handle, encode_frame(message))
        response = decode_frame(read_message(pipe_handle))
        print(f"client received: {response!r}")
    finally:
        if pipe_handle is not None:
            win32api.CloseHandle(pipe_handle)


def main() -> None:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="role", required=True)
    subparsers.add_parser("server")
    client_parser = subparsers.add_parser("client")
    client_parser.add_argument("message", nargs="?", default="Heisenberg")
    client_parser.add_argument("--timeout-ms", type=int, default=WAIT_TIMEOUT_MS)
    args = parser.parse_args()
    try:
        if args.role == "server":
            server()
        elif args.timeout_ms < 0:
            raise ValueError("timeout must not be negative")
        else:
            client(args.message, args.timeout_ms)
    except pywintypes.error as error:
        raise SystemExit(f"Windows error {error.winerror} from {error.funcname}: {error.strerror}")
    except (OSError, ValueError, UnicodeError) as error:
        raise SystemExit(f"Named-pipe error: {error}")


if __name__ == "__main__":
    main()
