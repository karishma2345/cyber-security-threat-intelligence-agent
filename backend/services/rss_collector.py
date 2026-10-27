"""
Port of the notebook's Part 2: Threat Collection.

collect_threat_intelligence() mirrors the notebook loop that iterates
RSS_FEEDS, parses each feed with feedparser, and pulls the article title,
link, published date and summary/content -- capped at
MAX_ARTICLES_PER_SOURCE entries per source.

Requires outbound internet access to the configured RSS feed hosts.
When feeds are unreachable (offline dev/sandbox), individual sources are
skipped gracefully and whatever succeeded is returned.
"""
import feedparser

from config import RSS_FEEDS, MAX_ARTICLES_PER_SOURCE


def _clean(value: str) -> str:
    return (value or "").strip()


def collect_threat_intelligence(feeds: dict = None, max_per_source: int = None) -> list:
    feeds = feeds or RSS_FEEDS
    max_per_source = max_per_source or MAX_ARTICLES_PER_SOURCE

    threat_data = []
    for source_name, rss in feeds.items():
        try:
            feed = feedparser.parse(rss)
            entries = feed.entries[:max_per_source]
        except Exception:
            entries = []

        for article in entries:
            try:
                title = _clean(getattr(article, "title", ""))
                url = _clean(getattr(article, "link", ""))
                published = _clean(getattr(article, "published", "") or getattr(article, "updated", ""))
                content = _clean(getattr(article, "summary", "") or getattr(article, "description", ""))

                if not title or not url:
                    continue

                threat_data.append({
                    "Source": source_name,
                    "Article_Title": title,
                    "URL": url,
                    "Published": published,
                    "Content": content,
                })
            except Exception:
                continue

    return threat_data
