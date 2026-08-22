"""Run one or more Windows commands as a handle-audited pipeline."""

import argparse
import locale

import pywintypes
import win32api
import win32con
import win32event
import win32file
import win32pipe
import win32process
import win32security
import winerror


READ_BUFFER_SIZE = 4096
STD_INPUT_HANDLE = -10
STD_ERROR_HANDLE = -12


def close_handle(handle, label: str) -> None:
    if handle is not None:
        win32api.CloseHandle(handle)
        print(f"parent closed {label}")


def inheritable_pipe():
    attributes = win32security.SECURITY_ATTRIBUTES()
    attributes.bInheritHandle = True
    return win32pipe.CreatePipe(attributes, 0)


def set_inheritable(handle, inheritable: bool) -> None:
    flags = win32con.HANDLE_FLAG_INHERIT if inheritable else 0
    win32api.SetHandleInformation(handle, win32con.HANDLE_FLAG_INHERIT, flags)


def startup(stdin_handle, stdout_handle, stderr_handle):
    info = win32process.STARTUPINFO()
    info.dwFlags |= win32con.STARTF_USESTDHANDLES
    info.hStdInput = stdin_handle
    info.hStdOutput = stdout_handle
    info.hStdError = stderr_handle
    return info


def create_child(command: str, startup_info):
    return win32process.CreateProcess(
        None, command, None, None, True, 0, None, None, startup_info
    )


def read_until_eof(read_handle) -> bytes:
    chunks = []
    while True:
        try:
            status, chunk = win32file.ReadFile(read_handle, READ_BUFFER_SIZE)
            if status != 0:
                raise OSError(status, "unexpected synchronous ReadFile status")
            if chunk:
                chunks.append(chunk)
        except pywintypes.error as error:
            if error.winerror == winerror.ERROR_BROKEN_PIPE:
                return b"".join(chunks)
            raise


def wait_for_exit(process_handle) -> int:
    result = win32event.WaitForSingleObject(process_handle, win32event.INFINITE)
    if result != win32event.WAIT_OBJECT_0:
        raise RuntimeError(f"unexpected process wait result: {result}")
    return win32process.GetExitCodeProcess(process_handle)


def run_pipeline(commands: list[str], encoding: str) -> str:
    process_records = []
    previous_read = None
    final_read = None
    current_read = None
    current_write = None
    parent_stdin = win32api.GetStdHandle(STD_INPUT_HANDLE)
    parent_stderr = win32api.GetStdHandle(STD_ERROR_HANDLE)

    try:
        for index, command in enumerate(commands):
            stage = index + 1
            current_read, current_write = inheritable_pipe()
            set_inheritable(current_read, False)

            child_stdin = parent_stdin
            if previous_read is not None:
                set_inheritable(previous_read, True)
                child_stdin = previous_read

            process_handle, thread_handle, pid, tid = create_child(
                command, startup(child_stdin, current_write, parent_stderr)
            )
            process_records.append(
                {"stage": stage, "process": process_handle, "thread": thread_handle, "pid": pid, "tid": tid}
            )
            print(f"stage {stage}: PID {pid}, TID {tid}, command={command!r}")

            if previous_read is not None:
                close_handle(previous_read, f"stage {stage} consumed previous read")
                previous_read = None
            close_handle(current_write, f"stage {stage} write copy")
            current_write = None

            previous_read = current_read
            current_read = None

        final_read = previous_read
        previous_read = None
        output = read_until_eof(final_read)
        print(f"parent captured {len(output)} bytes before waiting")

        failures = []
        for record in process_records:
            exit_code = wait_for_exit(record["process"])
            record["exit_code"] = exit_code
            print(f"stage {record['stage']}: exit code {exit_code}")
            if exit_code != 0:
                failures.append((record["stage"], exit_code))
        if failures:
            print(f"nonzero stages: {failures}")
        return output.decode(encoding, errors="replace")
    finally:
        close_handle(current_read, "current read")
        close_handle(current_write, "current write")
        close_handle(previous_read, "previous read")
        close_handle(final_read, "final read")
        for record in process_records:
            close_handle(record["thread"], f"stage {record['stage']} initial thread")
            close_handle(record["process"], f"stage {record['stage']} process")


def main() -> None:
    parser = argparse.ArgumentParser(
        epilog='Example: py pipeline_lab.py "cmd /c echo hello" "findstr hello"'
    )
    parser.add_argument("commands", nargs="+")
    parser.add_argument("--encoding", default=locale.getpreferredencoding(False))
    args = parser.parse_args()
    try:
        output = run_pipeline(args.commands, args.encoding)
    except pywintypes.error as error:
        raise SystemExit(f"Windows error {error.winerror} from {error.funcname}: {error.strerror}")
    except (OSError, RuntimeError, UnicodeError) as error:
        raise SystemExit(f"Pipeline error: {error}")
    print(output, end="" if output.endswith(("\n", "\r")) else "\n")


if __name__ == "__main__":
    main()
