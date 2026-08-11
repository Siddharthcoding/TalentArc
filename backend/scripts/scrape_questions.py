import sys
import json
import argparse
import urllib.request
import urllib.parse
import html
import re
import asyncio

# Standard import check/install helper
def ensure_package(package_name, install_name=None):
    try:
        __import__(package_name)
        return True
    except ImportError:
        print(f"[{package_name}] package not found. Skipping crawl4ai.", file=sys.stderr)
        return False

async def run_crawl4ai_async(topic, limit):
    # Ensure crawl4ai is installed
    if ensure_package("crawl4ai"):
        try:
            # crawl4ai uses playwright, ensure it is installed and configured
            ensure_package("playwright")
            
            from crawl4ai import AsyncWebCrawler
            
            # Formulate a search URL or target URL
            search_query = urllib.parse.quote(f"{topic} mcq questions answers quiz")
            url = f"https://www.bing.com/search?q={search_query}"
            
            async with AsyncWebCrawler() as crawler:
                result = await crawler.arun(url=url)
                markdown_content = result.markdown
            
            # Simple extractor of questions from scraped text
            questions = extract_questions_from_text(markdown_content, topic, limit)
            if questions:
                return questions
        except Exception as e:
            print(f"Crawl4ai execution failed: {e}", file=sys.stderr)
    return []

def run_fallback_scraper(topic, limit):
    # Standard urllib + regex fallback, requires no external dependencies
    try:
        search_pages = fetch_search_pages(topic)
        page_texts = []
        for search_html in search_pages:
            questions = extract_questions_from_text(html_to_text(search_html), topic, limit)
            if questions:
                return questions[:limit]
            page_texts.append(html_to_text(search_html))

        links = []
        for search_html in search_pages:
            links.extend(extract_result_links(search_html))
        links = list(dict.fromkeys(links))

        print(f"Found {len(links)} candidate result links for {topic}", file=sys.stderr)
        for link in links[:8]:
            text = fetch_page_text(link)
            if text:
                page_texts.append(text)
            combined = "\n\n".join(page_texts)
            questions = extract_questions_from_text(combined, topic, limit)
            if len(questions) >= limit:
                return questions[:limit]
        
        return extract_questions_from_text("\n\n".join(page_texts), topic, limit)
    except Exception as e:
        print(f"Fallback scraper failed: {e}", file=sys.stderr)
    return []

def fetch_search_pages(topic):
    query = urllib.parse.quote(f'"{topic}" mcq questions answers quiz')
    search_urls = [
        f"https://html.duckduckgo.com/html/?q={query}",
        f"https://www.bing.com/search?q={query}",
    ]
    pages = []
    for url in search_urls:
        try:
            req = urllib.request.Request(
                url,
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                pages.append(response.read().decode('utf-8', errors='ignore'))
        except Exception as e:
            print(f"Search fetch failed for {url}: {e}", file=sys.stderr)
    return pages

def html_to_text(raw_html):
    text = re.sub(r'(?is)<(script|style).*?>.*?</\1>', ' ', raw_html)
    text = re.sub(r'(?i)<br\s*/?>', '\n', text)
    text = re.sub(r'(?i)</(p|div|li|tr|h[1-6])>', '\n', text)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = html.unescape(text)
    text = re.sub(r'\r', '\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n\s*\n+', '\n\n', text)
    return text.strip()

def extract_result_links(raw_html):
    links = []
    patterns = [
        r'<a[^>]+class="[^"]*result__a[^"]*"[^>]+href="([^"]+)"',
        r'<a[^>]+class="[^"]*result-link[^"]*"[^>]+href="([^"]+)"',
        r'<h2[^>]*>\s*<a[^>]+href="([^"]+)"',
        r'<a[^>]+href="(https?://[^"]+)"',
    ]
    for pattern in patterns:
        links.extend(re.findall(pattern, raw_html, re.I))

    cleaned = []
    for match in links:
        link = html.unescape(match)
        parsed = urllib.parse.urlparse(link)
        if parsed.path.startswith('/l/') or 'uddg=' in parsed.query:
            query = urllib.parse.parse_qs(parsed.query)
            link = query.get('uddg', [link])[0]
        host = urllib.parse.urlparse(link).netloc.lower()
        if (
            link.startswith('http')
            and 'duckduckgo.com' not in host
            and 'bing.com' not in host
            and 'microsoft.com' not in host
            and not link.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.pdf'))
        ):
            cleaned.append(link)
    return list(dict.fromkeys(cleaned))

def fetch_page_text(url):
    try:
        req = urllib.request.Request(
            url,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        with urllib.request.urlopen(req, timeout=8) as response:
            content_type = response.headers.get('content-type', '')
            if 'text/html' not in content_type and 'text/plain' not in content_type:
                return ''
            raw_html = response.read(500000).decode('utf-8', errors='ignore')
        return html_to_text(raw_html)
    except Exception as e:
        print(f"Could not fetch result page {url}: {e}", file=sys.stderr)
        return ''

def extract_questions_from_text(text, topic, limit):
    # Basic text parsing to search for lines that look like questions with multiple options
    # Or text blocks containing Q:, A:, B:, C:, D:
    questions = []
    
    # Let's search for patterns like:
    # 1. Question text?
    # A) Option 1 B) Option 2 C) Option 3 D) Option 4
    # Answer: A
    normalized = re.sub(r'\s+', ' ', text)
    pattern = (
        r'(?:^|\s)(?:Q(?:uestion)?\.?\s*)?(?:\d+[\).]\s*)?'
        r'([^?.!]{10,220}\?)\s*'
        r'(?:A|a|1)[\).:-]\s*(.{1,180}?)\s+'
        r'(?:B|b|2)[\).:-]\s*(.{1,180}?)\s+'
        r'(?:C|c|3)[\).:-]\s*(.{1,180}?)\s+'
        r'(?:D|d|4)[\).:-]\s*(.{1,180}?)(?=\s+(?:Answer|Ans|Correct|Q(?:uestion)?\.?\s*\d+|\d+[\).]\s*[^?.!]{10,220}\?)|$)'
        r'(?:\s+(?:Answer|Ans|Correct(?: Answer)?)\s*[:\-]?\s*([A-Da-d1-4]))?'
    )
    matches = re.findall(pattern, normalized, re.IGNORECASE)
    
    for m in matches:
        q_text = m[0].strip()
        opt_a = m[1].strip()
        opt_b = m[2].strip()
        opt_c = m[3].strip()
        opt_d = m[4].strip()
        ans_raw = m[5].strip() if len(m) > 5 else "A"
        
        if not q_text or not opt_a or not opt_b or len(q_text) < 10:
            continue
            
        options = [opt_a, opt_b, opt_c, opt_d]
        # Clean options
        options = [re.sub(r'^[a-dAD1-4]\s*[\)\.:-]\s*', '', o).strip(" -:;") for o in options]
        if len(set(o.lower() for o in options if o)) < 4:
            continue
        
        correct_map = {'A': 0, 'B': 1, 'C': 2, 'D': 3, '1': 0, '2': 1, '3': 2, '4': 3}
        correct_idx = correct_map.get(ans_raw.upper(), 0)
        
        questions.append({
            "topic": topic,
            "question_text": q_text,
            "options": options,
            "correct_option": correct_idx,
            "explanation": f"This question about {topic} was scraped from online reference materials.",
            "difficulty": "Medium"
        })
        
        if len(questions) >= limit:
            break

    if len(questions) < limit:
        questions.extend(extract_line_based_questions(text, topic, limit - len(questions)))

    return questions

def extract_line_based_questions(text, topic, limit):
    questions = []
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    for idx, line in enumerate(lines):
        q_match = re.match(r'^(?:Q(?:uestion)?\.?\s*)?(?:\d+[\).]\s*)?(.{10,220}\?)$', line, re.I)
        if not q_match:
            continue

        option_lines = []
        answer_line = ""
        for next_line in lines[idx + 1:idx + 10]:
            if re.match(r'^(?:[A-Da-d]|[1-4])[\).:-]\s+.+', next_line):
                option_lines.append(next_line)
            if re.match(r'^(?:Answer|Ans|Correct(?: Answer)?)\s*[:\-]?\s*[A-Da-d1-4]', next_line):
                answer_line = next_line
            if len(option_lines) >= 4 and answer_line:
                break

        if len(option_lines) < 4:
            continue

        options = [
            re.sub(r'^(?:[A-Da-d]|[1-4])[\).:-]\s*', '', opt).strip(" -:;")
            for opt in option_lines[:4]
        ]
        if len(set(o.lower() for o in options if o)) < 4:
            continue

        ans_match = re.search(r'([A-Da-d1-4])', answer_line)
        correct_map = {'A': 0, 'B': 1, 'C': 2, 'D': 3, '1': 0, '2': 1, '3': 2, '4': 3}
        correct_idx = correct_map.get(ans_match.group(1).upper(), 0) if ans_match else 0

        questions.append({
            "topic": topic,
            "question_text": q_match.group(1).strip(),
            "options": options,
            "correct_option": correct_idx,
            "explanation": f"This question about {topic} was scraped from online reference materials.",
            "difficulty": "Medium"
        })
        if len(questions) >= limit:
            break
    return questions

def run_crawl4ai(topic, limit):
    """Synchronously run the async crawl4ai scraper and return results."""
    return asyncio.run(run_crawl4ai_async(topic, limit))

def main():
    parser = argparse.ArgumentParser(description="Scrape questions for a topic")
    parser.add_argument("--topic", required=True, type=str)
    parser.add_argument("--limit", default=5, type=int)
    args = parser.parse_args()

    # Directly use the fallback scraper to avoid crawl4ai dependency issues
    try:
        questions = run_fallback_scraper(args.topic, args.limit)
    except Exception as e:
        print(f"Fallback scraper error: {e}", file=sys.stderr)
        questions = []

    # Return questions JSON
    print(json.dumps(questions))


if __name__ == "__main__":
    main()
