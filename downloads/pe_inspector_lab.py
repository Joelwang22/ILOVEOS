"""Read selected PE headers and translate an optional RVA without loading the file."""

import argparse
import struct
from pathlib import Path


MACHINE_NAMES = {0x014C: "x86", 0x8664: "x64", 0xAA64: "ARM64"}
MAGIC_NAMES = {0x010B: "PE32", 0x020B: "PE32+"}


def require_range(data, offset, size, label):
    if offset < 0 or size < 0 or offset > len(data) or size > len(data) - offset:
        raise ValueError(f"{label} exceeds file bounds")


def unpack_from(fmt, data, offset, label):
    size = struct.calcsize(fmt)
    require_range(data, offset, size, label)
    return struct.unpack_from(fmt, data, offset)


def permission_text(characteristics):
    letters = []
    if characteristics & 0x40000000:
        letters.append("R")
    if characteristics & 0x80000000:
        letters.append("W")
    if characteristics & 0x20000000:
        letters.append("X")
    return "".join(letters) or "none"


def parse_pe(data):
    require_range(data, 0, 0x40, "DOS header")
    if data[:2] != b"MZ":
        raise ValueError("missing MZ signature")
    (pe_offset,) = unpack_from("<I", data, 0x3C, "e_lfanew")
    require_range(data, pe_offset, 4 + 20, "PE signature and COFF header")
    if data[pe_offset : pe_offset + 4] != b"PE\0\0":
        raise ValueError("missing PE signature")

    coff_offset = pe_offset + 4
    machine, section_count, timestamp, symbol_ptr, symbol_count, optional_size, characteristics = unpack_from(
        "<HHIIIHH", data, coff_offset, "COFF header"
    )
    optional_offset = coff_offset + 20
    require_range(data, optional_offset, optional_size, "Optional Header")
    (magic,) = unpack_from("<H", data, optional_offset, "Optional Header Magic")
    if magic not in MAGIC_NAMES:
        raise ValueError(f"unsupported Optional Header Magic 0x{magic:04X}")
    minimum_optional = 64
    if optional_size < minimum_optional:
        raise ValueError("Optional Header is too small for required fields")

    (entry_rva,) = unpack_from("<I", data, optional_offset + 16, "AddressOfEntryPoint")
    if magic == 0x010B:
        (image_base,) = unpack_from("<I", data, optional_offset + 28, "ImageBase")
        address_width = 8
    else:
        (image_base,) = unpack_from("<Q", data, optional_offset + 24, "ImageBase")
        address_width = 16
    section_alignment, file_alignment = unpack_from(
        "<II", data, optional_offset + 32, "section and file alignment"
    )
    size_of_image, size_of_headers = unpack_from(
        "<II", data, optional_offset + 56, "image and header sizes"
    )

    section_table = optional_offset + optional_size
    require_range(data, section_table, section_count * 40, "section table")
    sections = []
    for index in range(section_count):
        offset = section_table + index * 40
        fields = unpack_from("<8sIIIIIIHHI", data, offset, f"section {index}")
        name = fields[0].split(b"\0", 1)[0].decode("ascii", errors="replace") or "<unnamed>"
        virtual_size, virtual_address, raw_size, raw_pointer = fields[1:5]
        section_characteristics = fields[9]
        if raw_size:
            require_range(data, raw_pointer, raw_size, f"raw data for {name}")
        sections.append(
            {
                "name": name,
                "virtual_size": virtual_size,
                "virtual_address": virtual_address,
                "raw_size": raw_size,
                "raw_pointer": raw_pointer,
                "characteristics": section_characteristics,
            }
        )

    return {
        "pe_offset": pe_offset,
        "machine": machine,
        "section_count": section_count,
        "optional_size": optional_size,
        "magic": magic,
        "entry_rva": entry_rva,
        "image_base": image_base,
        "address_width": address_width,
        "section_alignment": section_alignment,
        "file_alignment": file_alignment,
        "size_of_image": size_of_image,
        "size_of_headers": size_of_headers,
        "sections": sections,
    }


def translate_rva(data, pe, rva):
    if rva < pe["size_of_headers"]:
        require_range(data, rva, 1, "header RVA")
        return "<headers>", rva, 0
    for section in pe["sections"]:
        span = max(section["virtual_size"], section["raw_size"])
        start = section["virtual_address"]
        if start <= rva < start + span:
            delta = rva - start
            if delta >= section["raw_size"]:
                return section["name"], None, delta
            file_offset = section["raw_pointer"] + delta
            require_range(data, file_offset, 1, "translated RVA")
            return section["name"], file_offset, delta
    raise ValueError("RVA is outside headers and every section span")


def parse_int(value):
    return int(value, 0)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("file", type=Path)
    parser.add_argument("--rva", type=parse_int)
    args = parser.parse_args()
    data = args.file.read_bytes()
    pe = parse_pe(data)
    width = pe["address_width"]

    print(f"file: {args.file.resolve()}")
    print(f"file size: 0x{len(data):X} ({len(data)} bytes)")
    print("DOS signature: MZ")
    print(f"e_lfanew: 0x{pe['pe_offset']:X}")
    print("PE signature: PE\\0\\0")
    print(f"Machine: 0x{pe['machine']:04X} ({MACHINE_NAMES.get(pe['machine'], 'unknown')})")
    print(f"Optional Header Magic: 0x{pe['magic']:04X} ({MAGIC_NAMES[pe['magic']]})")
    print(f"sections: {pe['section_count']}")
    print(f"AddressOfEntryPoint: 0x{pe['entry_rva']:X}")
    print(f"preferred ImageBase: 0x{pe['image_base']:0{width}X}")
    print(f"SectionAlignment: 0x{pe['section_alignment']:X}")
    print(f"FileAlignment: 0x{pe['file_alignment']:X}")
    print(f"SizeOfImage: 0x{pe['size_of_image']:X}")
    print(f"SizeOfHeaders: 0x{pe['size_of_headers']:X}")
    print("section table:")
    for section in pe["sections"]:
        print(
            f"  {section['name']:<8} RVA=0x{section['virtual_address']:08X} "
            f"VSize=0x{section['virtual_size']:X} Raw=0x{section['raw_pointer']:X} "
            f"RawSize=0x{section['raw_size']:X} Protect={permission_text(section['characteristics'])}"
        )

    if args.rva is not None:
        section_name, file_offset, delta = translate_rva(data, pe, args.rva)
        print(f"RVA 0x{args.rva:X} belongs to {section_name}")
        print(f"within-section offset: 0x{delta:X}")
        if file_offset is None:
            print("raw file offset: none, RVA is in a zero-filled virtual tail")
        else:
            print(f"raw file offset: 0x{file_offset:X}")
            print(f"byte at offset: 0x{data[file_offset]:02X}")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, struct.error) as error:
        raise SystemExit(f"PE inspection failed: {error}")
