"""
Seeds the database with:
  - A demo user account (demo / demo1234)
  - A realistic set of sample threat intelligence articles (styled after
    the kind of results the notebook produced from real RSS feeds) so
    the Threat Search, Dashboard, and Chatbot work immediately offline,
    without requiring live internet access to RSS feeds or a Gemini key.

Run manually with: python seed_data.py
main.py also calls this automatically on first boot if the threats
table is empty.
"""
import json

from database import SessionLocal, engine, Base
import models
from auth import hash_password
from services.ioc_engine import full_pipeline

SAMPLE_ARTICLES = [
    {
        "source": "The Hacker News",
        "title": "DPRK-Linked macOS Malvertising Uses Fake Update Screens to Deploy EtherHiding Backdoor",
        "url": "https://thehackernews.com/sample/dprk-macos-malvertising",
        "published": "2026-07-20",
        "content": (
            "A sophisticated macOS malvertising campaign attributed to North Korean threat "
            "actors associated with the Contagious Interview cluster uses a ClickFix "
            "technique to compromise users. Victims are redirected via malicious search "
            "results to a fake macOS update screen that tricks them into executing a "
            "malicious curl command in Terminal. The malware uses blockchain-hosted "
            "command-and-control (EtherHiding) via Ethereum smart contracts to fetch "
            "secondary payloads, including a Node.js backdoor and an information stealer "
            "targeting cryptocurrency wallets. Indicators include the domains "
            "rg-telemetry.sbs and th-updates.sbs, and the malware campaign has been "
            "linked to CVE-2026-11029 in a related browser extension exploit."
        ),
    },
    {
        "source": "BleepingComputer",
        "title": "New LockBit-Style Ransomware Encrypts Corporate Networks via Exposed RDP",
        "url": "https://bleepingcomputer.com/sample/lockbit-style-ransomware",
        "published": "2026-07-22",
        "content": (
            "Security researchers have identified a new ransomware strain exploiting "
            "exposed Remote Desktop Protocol (RDP) endpoints to gain initial access to "
            "corporate networks. Once inside, the ransomware moves laterally, disables "
            "backups, and encrypts files, demanding payment in cryptocurrency. Analysts "
            "traced command-and-control traffic to IP address 185.220.101.47 and the "
            "domain paylock-restore.top. The campaign has affected manufacturing and "
            "logistics firms across Europe. Related vulnerability: CVE-2026-30122."
        ),
    },
    {
        "source": "Krebs on Security",
        "title": "Massive Phishing Campaign Targets Bank Customers with Fake MFA Prompts",
        "url": "https://krebsonsecurity.com/sample/phishing-mfa-bypass",
        "published": "2026-07-24",
        "content": (
            "A large-scale phishing campaign is targeting bank customers with emails "
            "impersonating fraud alerts, directing victims to credential-harvesting pages "
            "hosted at secure-login-bankalert.com. The kit includes real-time MFA prompt "
            "relay to bypass two-factor authentication and harvest one-time passcodes. "
            "Victims' credentials are exfiltrated to an attacker-controlled server at "
            "URL https://secure-login-bankalert.com/collect and email drop accounts "
            "such as collect@mailrelay-fraud.com."
        ),
    },
    {
        "source": "Cisco Talos",
        "title": "Zero-Day in Popular VPN Appliance Exploited by APT Group for Espionage",
        "url": "https://blog.talosintelligence.com/sample/vpn-zero-day-apt",
        "published": "2026-07-18",
        "content": (
            "Talos researchers have identified active exploitation of a zero-day "
            "vulnerability, tracked as CVE-2026-24911, in a widely used enterprise VPN "
            "appliance. The flaw allows unauthenticated remote code execution and has "
            "been leveraged by an advanced persistent threat (APT) group believed to be "
            "conducting espionage against government and defense contractors. "
            "Post-exploitation activity includes deployment of a custom implant that "
            "communicates with infrastructure at IP 45.155.204.12 and domain "
            "gov-update-portal.net."
        ),
    },
    {
        "source": "Microsoft Security",
        "title": "Cloud Storage Misconfiguration Leads to Data Breach Exposing 2 Million Records",
        "url": "https://microsoft.com/en-us/security/blog/sample/cloud-breach",
        "published": "2026-07-25",
        "content": (
            "A misconfigured cloud storage bucket exposed over 2 million customer records "
            "including names, emails, and partial payment data. The breach was discovered "
            "after researchers found the bucket publicly accessible without authentication. "
            "Affected records included addresses such as support@retailcorp-example.com. "
            "The exposure highlights ongoing risks in cloud attack surface management "
            "and misconfigured access control lists across multi-cloud environments."
        ),
    },
    {
        "source": "CISA Alerts",
        "title": "CISA Warns of Botnet Exploiting IoT Devices for Large-Scale DDoS Attacks",
        "url": "https://cisa.gov/sample/iot-botnet-ddos-alert",
        "published": "2026-07-26",
        "content": (
            "CISA has issued an alert regarding a growing botnet composed of compromised "
            "IoT devices, including routers and IP cameras, being used to launch "
            "distributed denial-of-service (DDoS) attacks against critical infrastructure "
            "and financial services websites. Command-and-control traffic has been traced "
            "to IP addresses 91.240.118.33 and 103.224.182.90. Organizations are urged to "
            "patch IoT firmware and disable default credentials, related to CVE-2025-41207."
        ),
    },
    {
        "source": "The Hacker News",
        "title": "Supply Chain Attack Compromises Popular npm Package Used by Thousands of Developers",
        "url": "https://thehackernews.com/sample/npm-supply-chain-attack",
        "published": "2026-07-27",
        "content": (
            "A popular npm package was compromised after an attacker gained access to a "
            "maintainer's account, injecting malicious code that harvested environment "
            "variables and credentials from CI/CD pipelines. The malicious version "
            "exfiltrated data to webhook-relay-npm.sbs. Developers are urged to audit "
            "dependencies and rotate any credentials that may have been exposed during "
            "the supply chain attack window."
        ),
    },
    {
        "source": "BleepingComputer",
        "title": "Insider Threat: Former Employee Steals Source Code Before Resignation",
        "url": "https://bleepingcomputer.com/sample/insider-threat-source-code",
        "published": "2026-07-15",
        "content": (
            "A technology company disclosed that a former employee exfiltrated "
            "proprietary source code and internal documentation to a personal cloud "
            "storage account in the weeks prior to their resignation. Forensic "
            "investigators identified unauthorized access patterns and large file "
            "transfers, an example of insider threat risk that traditional perimeter "
            "security controls fail to address. The company has since implemented "
            "stricter data loss prevention monitoring."
        ),
    },
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(models.User).filter(models.User.username == "demo").first() is None:
            demo_user = models.User(
                username="demo",
                email="demo@threatintel.local",
                full_name="Demo Analyst",
                hashed_password=hash_password("demo1234"),
                role="user",
            )
            db.add(demo_user)
            db.commit()
            print("Seeded demo user -> username: demo / password: demo1234")

        if db.query(models.Threat).count() == 0:
            for item in SAMPLE_ARTICLES:
                pipeline = full_pipeline(item["content"])
                threat = models.Threat(
                    source=item["source"],
                    article_title=item["title"],
                    url=item["url"],
                    published=item["published"],
                    content=item["content"],
                    threat_type=pipeline["threat_type"],
                    severity=pipeline["severity"],
                    mitre=pipeline["mitre"],
                    ip_count=pipeline["counts"]["ip_count"],
                    domain_count=pipeline["counts"]["domain_count"],
                    url_count=pipeline["counts"]["url_count"],
                    cve_count=pipeline["counts"]["cve_count"],
                    email_count=pipeline["counts"]["email_count"],
                    sha256_count=pipeline["counts"]["sha256_count"],
                    md5_count=pipeline["counts"]["md5_count"],
                    ips=json.dumps(pipeline["iocs"]["IPs"]),
                    domains=json.dumps(pipeline["iocs"]["Domains"]),
                    urls=json.dumps(pipeline["iocs"]["URLs"]),
                    cves=json.dumps(pipeline["iocs"]["CVEs"]),
                    emails=json.dumps(pipeline["iocs"]["Emails"]),
                    sha256=json.dumps(pipeline["iocs"]["SHA256"]),
                    md5=json.dumps(pipeline["iocs"]["MD5"]),
                )
                db.add(threat)
            db.commit()
            print(f"Seeded {len(SAMPLE_ARTICLES)} sample threat intelligence articles")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
