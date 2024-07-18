import os
from elasticsearch import Elasticsearch
from bs4 import BeautifulSoup
import re

def highlight_text(text, search_term):
    """Highlight the search term in the given text."""
    highlighted_term = f"\033[1;31m{search_term}\033[0m"
    return text.replace(search_term, highlighted_term)

def strip_html_tags(html_content):
    """Remove HTML tags from the content."""
    soup = BeautifulSoup(html_content, "html.parser")
    return soup.get_text()

def normalize_whitespace(text):
    """Remove extra spaces and line breaks from text."""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def search_elasticsearch(es_host, index_names, search_term, num_results=10, context_chars=50):
    es = Elasticsearch(es_host)
    
    seen_urls = set()
    page = 0
    per_page = num_results
    total_hits = 0

    results_with_context = []
    results_without_context = []
    
    try:
        while True:
            query = {
                "from": page * per_page,
                "size": per_page,
                "query": {
                    "multi_match": {
                        "query": search_term,
                        "fields": ["title", "html_content"],
                        "fuzziness": "AUTO"
                    }
                },
                "_source": ["title", "html_content", "source_url"],
                "sort": [
                    {"_score": {"order": "desc"}}
                ]
            }
            
            print(f"Querying Elasticsearch with page: {page}, per_page: {per_page}")
            results = es.search(index=index_names, body=query)
            total_hits = results['hits']['total']['value']
            print(f"Total hits: {total_hits}")
            
            if not results['hits']['hits']:
                print("No hits found.")
                break
            
            for hit in results['hits']['hits']:
                source = hit['_source']
                title = source.get('title', 'No title available')
                html_content = source.get('html_content', '')
                source_url = source.get('source_url', 'No URL available')
                
                base_url = source_url.split('/')[2]  # Extract the base URL
                
                if base_url in seen_urls:
                    continue
                
                seen_urls.add(base_url)
                
                text_content = normalize_whitespace(strip_html_tags(html_content)) if html_content else ""
                start_pos = text_content.lower().find(search_term.lower())
                if start_pos != -1:
                    context_start = max(0, start_pos - context_chars)
                    context_end = start_pos + context_chars + len(search_term)
                    context = text_content[context_start:context_end]
                    highlighted_context = highlight_text(context, search_term)
                    results_with_context.append((title, source_url, highlighted_context))
                else:
                    results_without_context.append((title, source_url))
            
            page += 1
            if len(seen_urls) >= total_hits or len(seen_urls) >= num_results:
                break
    
    except Exception as e:
        print(f"\033[1;31mError querying Elasticsearch:\033[0m {e}")

    # Display results with context first
    for title, source_url, highlighted_context in results_with_context:
        print(f"\033[1;34mTitle:\033[0m {title}")
        print(f"\033[1;34mURL:\033[0m {source_url}")
        print(f"\033[1;34mContext:\033[0m ...{highlighted_context}...")
        print("-" * 80)

    # Display results without context
    for title, source_url in results_without_context:
        print(f"\033[1;34mTitle:\033[0m {title}")
        print(f"\033[1;34mURL:\033[0m {source_url}")
        print("\033[1;34mContext:\033[0m No match found in content.")
        print("-" * 80)

# Example usage:
if __name__ == "__main__":
    es_host = os.getenv("ES_HOST", "http://localhost:9200")
    index_names = "dark_data_markets,dark_data_forums,dark_data_others"  # Comma-separated index names
    search_term = input("Enter search term: ")
    num_results = int(input("Enter number of results to display: "))
    context_chars = int(input("Enter number of context characters around the search term: "))

    search_elasticsearch(es_host, index_names, search_term, num_results, context_chars)