"""A corrected ctypes service controller with query, confirmation, and waiting.

Query mode is read-only and may inspect the fixed EventLog service.
Use start or stop only with a non-critical service you are authorised to control in a VM.
"""

from __future__ import annotations

import argparse
import ctypes
import time
from ctypes import wintypes

SC_MANAGER_CONNECT = 0x0001
SERVICE_QUERY_STATUS = 0x0004
SERVICE_START = 0x0010
SERVICE_STOP = 0x0020
SERVICE_CONTROL_STOP = 0x00000001
SERVICE_STOPPED = 0x00000001
SERVICE_START_PENDING = 0x00000002
SERVICE_STOP_PENDING = 0x00000003
SERVICE_RUNNING = 0x00000004
SC_STATUS_PROCESS_INFO = 0


class SERVICE_STATUS(ctypes.Structure):
    _fields_ = [
        ("dwServiceType", wintypes.DWORD),
        ("dwCurrentState", wintypes.DWORD),
        ("dwControlsAccepted", wintypes.DWORD),
        ("dwWin32ExitCode", wintypes.DWORD),
        ("dwServiceSpecificExitCode", wintypes.DWORD),
        ("dwCheckPoint", wintypes.DWORD),
        ("dwWaitHint", wintypes.DWORD),
    ]


class SERVICE_STATUS_PROCESS(ctypes.Structure):
    _fields_ = SERVICE_STATUS._fields_ + [
        ("dwProcessId", wintypes.DWORD),
        ("dwServiceFlags", wintypes.DWORD),
    ]


advapi32 = ctypes.WinDLL("Advapi32.dll", use_last_error=True)
OpenSCManagerW = advapi32.OpenSCManagerW
OpenSCManagerW.argtypes = [wintypes.LPCWSTR, wintypes.LPCWSTR, wintypes.DWORD]
OpenSCManagerW.restype = wintypes.HANDLE
OpenServiceW = advapi32.OpenServiceW
OpenServiceW.argtypes = [wintypes.HANDLE, wintypes.LPCWSTR, wintypes.DWORD]
OpenServiceW.restype = wintypes.HANDLE
StartServiceW = advapi32.StartServiceW
StartServiceW.argtypes = [wintypes.HANDLE, wintypes.DWORD, ctypes.POINTER(wintypes.LPCWSTR)]
StartServiceW.restype = wintypes.BOOL
ControlService = advapi32.ControlService
ControlService.argtypes = [wintypes.HANDLE, wintypes.DWORD, ctypes.POINTER(SERVICE_STATUS)]
ControlService.restype = wintypes.BOOL
QueryServiceStatusEx = advapi32.QueryServiceStatusEx
QueryServiceStatusEx.argtypes = [wintypes.HANDLE, ctypes.c_int, ctypes.POINTER(wintypes.BYTE), wintypes.DWORD, ctypes.POINTER(wintypes.DWORD)]
QueryServiceStatusEx.restype = wintypes.BOOL
CloseServiceHandle = advapi32.CloseServiceHandle
CloseServiceHandle.argtypes = [wintypes.HANDLE]
CloseServiceHandle.restype = wintypes.BOOL


def fail(operation: str) -> None:
    code = ctypes.get_last_error()
    raise ctypes.WinError(code, f"{operation} failed")


def query_status(service) -> SERVICE_STATUS_PROCESS:
    status = SERVICE_STATUS_PROCESS()
    needed = wintypes.DWORD()
    ok = QueryServiceStatusEx(
        service,
        SC_STATUS_PROCESS_INFO,
        ctypes.cast(ctypes.byref(status), ctypes.POINTER(wintypes.BYTE)),
        ctypes.sizeof(status),
        ctypes.byref(needed),
    )
    if not ok:
        fail("QueryServiceStatusEx")
    return status


def wait_for_state(service, target: int, timeout: float = 30.0) -> SERVICE_STATUS_PROCESS:
    deadline = time.monotonic() + timeout
    previous_checkpoint = None
    while True:
        status = query_status(service)
        print(f"state={status.dwCurrentState} checkpoint={status.dwCheckPoint} wait_hint={status.dwWaitHint} pid={status.dwProcessId}")
        if status.dwCurrentState == target:
            return status
        if time.monotonic() >= deadline:
            raise TimeoutError(f"service did not reach state {target} within {timeout:g}s")
        if previous_checkpoint == status.dwCheckPoint and status.dwCurrentState not in (SERVICE_START_PENDING, SERVICE_STOP_PENDING):
            raise RuntimeError("service left the expected pending transition")
        previous_checkpoint = status.dwCheckPoint
        time.sleep(min(max(status.dwWaitHint / 10_000.0, 0.2), 1.0))


def run(action: str, name: str, confirm: bool) -> None:
    desired = SERVICE_QUERY_STATUS
    if action == "start":
        desired |= SERVICE_START
    elif action == "stop":
        desired |= SERVICE_STOP

    scm = service = None
    try:
        scm = OpenSCManagerW(None, None, SC_MANAGER_CONNECT)
        if not scm:
            fail("OpenSCManagerW")
        service = OpenServiceW(scm, name, desired)
        if not service:
            fail("OpenServiceW")

        before = query_status(service)
        print(f"Before: state={before.dwCurrentState}, pid={before.dwProcessId}")
        if action == "query":
            return
        if not confirm:
            print("No state change made. Add --confirm after reviewing the target.")
            return

        if action == "start":
            if not StartServiceW(service, 0, None):
                fail("StartServiceW")
            wait_for_state(service, SERVICE_RUNNING)
        else:
            status = SERVICE_STATUS()
            if not ControlService(service, SERVICE_CONTROL_STOP, ctypes.byref(status)):
                fail("ControlService")
            wait_for_state(service, SERVICE_STOPPED)
    finally:
        if service:
            CloseServiceHandle(service)
        if scm:
            CloseServiceHandle(scm)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=("query", "start", "stop"))
    parser.add_argument("service", help="internal service name")
    parser.add_argument("--confirm", action="store_true", help="allow the requested state change")
    arguments = parser.parse_args()
    run(arguments.action, arguments.service, arguments.confirm)
