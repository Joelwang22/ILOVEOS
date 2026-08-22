"""Decode the owner and DACL of a file without modifying it."""

from __future__ import annotations

import argparse
from pathlib import Path
import win32security

ACE_TYPES = {
    win32security.ACCESS_ALLOWED_ACE_TYPE: "ALLOW",
    win32security.ACCESS_DENIED_ACE_TYPE: "DENY",
}


def resolve(sid) -> str:
    try:
        name, domain, _ = win32security.LookupAccountSid(None, sid)
        return f"{domain}\\{name}" if domain else name
    except Exception:
        return "unresolved"


def inspect(path: Path) -> None:
    descriptor = win32security.GetNamedSecurityInfo(
        str(path),
        win32security.SE_FILE_OBJECT,
        win32security.OWNER_SECURITY_INFORMATION
        | win32security.DACL_SECURITY_INFORMATION,
    )
    owner = descriptor.GetSecurityDescriptorOwner()
    control, _revision = descriptor.GetSecurityDescriptorControl()
    present = bool(control & win32security.SE_DACL_PRESENT)
    defaulted = bool(control & win32security.SE_DACL_DEFAULTED)
    dacl = descriptor.GetSecurityDescriptorDacl()
    print(f"Path: {path.resolve()}")
    print(f"Owner: {resolve(owner)} ({win32security.ConvertSidToStringSid(owner)})")
    print(f"DACL present: {present}; defaulted: {defaulted}")
    if not present or dacl is None:
        print("No effective DACL: discretionary access is not restricted by ACEs.")
        return
    print(f"ACE count: {dacl.GetAceCount()}")
    for index in range(dacl.GetAceCount()):
        ace = dacl.GetAce(index)
        header, mask, sid = ace[0], ace[1], ace[-1]
        ace_type, ace_flags = header
        print(
            f"{index:02}: {ACE_TYPES.get(ace_type, f'type-{ace_type}')} "
            f"mask=0x{mask:08X} flags=0x{ace_flags:02X} "
            f"sid={win32security.ConvertSidToStringSid(sid)} name={resolve(sid)}"
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("path", type=Path)
    inspect(parser.parse_args().path)
