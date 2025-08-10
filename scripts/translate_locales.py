#!/usr/bin/env python3
import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Tuple

# Constants
DEFAULT_LOCALES_DIR = Path("src/i18n/locales")
SOURCE_LANG = "en"

PLACEHOLDER_PATTERNS = [
    re.compile(r"\{\{[^}]+\}\}"),  # double mustache {{var}}
    re.compile(r"\{[^}]+\}"),       # single mustache {var}
    re.compile(r"%\([^)]+\)s"),     # python-style %(name)s
]


def find_project_id_from_credentials(creds_path: Path) -> str:
    try:
        data = json.loads(Path(creds_path).read_text(encoding="utf-8"))
        pid = data.get("project_id")
        if not pid:
            raise ValueError("project_id not found in credentials JSON")
        return pid
    except Exception as e:
        raise RuntimeError(f"Failed to read project_id from credentials at {creds_path}: {e}")


def list_target_languages(locales_dir: Path, source_lang: str) -> List[str]:
    langs = []
    for entry in sorted(locales_dir.iterdir()):
        if entry.is_dir() and entry.name != source_lang and not entry.name.startswith("."):
            langs.append(entry.name)
    return langs


def scan_source_files(source_dir: Path) -> List[Path]:
    return sorted(p for p in source_dir.glob("*.json") if p.is_file())


def iter_json_leaves(obj: Any, path: Tuple[str, ...] = ()):
    if isinstance(obj, dict):
        for k, v in obj.items():
            yield from iter_json_leaves(v, path + (k,))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            yield from iter_json_leaves(v, path + (str(i),))
    else:
        # Only translate strings
        if isinstance(obj, str):
            yield path, obj


def protect_placeholders(text: str) -> Tuple[str, Dict[str, str]]:
    replacements: Dict[str, str] = {}
    idx = 0
    def repl(m):
        nonlocal idx
        token = f"__PH_{idx}__"
        replacements[token] = m.group(0)
        idx += 1
        return token
    tmp = text
    for pattern in PLACEHOLDER_PATTERNS:
        tmp = pattern.sub(repl, tmp)
    return tmp, replacements


def restore_placeholders(text: str, replacements: Dict[str, str]) -> str:
    for token, original in replacements.items():
        text = text.replace(token, original)
    return text


def build_map(locales_dir: Path, source_lang: str) -> Dict[str, Dict[str, str]]:
    source_dir = locales_dir / source_lang
    mapping: Dict[str, Dict[str, str]] = {}
    targets = list_target_languages(locales_dir, source_lang)
    source_files = scan_source_files(source_dir)

    for sf in source_files:
        per_lang = {}
        for lang in targets:
            per_lang[lang] = str(locales_dir / lang / sf.name)
        mapping[str(sf)] = per_lang
    return mapping


def pretty_print_map(mapping: Dict[str, Dict[str, str]]):
    print("Planned export (source -> [target paths])\n")
    for src, langs in mapping.items():
        targets = ", ".join(f"{lang}: {path}" for lang, path in sorted(langs.items()))
        print(f"- {src}\n  -> {targets}\n")


def translate_batch(strings: List[str], target_language_code: str, project_id: str, location: str = "global") -> List[str]:
    # Lazy import to avoid dependency in map-only runs
    from google.cloud import translate
    client = translate.TranslationServiceClient()
    parent = f"projects/{project_id}/locations/{location}"

    # The API supports up to 1024 strings per request
    response = client.translate_text(
        request={
            "parent": parent,
            "contents": strings,
            "mime_type": "text/plain",
            "source_language_code": "en",
            "target_language_code": target_language_code,
        }
    )
    return [t.translated_text for t in response.translations]


def load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Invalid JSON in {path}: {e}")


def save_json(path: Path, data: Any):
    path.parent.mkdir(parents=True, exist_ok=True)
    # Do not sort keys to avoid issues when mixed numeric-like keys appear
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def apply_translations(src_data: Any, translate_fn, target_lang: str) -> Any:
    # Gather strings preserving traversal order
    leaves: List[Tuple[Tuple[str, ...], str]] = list(iter_json_leaves(src_data))
    protected: List[Tuple[Tuple[str, ...], str, Dict[str, str]]] = []
    contents: List[str] = []

    for path, text in leaves:
        tmp, repls = protect_placeholders(text)
        protected.append((path, tmp, repls))
        contents.append(tmp)

    # Translate in chunks
    translated: List[str] = []
    BATCH = 200
    for i in range(0, len(contents), BATCH):
        chunk = contents[i:i+BATCH]
        translated.extend(translate_fn(chunk, target_lang))

    # Rebuild structure
    out = json.loads(json.dumps(src_data))  # deep copy via JSON
    for (path, _tmp, repls), t in zip(protected, translated):
        t_final = restore_placeholders(t, repls)
        # walk to parent using container type to decide indexing
        cur = out
        for key in path[:-1]:
            if isinstance(cur, list):
                cur = cur[int(key)]
            else:
                cur = cur[key]
        leaf_key = path[-1]
        if isinstance(cur, list):
            cur[int(leaf_key)] = t_final
        else:
            cur[leaf_key] = t_final
    return out


def main():
    parser = argparse.ArgumentParser(description="Batch translate i18n JSON files using Google Cloud Translation API (v3)")
    parser.add_argument("--locales-dir", default=str(DEFAULT_LOCALES_DIR), help="Path to locales root directory")
    parser.add_argument("--source-lang", default=SOURCE_LANG, help="Source language code (default: en)")
    parser.add_argument("--target-langs", nargs="*", help="Explicit list of target language codes (overrides auto-detect)")
    parser.add_argument("--location", default="global", help="Translation location (e.g., global or us-central1)")
    parser.add_argument("--map-only", action="store_true", help="Only print the export mapping without translating")
    parser.add_argument("--dry-run", action="store_true", help="Translate but do not write files; just report actions")
    args = parser.parse_args()

    locales_dir = Path(args.locales_dir)
    if not locales_dir.exists():
        print(f"Locales directory not found: {locales_dir}", file=sys.stderr)
        sys.exit(1)

    mapping = build_map(locales_dir, args.source_lang)

    if args.map_only:
        pretty_print_map(mapping)
        return

    creds = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    if not creds:
        print("GOOGLE_APPLICATION_CREDENTIALS is not set. Please export it to your JSON key path.", file=sys.stderr)
        sys.exit(1)

    project_id = find_project_id_from_credentials(Path(creds))

    # Determine target languages
    if args.target_langs:
        targets = args.target_langs
    else:
        targets = list_target_languages(locales_dir, args.source_lang)

    # Process each source file
    for src_path_str, per_lang in mapping.items():
        src_path = Path(src_path_str)
        src_data = load_json(src_path)

        def tfn(batch: List[str], lang: str) -> List[str]:
            return translate_batch(batch, lang, project_id, location=args.location)

        for lang in targets:
            out_path = Path(per_lang[lang])
            translated_data = apply_translations(src_data, tfn, lang)
            if args.dry_run:
                print(f"[dry-run] Would write {out_path}")
            else:
                save_json(out_path, translated_data)
                print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()

