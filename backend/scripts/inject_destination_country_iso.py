"""
One-off helper: inject country_iso_code into V10__seed_destinations.sql row headers.
Run from repo root: python UniVoyage/backend/scripts/inject_destination_country_iso.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

LOCATION_TO_ISO = {
    "Argentina": "AR",
    "Australia": "AU",
    "Austria": "AT",
    "Belgium": "BE",
    "Bolivia": "BO",
    "Brazil": "BR",
    "Canada": "CA",
    "Chile": "CL",
    "China": "CN",
    "Colombia": "CO",
    "Croatia": "HR",
    "Cuba": "CU",
    "Czech Republic": "CZ",
    "Denmark": "DK",
    "Dominican Republic": "DO",
    "Ecuador": "EC",
    "Egypt": "EG",
    "Ethiopia": "ET",
    "Finland": "FI",
    "France": "FR",
    "Germany": "DE",
    "Ghana": "GH",
    "Greece": "GR",
    "Hong Kong": "HK",
    "Hungary": "HU",
    "Iceland": "IS",
    "India": "IN",
    "Indonesia": "ID",
    "Ireland": "IE",
    "Italy": "IT",
    "Japan": "JP",
    "Kazakhstan": "KZ",
    "Kenya": "KE",
    "Malaysia": "MY",
    "Mexico": "MX",
    "Morocco": "MA",
    "Nepal": "NP",
    "Netherlands": "NL",
    "New Zealand": "NZ",
    "Nigeria": "NG",
    "Norway": "NO",
    "Paraguay": "PY",
    "Peru": "PE",
    "Philippines": "PH",
    "Poland": "PL",
    "Portugal": "PT",
    "Puerto Rico": "US",
    "Romania": "RO",
    "Rwanda": "RW",
    "Singapore": "SG",
    "South Africa": "ZA",
    "South Korea": "KR",
    "Spain": "ES",
    "Sri Lanka": "LK",
    "Sweden": "SE",
    "Switzerland": "CH",
    "Taiwan": "TW",
    "Tanzania": "TZ",
    "Thailand": "TH",
    "Turkey": "TR",
    "Uganda": "UG",
    "United Kingdom": "GB",
    "Uruguay": "UY",
    "USA": "US",
    "Uzbekistan": "UZ",
    "Vietnam": "VN",
}


def parse_row_opening(line: str) -> tuple[str, str] | None:
    """If line is (id, 'title', 'location', 'continent', return (stripped_line, location)."""
    s = line.strip()
    m = re.match(r"^\((\d+),\s*", s)
    if not m:
        return None
    rest = s[m.end() :]
    pos = 0
    strings: list[str] = []
    for _ in range(3):
        if pos >= len(rest) or rest[pos] != "'":
            return None
        pos += 1
        buf: list[str] = []
        while pos < len(rest):
            if rest[pos] == "'":
                if pos + 1 < len(rest) and rest[pos + 1] == "'":
                    buf.append("'")
                    pos += 2
                else:
                    pos += 1
                    break
            else:
                buf.append(rest[pos])
                pos += 1
        strings.append("".join(buf))
        while pos < len(rest) and rest[pos] in " \t":
            pos += 1
        if pos < len(rest) and rest[pos] == ",":
            pos += 1
        while pos < len(rest) and rest[pos] in " \t":
            pos += 1
    if rest[pos:].strip():
        return None
    location = strings[1]
    return s, location


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    v10 = root / "src" / "main" / "resources" / "db" / "migration" / "V10__seed_destinations.sql"
    text = v10.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)

    seen_locations: set[str] = set()
    out: list[str] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        parsed = parse_row_opening(line)
        if parsed is None:
            out.append(line)
            i += 1
            continue
        full_line, location = parsed
        if location not in LOCATION_TO_ISO:
            print(f"Unknown location: {location!r}", file=sys.stderr)
            return 1
        seen_locations.add(location)
        iso = LOCATION_TO_ISO[location]
        # Replace trailing ', after continent with ', 'XX',
        old = full_line.rstrip()
        if not old.endswith(","):
            print(f"Expected comma at end of row opening: {old!r}", file=sys.stderr)
            return 1
        new_line = old[:-1] + f", '{iso}'," + "\n"
        # Preserve original line's leading whitespace if any
        prefix = line[: len(line) - len(line.lstrip())]
        out.append(prefix + new_line.lstrip())
        i += 1

    # Header + INSERT columns
    body = "".join(out)
    body = body.replace(
        "-- V8__seed_destinations.sql",
        "-- V10__seed_destinations.sql",
        1,
    )
    body = body.replace(
        "    id, title, location, continent,\n    image_url, image_alt,",
        "    id, title, location, continent, country_iso_code,\n    image_url, image_alt,",
        1,
    )
    body = body.replace(
        "    continent      = EXCLUDED.continent,\n    image_url      = EXCLUDED.image_url,",
        "    continent      = EXCLUDED.continent,\n    country_iso_code = EXCLUDED.country_iso_code,\n    image_url      = EXCLUDED.image_url,",
        1,
    )

    v10.write_text(body, encoding="utf-8")
    print(f"Updated {v10}")
    print(f"Distinct locations covered: {len(seen_locations)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
