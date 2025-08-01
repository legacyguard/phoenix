"""
translate_common.py
====================

This script reads the English ``common.json`` file from the ``src/i18n/locales/en``
directory of the LegacyGuard codebase and produces translated copies for all
other supported languages.  It preserves the original key structure while
translating the values into the target language.  If a translation file for a
given language is missing, the script creates it.  When a translation file
already exists, keys that are present in English but missing from the target
language are added and translated.  Existing translations will be left
untouched to avoid overwriting manual edits.

The script uses the ``deep-translator`` library to perform the translation.
Deep-translator is a more stable and actively maintained alternative that
supports multiple translation services including Google Translate and does
not require an API key.  You can install it via pip:

    pip install deep-translator

For more details, see the project page on PyPI.

**Placeholders**
----------------

Many strings in the JSON contain placeholder variables wrapped in double
curly braces, for example ``{{count}}`` or ``{{username}}``.  These
placeholders must be preserved verbatim in all languages so that the React
application can substitute dynamic values at runtime.  The translation
function therefore splits each string around these placeholders, translates
only the non-placeholder portions, and then stitches the pieces back
together.

**Usage**
---------

Run the script from the root of the repository so that the relative paths
resolve correctly:

    python3 translate_common.py

By default, the script will translate into a predefined list of languages.
You can customise the list by editing the ``TARGET_LANGS`` constant below.

The script prints a summary of the work performed (how many keys were
translated for each language) and writes updated JSON files back into
``src/i18n/locales/<lang>/common.json``.  If you wish to preview the
translations before writing them back, you can run the script with
``--dry-run`` – it will then print the changes without touching any files.

Note: because deep-translator sends HTTP requests, running this script will
translate your texts live using the Google Translate service.  Ensure you
have an active internet connection when running it.
"""

import argparse
import json
import os
import re
from pathlib import Path
from typing import Dict, Any, Iterable, Tuple
import time

try:
    # deep-translator is more stable and actively maintained
    from deep_translator import GoogleTranslator
    from deep_translator.exceptions import TranslationNotFound, RequestError
except ImportError as exc:  # pragma: no cover - runtime import error
    raise SystemExit(
        "The deep-translator library is required to run this script.\n"
        "Install it via 'pip install deep-translator' and try again."
    ) from exc


# List of target languages.  These are ISO 639-1 codes.  Feel free to
# customise this list.  English ('en') is intentionally omitted because
# English is the source language.
TARGET_LANGS: Iterable[str] = [
    "bg",  # Bulgarian
    "cs",  # Czech
    "da",  # Danish
    "de",  # German
    "el",  # Greek
    "es",  # Spanish
    "et",  # Estonian
    "fi",  # Finnish
    "fr",  # French
    "ga",  # Irish Gaelic
    "hr",  # Croatian
    "hu",  # Hungarian
    "it",  # Italian
    "ja",  # Japanese
    "lt",  # Lithuanian
    "lv",  # Latvian
    "mk",  # Macedonian
    "me",  # Montenegrin (will use 'sr' for translation)
    "nl",  # Dutch
    "no",  # Norwegian
    "pl",  # Polish
    "pt",  # Portuguese
    "ro",  # Romanian
    "ru",  # Russian
    "sk",  # Slovak
    "sl",  # Slovenian
    "sq",  # Albanian
    "sr",  # Serbian
    "sv",  # Swedish
    "tr",  # Turkish
    "uk",  # Ukrainian
    # "zh-CN",  # Chinese (simplified) - REMOVED
]


PLACEHOLDER_PATTERN = re.compile(r"{{[^{}]+}}")


def split_placeholders(text: str) -> Iterable[Tuple[str, str]]:
    """Split a text into segments tagged as 'text' or 'placeholder'.

    This helper identifies all substrings of ``text`` that are enclosed in
    double curly braces (e.g. ``{{count}}``).  It yields tuples where the
    first element is either ``'text'`` or ``'placeholder'`` and the second
    element is the substring.  Literal text segments (those outside
    placeholders) may be empty strings.
    """
    last_index = 0
    for match in PLACEHOLDER_PATTERN.finditer(text):
        # part before the placeholder
        if match.start() > last_index:
            yield ("text", text[last_index: match.start()])
        # the placeholder itself
        yield ("placeholder", match.group())
        last_index = match.end()
    # remainder
    if last_index < len(text):
        yield ("text", text[last_index:])


def translate_string(translator: GoogleTranslator, s: str, dest: str) -> str:
    """Translate a single string to the destination language while preserving placeholders.

    The function splits the string around placeholders, translates only the
    literal text segments, and then concatenates everything back together.
    If a segment contains only whitespace, it will not be sent to the
    translator to avoid unnecessary API calls.
    """
    segments = []
    for seg_type, seg in split_placeholders(s):
        if seg_type == "placeholder":
            segments.append(seg)
        else:
            if seg.strip():
                # Translate non-empty text segment
                try:
                    # Add small delay to avoid rate limiting
                    time.sleep(0.1)
                    # Clean up problematic characters
                    clean_seg = seg.replace('-->', '→')
                    translated = translator.translate(clean_seg)
                    # Restore original characters if needed
                    if '→' in translated and '-->' in seg:
                        translated = translated.replace('→', '-->')
                except (TranslationNotFound, RequestError) as e:
                    print(f"\nWarning: Could not translate '{seg[:50]}...' - using original text")
                    translated = seg
                except Exception as e:
                    print(f"\nWarning: Translation error for '{seg[:50]}...' - {str(e)}")
                    translated = seg
            else:
                # Preserve whitespace
                translated = seg
            segments.append(translated)
    return "".join(segments)


def translate_object(
    translator: GoogleTranslator, obj: Any, dest: str
) -> Any:
    """Recursively translate all string values within a nested object.

    Non-string values (numbers, booleans, lists of non-strings, nested
    dictionaries) are copied verbatim.  Lists containing strings are
    translated element-wise.
    """
    if isinstance(obj, dict):
        return {k: translate_object(translator, v, dest) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [translate_object(translator, v, dest) for v in obj]
    elif isinstance(obj, str):
        return translate_string(translator, obj, dest)
    else:
        return obj


def merge_translations(
    source: Dict[str, Any], target: Dict[str, Any]
) -> Tuple[Dict[str, Any], int]:
    """Merge missing keys from the source into the target and count them.

    Existing keys in the target are left unchanged.  For any key that exists
    in the source but not in the target, a copy of the source value is
    inserted into the target.  The function returns the updated target and
    the number of keys added.  This is useful when you want to preserve
    manual translations and only fill in gaps.
    """
    added = 0
    for key, value in source.items():
        if isinstance(value, dict):
            # ensure nested structure exists
            sub_target = target.setdefault(key, {}) if isinstance(target.get(key), dict) else {}
            new_sub, sub_added = merge_translations(value, sub_target)
            if key not in target or not isinstance(target[key], dict):
                target[key] = new_sub
            added += sub_added
        else:
            if key not in target:
                target[key] = value
                added += 1
    return target, added


def main() -> None:
    parser = argparse.ArgumentParser(description="Translate LegacyGuard common.json into multiple languages")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Perform translation but do not write any files; just print summary.",
    )
    args = parser.parse_args()

    base_dir = Path("src/i18n/locales")
    en_path = base_dir / "en" / "common.json"
    if not en_path.exists():
        raise FileNotFoundError(f"English translation file not found: {en_path}")
    with en_path.open("r", encoding="utf-8") as f:
        en_data = json.load(f)

    summary: Dict[str, Tuple[int, int]] = {}
    for i, lang in enumerate(TARGET_LANGS, 1):
        print(f"\nProcessing {lang.upper()} ({i}/{len(TARGET_LANGS)})...")
        # Montenegrin (me) isn't supported by Google Translate, use Serbian (sr) instead
        translate_lang = 'sr' if lang == 'me' else lang
        translator = GoogleTranslator(source='en', target=translate_lang)
        dest_dir = base_dir / lang
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest_path = dest_dir / "common.json"

        if dest_path.exists():
            with dest_path.open("r", encoding="utf-8") as f:
                existing_data = json.load(f)
        else:
            existing_data = {}

        # Merge missing keys from English into existing translation to ensure we translate everything
        merged_data, added_count = merge_translations(en_data, existing_data)
        # Translate values from English if they are identical to English (i.e. missing or stale) and not yet translated
        translated_data = {}
        keys_translated = 0

        def _translate_recursive(src_obj: Any, tgt_obj: Any) -> Any:
            nonlocal keys_translated
            if isinstance(src_obj, dict):
                result = {}
                for k, v in src_obj.items():
                    existing = tgt_obj.get(k) if isinstance(tgt_obj, dict) else None
                    result[k] = _translate_recursive(v, existing)
                return result
            elif isinstance(src_obj, list):
                return [
                    _translate_recursive(v, tgt_obj[i] if isinstance(tgt_obj, list) and i < len(tgt_obj) else None)
                    for i, v in enumerate(src_obj)
                ]
            elif isinstance(src_obj, str):
                if tgt_obj and isinstance(tgt_obj, str) and not tgt_obj.startswith("[TRANSLATE]"):
                    # Preserve existing non-marker translation
                    return tgt_obj
                # Translate from English
                translated = translate_string(translator, src_obj, translate_lang)
                keys_translated += 1
                return translated
            else:
                return tgt_obj if tgt_obj is not None else src_obj

        translated_data = _translate_recursive(en_data, merged_data)
        summary[lang] = (added_count, keys_translated)

        if not args.dry_run:
            with dest_path.open("w", encoding="utf-8") as f:
                json.dump(translated_data, f, ensure_ascii=False, indent=2)

    # Print summary
    for lang, (added, translated) in sorted(summary.items()):
        print(f"{lang.upper()}: added {added} keys, translated {translated} values")


if __name__ == "__main__":
    main()