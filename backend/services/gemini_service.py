"""
Port of the notebook's Part 4: AI-Powered Threat Analysis using
Google Gemini.

analyze_threat() mirrors the notebook function exactly: it builds the
prompt from THREAT_PROMPT + article text (truncated to 12000 chars),
calls the Gemini model, strips markdown code fences and parses JSON.

Because a Gemini API key isn't always configured (e.g. fresh install,
offline demo), a deterministic rule-based fallback analyzer is provided
so every module of the app still works end-to-end without the key. Once
the Admin adds a real key in Admin > API Integration, responses switch
to genuine Gemini analysis automatically.
"""
import json
from typing import Optional

from config import THREAT_PROMPT, GEMINI_MODEL_NAME
from services.ioc_engine import full_pipeline

_EMPTY_RESULT = {
    "executive_summary": "",
    "threat_name": "",
    "threat_category": "",
    "severity": "Unknown",
    "risk_score": "0",
    "affected_sector": "",
    "attack_vector": "",
    "target": "",
    "mitre_attack": "",
    "cves": [],
    "iocs": {"ips": [], "domains": [], "urls": []},
    "mitigation": [],
    "incident_response": [],
    "conclusion": "",
}


def _fallback_analysis(article_text: str, title: str = "") -> dict:
    """Rule-based stand-in used when no Gemini API key is configured."""
    pipeline = full_pipeline(article_text)
    iocs = pipeline["iocs"]
    threat_type = pipeline["threat_type"]
    severity = pipeline["severity"]

    snippet = (article_text or "").strip().replace("\n", " ")
    summary = snippet[:400] + ("..." if len(snippet) > 400 else "")

    mitigation_map = {
        "Ransomware": [
            "Maintain immutable, offline backups and test restoration regularly.",
            "Patch internet-facing systems and disable unused RDP/SMB exposure.",
            "Deploy endpoint detection and response (EDR) with ransomware behavior rules.",
        ],
        "Phishing": [
            "Enforce phishing-resistant MFA (FIDO2 / hardware keys).",
            "Run continuous security-awareness and simulated phishing training.",
            "Deploy email authentication (SPF, DKIM, DMARC) and URL sandboxing.",
        ],
        "Malware": [
            "Keep signatures and behavioral detection engines up to date.",
            "Restrict script execution policies and enforce application allow-listing.",
            "Isolate and analyze suspicious binaries in a sandboxed environment.",
        ],
        "Zero-Day": [
            "Apply vendor patches or mitigations as soon as they are released.",
            "Deploy virtual patching / WAF rules while a fix is pending.",
            "Increase monitoring on affected components for exploitation attempts.",
        ],
        "Data Breach": [
            "Rotate and revoke exposed credentials immediately.",
            "Notify affected stakeholders per regulatory requirements.",
            "Review data access logs for unauthorized exfiltration.",
        ],
    }
    mitigation = mitigation_map.get(threat_type, [
        "Monitor indicators of compromise across the environment.",
        "Apply defense-in-depth controls and least-privilege access.",
        "Review logs for related suspicious activity.",
    ])

    return {
        "executive_summary": summary or "No article content supplied for analysis.",
        "threat_name": title or threat_type,
        "threat_category": threat_type,
        "severity": severity,
        "risk_score": {"Critical": "9.5", "High": "7.5", "Medium": "5.0", "Low": "2.5"}.get(severity, "0"),
        "affected_sector": "Not specified (rule-based analysis)",
        "attack_vector": threat_type,
        "target": "Not specified (rule-based analysis)",
        "mitre_attack": pipeline["mitre"],
        "cves": iocs["CVEs"],
        "iocs": {
            "ips": iocs["IPs"],
            "domains": iocs["Domains"],
            "urls": iocs["URLs"],
        },
        "mitigation": mitigation,
        "incident_response": [
            "Isolate affected hosts from the network.",
            "Preserve forensic evidence (memory, logs, disk images).",
            "Engage the incident response team and follow the IR playbook.",
        ],
        "conclusion": (
            f"This {threat_type.lower()} activity was assessed as {severity} severity "
            f"using local heuristic analysis. Connect a Gemini API key in Admin > "
            f"API Integration for full AI-generated threat intelligence."
        ),
        "engine": "fallback-heuristic",
    }


def analyze_threat(article_text: str, title: str = "", api_key: Optional[str] = None,
                    model_name: Optional[str] = None) -> dict:
    """
    Mirrors the notebook's analyze_threat(article). If no api_key is
    configured, falls back to a deterministic local analyzer so the
    feature remains fully usable offline / without billing.
    """
    if not api_key:
        return _fallback_analysis(article_text, title)

    try:
        from google import genai  # import here so the app runs even if the
        client = genai.Client(api_key=api_key)          # package isn't installed
        model = model_name or GEMINI_MODEL_NAME
        prompt = THREAT_PROMPT + (article_text or "")[:12000]

        response = client.models.generate_content(model=model, contents=prompt)
        text = response.text.strip()

        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        result = json.loads(text)
        result["engine"] = f"gemini:{model}"
        return result
    except Exception as e:
        result = dict(_EMPTY_RESULT)
        result["error"] = str(e)
        result["engine"] = "gemini-error-fallback"
        # Still give the user something useful instead of an empty shell
        fb = _fallback_analysis(article_text, title)
        fb["engine"] = "fallback-heuristic (gemini call failed)"
        fb["gemini_error"] = str(e)
        return fb
