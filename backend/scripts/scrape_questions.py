import sys
import json
import argparse
import urllib.request
import urllib.parse
import re
import subprocess
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
        search_query = urllib.parse.quote(f"{topic} multiple choice questions and answers")
        url = f"https://html.duckduckgo.com/html/?q={search_query}"
        
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8', errors='ignore')
            
        # Extract snippets from DuckDuckGo HTML
        snippets = re.findall(r'<a class="result__snippet"[^>]*>(.*?)</a>', html, re.DOTALL)
        combined_text = "\n\n".join([re.sub(r'<[^>]*>', '', s) for s in snippets])
        
        return extract_questions_from_text(combined_text, topic, limit)
    except Exception as e:
        print(f"Fallback scraper failed: {e}", file=sys.stderr)
    return []

def extract_questions_from_text(text, topic, limit):
    # Basic text parsing to search for lines that look like questions with multiple options
    # Or text blocks containing Q:, A:, B:, C:, D:
    questions = []
    
    # Let's search for patterns like:
    # 1. Question text?
    # A) Option 1 B) Option 2 C) Option 3 D) Option 4
    # Answer: A
    pattern = r'(?:\d+\.|\?|^)\s*(.*?)\s*\n+\s*[aA][\)\.]\s*(.*?)\s*\n+\s*[bB][\)\.]\s*(.*?)\s*\n+\s*[cC][\)\.]\s*(.*?)\s*\n+\s*[dD][\)\.]\s*(.*?)(?:\n+.*?Answer:\s*([a-dA-D1-4]))?'
    matches = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)
    
    for m in matches:
        q_text = m[0].strip()
        opt_a = m[1].strip()
        opt_b = m[2].strip()
        opt_c = m[3].strip()
        opt_d = m[4].strip()
        ans_raw = m[5].strip() if len(m) > 5 else "A"
        
        if not q_text or not opt_a or not opt_b:
            continue
            
        options = [opt_a, opt_b, opt_c, opt_d]
        # Clean options
        options = [re.sub(r'^[a-dAD]\s*[\)\.]\s*', '', o).strip() for o in options]
        
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
