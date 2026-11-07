#!/usr/bin/env python3
"""Keep a public repository active without redeploying unchanged site content."""
from pathlib import Path
from datetime import date

ROOT = Path(__file__).resolve().parents[1]

def heartbeat() -> bool:
    marker = ROOT / '.github/catalog-heartbeat'
    today = date.today()
    if marker.exists() and (today - date.fromisoformat(marker.read_text().strip())).days < 28:
        return False
    marker.parent.mkdir(parents=True, exist_ok=True)
    marker.write_text(today.isoformat() + '\n')
    return True

if __name__ == '__main__':
    print('Heartbeat refreshed' if heartbeat() else 'Heartbeat current')
