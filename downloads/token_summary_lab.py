"""Print a readable summary of the current process access token."""

from __future__ import annotations

import win32api
import win32con
import win32security


PRIVILEGE_ATTRIBUTES = {
    win32con.SE_PRIVILEGE_ENABLED: "enabled",
    win32con.SE_PRIVILEGE_ENABLED_BY_DEFAULT: "enabled-by-default",
    0x00000004: "removed",
    0x80000000: "used-for-access",
}


def account_name(sid) -> str:
    try:
        name, domain, _ = win32security.LookupAccountSid(None, sid)
        return f"{domain}\\{name}" if domain else name
    except Exception:
        return "unresolved"


def attributes_text(attributes: int) -> str:
    labels = [label for bit, label in PRIVILEGE_ATTRIBUTES.items() if attributes & bit]
    return ", ".join(labels) if labels else "disabled"


token = win32security.OpenProcessToken(
    win32api.GetCurrentProcess(), win32security.TOKEN_QUERY
)
try:
    user_sid = win32security.GetTokenInformation(token, win32security.TokenUser)[0]
    groups = win32security.GetTokenInformation(token, win32security.TokenGroups)
    privileges = win32security.GetTokenInformation(token, win32security.TokenPrivileges)
    token_type = win32security.GetTokenInformation(token, win32security.TokenType)
    elevation_type = win32security.GetTokenInformation(
        token, win32security.TokenElevationType
    )
    elevated = win32security.GetTokenInformation(token, win32security.TokenElevation)
    integrity_sid = win32security.GetTokenInformation(
        token, win32security.TokenIntegrityLevel
    )[0]

    print(f"User: {account_name(user_sid)}")
    print(f"User SID: {win32security.ConvertSidToStringSid(user_sid)}")
    print(f"Token type: {token_type}")
    print(f"Elevation type: {elevation_type}")
    print(f"Elevated: {bool(elevated)}")
    print(f"Integrity SID: {win32security.ConvertSidToStringSid(integrity_sid)}")

    print(f"\nGroups ({len(groups)}):")
    for sid, attributes in groups:
        print(
            f"  {win32security.ConvertSidToStringSid(sid):<46} "
            f"0x{attributes & 0xFFFFFFFF:08X} {account_name(sid)}"
        )

    print(f"\nPrivileges ({len(privileges)}):")
    for luid, attributes in privileges:
        name = win32security.LookupPrivilegeName(None, luid)
        print(f"  {name:<36} {attributes_text(attributes)}")
finally:
    win32api.CloseHandle(token)
