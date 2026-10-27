"""
Direct port of the notebook's Part 3: IOC Extraction & Threat
Intelligence Processing logic.

Every function here mirrors the notebook cell-for-cell so results are
identical to what the research notebook produced:
    - IP_REGEX / DOMAIN_REGEX / URL_REGEX / CVE_REGEX / EMAIL_REGEX /
      SHA256_REGEX / MD5_REGEX
    - extract_matches()
    - extract_iocs()
    - classify_threat()
    - calculate_severity()
    - mitre_mapping()
"""
import re

from config import MITRE_ATTACK

# ---------------------------------------------------------------------------
# IOC Regular Expressions (notebook cell "IOC Regular Expressions")
# ---------------------------------------------------------------------------
IP_REGEX = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
DOMAIN_REGEX = r'\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b'
URL_REGEX = r'https?://[^\s<>"\'()]+'
CVE_REGEX = r'CVE-\d{4}-\d{4,7}'
EMAIL_REGEX = r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
SHA256_REGEX = r'\b[a-fA-F0-9]{64}\b'
MD5_REGEX = r'\b[a-fA-F0-9]{32}\b'


def extract_matches(pattern: str, text) -> list:
    """notebook: extract_matches()"""
    if text is None:
        return []
    matches = re.findall(pattern, str(text))
    matches = list(set(matches))
    return matches


def extract_iocs(text) -> dict:
    """notebook: extract_iocs()"""
    return {
        "IPs": extract_matches(IP_REGEX, text),
        "Domains": extract_matches(DOMAIN_REGEX, text),
        "URLs": extract_matches(URL_REGEX, text),
        "CVEs": extract_matches(CVE_REGEX, text),
        "Emails": extract_matches(EMAIL_REGEX, text),
        "SHA256": extract_matches(SHA256_REGEX, text),
        "MD5": extract_matches(MD5_REGEX, text),
    }


def classify_threat(text) -> str:
    """notebook: classify_threat()"""
    text = str(text).lower()
    mapping = {
        "ransomware": "Ransomware",
        "malware": "Malware",
        "phishing": "Phishing",
        "ddos": "DDoS",
        "botnet": "Botnet",
        "zero-day": "Zero-Day",
        "zero day": "Zero-Day",
        "apt": "APT",
        "credential": "Credential Theft",
        "breach": "Data Breach",
        "cloud": "Cloud Attack",
        "insider": "Insider Threat",
    }
    for keyword, label in mapping.items():
        if keyword in text:
            return label
    return "Other"


def calculate_severity(cve_count: int, ip_count: int, domain_count: int,
                        url_count: int, threat_type: str) -> str:
    """notebook: calculate_severity() -- adapted to accept plain args
    instead of a pandas row so it can be reused outside a DataFrame."""
    score = 0
    score += cve_count * 3
    score += ip_count
    score += domain_count
    score += url_count

    if threat_type == "Ransomware":
        score += 6
    elif threat_type == "APT":
        score += 5
    elif threat_type == "Zero-Day":
        score += 5
    elif threat_type == "Data Breach":
        score += 4
    elif threat_type == "Malware":
        score += 3

    if score >= 10:
        return "Critical"
    elif score >= 7:
        return "High"
    elif score >= 4:
        return "Medium"
    else:
        return "Low"


def mitre_mapping(threat_type: str) -> str:
    """notebook: mitre_mapping()"""
    return MITRE_ATTACK.get(threat_type, "Unknown")


def full_pipeline(text: str) -> dict:
    """
    Convenience wrapper that runs the entire notebook Part 3 pipeline
    (IOC extraction -> classification -> severity -> MITRE mapping) on a
    single piece of text, e.g. for the "Threat Detection" and "Severity
    Detection" modules and for file uploads.
    """
    iocs = extract_iocs(text)
    threat_type = classify_threat(text)
    severity = calculate_severity(
        cve_count=len(iocs["CVEs"]),
        ip_count=len(iocs["IPs"]),
        domain_count=len(iocs["Domains"]),
        url_count=len(iocs["URLs"]),
        threat_type=threat_type,
    )
    mitre = mitre_mapping(threat_type)
    counts = {
        "ip_count": len(iocs["IPs"]),
        "domain_count": len(iocs["Domains"]),
        "url_count": len(iocs["URLs"]),
        "cve_count": len(iocs["CVEs"]),
        "email_count": len(iocs["Emails"]),
        "sha256_count": len(iocs["SHA256"]),
        "md5_count": len(iocs["MD5"]),
    }
    return {
        "iocs": iocs,
        "threat_type": threat_type,
        "severity": severity,
        "mitre": mitre,
        "counts": counts,
    }
