"""
Central configuration for the Cybersecurity Threat Intelligence Agent.
Values here mirror the constants defined in the original research
Jupyter Notebook (RSS feeds, threat categories, severity levels, MITRE
ATT&CK mapping) so the production backend stays faithful to the notebook.
"""
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------------------
# Security / Auth
# ---------------------------------------------------------------------------
SECRET_KEY = os.environ.get("APP_SECRET_KEY", "cti-agent-super-secret-key-change-in-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 12  # 12 hours

# Hardcoded, constant admin credentials as required by spec.
ADMIN_USERNAME = "Admin"
ADMIN_PASSWORD = "admin123"

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------
DB_PATH = os.path.join(BASE_DIR, "threat_intel.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

# ---------------------------------------------------------------------------
# Uploads
# ---------------------------------------------------------------------------
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# Notebook Part 2 -- RSS Feed Sources
# ---------------------------------------------------------------------------
RSS_FEEDS = {
    "The Hacker News": "https://feeds.feedburner.com/TheHackersNews",
    "BleepingComputer": "https://www.bleepingcomputer.com/feed/",
    "Krebs on Security": "https://krebsonsecurity.com/feed/",
    "Cisco Talos": "https://blog.talosintelligence.com/rss/",
    "Microsoft Security": "https://www.microsoft.com/en-us/security/blog/feed/",
    "CISA Alerts": "https://www.cisa.gov/cybersecurity-advisories/all.xml",
}

MAX_ARTICLES_PER_SOURCE = 10

# ---------------------------------------------------------------------------
# Notebook Part 3 -- Threat Categories / Severity / MITRE ATT&CK
# ---------------------------------------------------------------------------
THREAT_TYPES = [
    "Malware", "Ransomware", "Phishing", "Botnet", "Zero-Day", "APT",
    "Data Breach", "DDoS", "Credential Theft", "Supply Chain Attack",
    "Cloud Attack", "Insider Threat",
]

SEVERITY = {1: "Low", 2: "Medium", 3: "High", 4: "Critical"}

MITRE_ATTACK = {
    "Phishing": "T1566",
    "Credential Theft": "T1110",
    "Malware": "T1204",
    "Ransomware": "T1486",
    "Data Breach": "T1530",
    "DDoS": "T1498",
    "Botnet": "T1584",
    "APT": "T1583",
    "Zero-Day": "T1068",
}

# ---------------------------------------------------------------------------
# Notebook Part 4 -- Gemini AI Analysis
# ---------------------------------------------------------------------------
GEMINI_MODEL_NAME = os.environ.get("GEMINI_MODEL_NAME", "gemini-3.5-flash")

THREAT_PROMPT = """You are an expert Cyber Threat Intelligence Analyst.
Analyze the cyber security report below.
Return ONLY valid JSON in the following format.
{
  "executive_summary":"",
  "threat_name":"",
  "threat_category":"",
  "severity":"",
  "risk_score":"",
  "affected_sector":"",
  "attack_vector":"",
  "target":"",
  "mitre_attack":"",
  "cves":[],
  "iocs":{
      "ips":[],
      "domains":[],
      "urls":[]
  },
  "mitigation":[],
  "incident_response":[],
  "conclusion":""
}

Cyber Threat Report:
"""
