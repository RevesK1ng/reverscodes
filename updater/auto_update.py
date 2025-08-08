#!/usr/bin/env python3
"""
ReversCodes Server-side Auto Updater

Runs every 6 hours, fetches Roblox codes/news from trusted sources,
and updates HTML code lists in-place without breaking other site features.

Safety:
- Only updates allowed blocks (code lists inside specific game sections)
- Dedupe + validate codes
- Writes atomic temp file and replaces on success
- Logs to logs/auto_update.log
"""

import os
import re
import json
import time
import argparse
from datetime import datetime
from pathlib import Path

import requests
from bs4 import BeautifulSoup  # type: ignore

ROOT = Path(__file__).resolve().parents[1]
SITE_DIR = ROOT / "ReversCodes"
INDEX_HTML = SITE_DIR / "index.html"
DATA_DIR = ROOT / "data"
LOG_DIR = ROOT / "logs"

DATA_DIR.mkdir(exist_ok=True)
LOG_DIR.mkdir(exist_ok=True)

LOG_FILE = LOG_DIR / "auto_update.log"

SOURCES = {
    "roblox_codes": [
        "https://progameguides.com/roblox/",
        "https://tryhardguides.com/games/roblox/",
        "https://www.dexerto.com/roblox/",
        "https://gamerant.com/tag/roblox/",
        "https://www.sportskeeda.com/esports/roblox",
    ]
}

# Map site game ids to friendly names and regex anchors in index.html
GAMES = {
    "astdx": {"anchor_id": "astdx-page", "name": "All Star Tower Defense X"},
    "goalbound": {"anchor_id": "goalbound-page", "name": "Goalbound"},
    "rivals": {"anchor_id": "rivals-page", "name": "Rivals"},
    "bloxfruits": {"anchor_id": "bloxfruits-page", "name": "Blox Fruits"},
    "dresstoimpress": {"anchor_id": "dresstoimpress-page", "name": "Dress to Impress"},
    "jujutsuinfinite": {"anchor_id": "jujutsuinfinite-page", "name": "Jujutsu Infinite"},
    "animeadventures": {"anchor_id": "animeadventures-page", "name": "Anime Adventures"},
    "fruitbattlegrounds": {"anchor_id": "fruitbattlegrounds-page", "name": "Fruit Battlegrounds"},
    "shindolife": {"anchor_id": "shindolife-page", "name": "Shindo Life"},
    # Add others if needed
}

HEADERS = {"User-Agent": "ReversCodesBot/1.0 (+https://reverscodes.com)"}
TIMEOUT = 15


def log(msg: str) -> None:
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with LOG_FILE.open("a", encoding="utf-8") as f:
        f.write(f"{timestamp} - {msg}\n")


def fetch_url(url: str) -> str:
    r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
    r.raise_for_status()
    return r.text


def extract_codes_from_html(html: str) -> list[str]:
    # Generic heuristic extraction: look for tokens that look like codes
    soup = BeautifulSoup(html, "html.parser")
    texts = soup.find_all(text=True)
    candidates: set[str] = set()
    for t in texts:
        s = (t or "").strip()
        if not s:
            continue
        # Heuristics: uppercase words with punctuation/numbers typical in codes
        for token in re.findall(r"[A-Za-z0-9_!@#$%^&*()]{4,24}", s):
            # Filter obviously generic words
            if token.lower() in {"update", "reward", "rewards", "code", "codes", "title", "reset"}:
                continue
            candidates.add(token)
    return sorted(candidates)


def fetch_all_codes_for_game(game_id: str) -> list[str]:
    codes: list[str] = []
    for src in SOURCES["roblox_codes"]:
        try:
            html = fetch_url(src)
            extracted = extract_codes_from_html(html)
            codes.extend(extracted)
            log(f"Fetched {len(extracted)} tokens from {src} for {game_id}")
        except Exception as e:
            log(f"WARN: fetch from {src} failed: {e}")
            continue
    # Dedupe & normalize
    deduped = []
    seen = set()
    for c in codes:
        key = c.strip()
        if 3 <= len(key) <= 50 and key not in seen:
            seen.add(key)
            deduped.append(key)
    return deduped[:50]  # cap


def update_index_html_codes(game_id: str, new_codes: list[str]) -> bool:
    """Update the codes list for the given game in index.html.

    We only replace the inner <ul class="codes-list"> ... </ul> within that game's codes-section.
    Returns True if a change was applied.
    """
    if not new_codes:
        return False

    anchor_id = GAMES[game_id]["anchor_id"]
    html = INDEX_HTML.read_text(encoding="utf-8")

    # Find the game block by anchor div id
    block_start = html.find(f"id=\"{anchor_id}\"")
    if block_start == -1:
        log(f"WARN: anchor {anchor_id} not found in index.html; skipping")
        return False

    # Find codes-section inside this block
    codes_section_start = html.find("codes-section", block_start)
    if codes_section_start == -1:
        log(f"WARN: codes-section not found for {game_id}")
        return False

    # Find the UL with class codes-list within this section
    ul_start = html.find("<ul class=\"codes-list\">", codes_section_start)
    if ul_start == -1:
        log(f"WARN: <ul class=\"codes-list\"> not found for {game_id}")
        return False
    ul_end = html.find("</ul>", ul_start)
    if ul_end == -1:
        log(f"WARN: closing </ul> not found for {game_id}")
        return False

    # Build new list items
    def li(code: str) -> str:
        safe = code.replace("\"", "&quot;")
        return (
            f'<li class="code-item"><span class="code">{safe}</span>'
            f'<span class="reward">(auto)</span>'
            f'<button class="copy-btn" onclick="copyCode(\"{safe}\")">Copy</button></li>'
        )

    new_ul = "<ul class=\"codes-list\">\n" + "\n".join(li(c) for c in new_codes) + "\n</ul>"

    new_html = html[:ul_start] + new_ul + html[ul_end + len("</ul>"):]

    if new_html == html:
        return False

    tmp = INDEX_HTML.with_suffix(".html.tmp")
    tmp.write_text(new_html, encoding="utf-8")
    tmp.replace(INDEX_HTML)
    return True


def run_once(quiet: bool = False) -> int:
    changes_applied: dict[str, list[str]] = {}
    for game_id in GAMES.keys():
        try:
            codes = fetch_all_codes_for_game(game_id)
            applied = update_index_html_codes(game_id, codes)
            if applied:
                changes_applied[game_id] = codes
                if not quiet:
                    print(f"Updated {game_id} with {len(codes)} codes")
                log(f"Updated {game_id} with {len(codes)} codes")
            else:
                log(f"No changes for {game_id}")
        except Exception as e:
            log(f"ERROR: updating {game_id} failed: {e}")
    # Save snapshot
    (DATA_DIR / "updates_applied.json").write_text(
        json.dumps({
            "timestamp": datetime.now().isoformat(),
            "changes": changes_applied,
        }, indent=2),
        encoding="utf-8",
    )
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--once", action="store_true", help="Run one update cycle and exit")
    parser.add_argument("--quiet", action="store_true", help="Suppress stdout, log only")
    args = parser.parse_args()

    if args.once:
        return run_once(quiet=args.quiet)

    # Default: daemon loop every 6 hours
    while True:
        try:
            run_once(quiet=args.quiet)
        except Exception as e:
            log(f"FATAL: run_once crashed: {e}")
        # sleep 6h
        time.sleep(6 * 60 * 60)


if __name__ == "__main__":
    raise SystemExit(main())


