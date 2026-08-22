"""Read service configuration and live status without changing either."""

from __future__ import annotations

import argparse
import win32service


def inspect_service(service_name: str) -> None:
    scm = service = None
    try:
        scm = win32service.OpenSCManager(
            None, None, win32service.SC_MANAGER_CONNECT
        )
        service = win32service.OpenService(
            scm,
            service_name,
            win32service.SERVICE_QUERY_STATUS | win32service.SERVICE_QUERY_CONFIG,
        )
        status = win32service.QueryServiceStatusEx(service)
        config = win32service.QueryServiceConfig(service)
        print(f"Service name: {service_name}")
        print(f"Current state: {status['CurrentState']}")
        print(f"Process ID: {status['ProcessId']}")
        print(f"Controls accepted: 0x{status['ControlsAccepted']:08X}")
        print(f"Checkpoint: {status['CheckPoint']}")
        print(f"Wait hint: {status['WaitHint']} ms")
        print(f"Binary path: {config[3]}")
        print(f"Start type: {config[1]}")
        print(f"Account: {config[7]}")
        print(f"Dependencies: {config[6]}")
    finally:
        if service is not None:
            win32service.CloseServiceHandle(service)
        if scm is not None:
            win32service.CloseServiceHandle(scm)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("service", help="internal service name, for example EventLog")
    inspect_service(parser.parse_args().service)
