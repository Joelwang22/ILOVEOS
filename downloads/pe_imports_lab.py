"""Read PE import descriptors and IAT RVAs without loading or modifying the file."""

import argparse
import struct
from pathlib import Path


MACHINE_NAMES = {0x014C: "x86", 0x8664: "x64", 0xAA64: "ARM64"}


def require(data: bytes, offset: int, size: int, label: str) -> None:
    if offset < 0 or size < 0 or offset > len(data) or size > len(data) - offset:
        raise ValueError(f"{label} exceeds file bounds")


def unpack(fmt: str, data: bytes, offset: int, label: str):
    size = struct.calcsize(fmt)
    require(data, offset, size, label)
    return struct.unpack_from(fmt, data, offset)


def c_string(data: bytes, offset: int, label: str, limit: int = 4096) -> str:
    require(data, offset, 1, label)
    end = data.find(b"\0", offset, min(len(data), offset + limit))
    if end < 0:
        raise ValueError(f"{label} has no terminator within {limit} bytes")
    return data[offset:end].decode("ascii", errors="replace")


def parse_layout(data: bytes) -> dict:
    require(data, 0, 0x40, "DOS header")
    if data[:2] != b"MZ":
        raise ValueError("missing MZ signature")
    (pe_offset,) = unpack("<I", data, 0x3C, "e_lfanew")
    require(data, pe_offset, 24, "PE headers")
    if data[pe_offset : pe_offset + 4] != b"PE\0\0":
        raise ValueError("missing PE signature")

    coff = pe_offset + 4
    machine, section_count, _, _, _, optional_size, _ = unpack(
        "<HHIIIHH", data, coff, "COFF header"
    )
    optional = coff + 20
    require(data, optional, optional_size, "Optional Header")
    (magic,) = unpack("<H", data, optional, "Optional Header Magic")
    if magic == 0x10B:
        thunk_size = 4
        number_offset = 92
        directory_offset = 96
        ordinal_flag = 0x80000000
        thunk_format = "<I"
    elif magic == 0x20B:
        thunk_size = 8
        number_offset = 108
        directory_offset = 112
        ordinal_flag = 0x8000000000000000
        thunk_format = "<Q"
    else:
        raise ValueError(f"unsupported Optional Header Magic 0x{magic:X}")

    (directory_count,) = unpack(
        "<I", data, optional + number_offset, "NumberOfRvaAndSizes"
    )
    if directory_count < 2:
        import_rva = import_size = 0
    else:
        import_rva, import_size = unpack(
            "<II", data, optional + directory_offset + 8, "import data directory"
        )

    section_table = optional + optional_size
    sections = []
    require(data, section_table, section_count * 40, "section table")
    for index in range(section_count):
        values = unpack("<8sIIIIIIHHI", data, section_table + index * 40, f"section {index}")
        sections.append(
            {
                "name": values[0].split(b"\0", 1)[0].decode("ascii", errors="replace"),
                "virtual_size": values[1],
                "rva": values[2],
                "raw_size": values[3],
                "raw_offset": values[4],
            }
        )
    return {
        "machine": machine,
        "thunk_size": thunk_size,
        "thunk_format": thunk_format,
        "ordinal_flag": ordinal_flag,
        "import_rva": import_rva,
        "import_size": import_size,
        "sections": sections,
    }


def rva_offset(data: bytes, layout: dict, rva: int, label: str) -> int:
    for section in layout["sections"]:
        start = section["rva"]
        span = max(section["virtual_size"], section["raw_size"])
        if start <= rva < start + span:
            delta = rva - start
            if delta >= section["raw_size"]:
                raise ValueError(f"{label} points into zero-filled virtual data")
            offset = section["raw_offset"] + delta
            require(data, offset, 1, label)
            return offset
    if rva < len(data):
        return rva
    raise ValueError(f"{label} RVA 0x{rva:X} is outside mapped sections")


def parse_imports(data: bytes, layout: dict) -> list[dict]:
    if not layout["import_rva"]:
        return []
    descriptor_offset = rva_offset(data, layout, layout["import_rva"], "import directory")
    descriptors = []
    maximum_descriptors = max(1, layout["import_size"] // 20 + 1)

    for descriptor_index in range(maximum_descriptors):
        offset = descriptor_offset + descriptor_index * 20
        original_thunk, timestamp, forwarder, name_rva, first_thunk = unpack(
            "<IIIII", data, offset, f"import descriptor {descriptor_index}"
        )
        if not any((original_thunk, timestamp, forwarder, name_rva, first_thunk)):
            break
        name_offset = rva_offset(data, layout, name_rva, "import DLL name")
        dll_name = c_string(data, name_offset, "import DLL name")
        lookup_rva = original_thunk or first_thunk
        lookup_offset = rva_offset(data, layout, lookup_rva, f"{dll_name} thunk table")
        imports = []

        for thunk_index in range(65536):
            (value,) = unpack(
                layout["thunk_format"],
                data,
                lookup_offset + thunk_index * layout["thunk_size"],
                f"{dll_name} thunk {thunk_index}",
            )
            if value == 0:
                break
            iat_rva = first_thunk + thunk_index * layout["thunk_size"]
            if value & layout["ordinal_flag"]:
                imports.append({"ordinal": value & 0xFFFF, "name": None, "hint": None, "iat_rva": iat_rva})
            else:
                hint_name_offset = rva_offset(data, layout, value, f"{dll_name} import name")
                (hint,) = unpack("<H", data, hint_name_offset, "import hint")
                name = c_string(data, hint_name_offset + 2, "import symbol name")
                imports.append({"ordinal": None, "name": name, "hint": hint, "iat_rva": iat_rva})
        else:
            raise ValueError(f"{dll_name} thunk table has no terminator")
        descriptors.append({"dll": dll_name, "imports": imports})
    return descriptors


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("file", type=Path)
    args = parser.parse_args()
    data = args.file.read_bytes()
    layout = parse_layout(data)
    descriptors = parse_imports(data, layout)

    print(f"file: {args.file.resolve()}")
    print(f"machine: 0x{layout['machine']:04X} ({MACHINE_NAMES.get(layout['machine'], 'unknown')})")
    print(f"import directory: RVA=0x{layout['import_rva']:X} size=0x{layout['import_size']:X}")
    if not descriptors:
        print("no ordinary import descriptors")
        return
    for descriptor in descriptors:
        print(f"{descriptor['dll']} ({len(descriptor['imports'])} imports)")
        for item in descriptor["imports"]:
            identity = item["name"] if item["name"] is not None else f"ordinal {item['ordinal']}"
            print(f"  IAT RVA 0x{item['iat_rva']:08X}  {identity}")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, struct.error) as error:
        raise SystemExit(f"PE import inspection failed: {error}")
