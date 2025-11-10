"""Module for privacy utils embedded into observability tools.

Contains:
* pii_masker wrapper function to mask PII data in Dict, List, and String formats.
* string_masker function to mask sensitive information (emails & phone numbers).

"""

import re


def pii_masker(data, **kwargs):
    # Example: Simple email masking. Implement your more robust logic here.
    if isinstance(data, str):
        return string_masker(data)
    elif isinstance(data, dict):
        return {k: string_masker(data=v) for k, v in data.items()}
    elif isinstance(data, list):
        return [string_masker(data=item) for item in data]
    return data


def string_masker(data: str) -> str:
    """Mask sensitive information in the data."""
    # Mask email addresses (keep first & last character of username + domain)
    data = re.sub(
        r"\b([\w.-])[^\s@]*?([\w.-])@(\w+?\.\w+?)\b",
        r"[REDACTED EMAIL: \1***\2@\3]",
        data,
    )
    # Mask phone numbers (keep last 4 digits)
    data = re.sub(
        r"\b\d{3}[-. ]?\d{3}[-. ]?(\d{4})\b",
        r"[REDACTED PHONE: ***\1]",
        data,
    )
    return data
