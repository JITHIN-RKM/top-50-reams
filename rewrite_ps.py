import json
import random
import re

def rewrite_text(text):
    if not isinstance(text, str):
        return text
    # Simple grammar/word replacements to "rewrite" the text
    replacements = {
        "This problem statement proposes": "The goal is",
        "development of": "to build",
        "capable of": "that can",
        "real time": "real-time",
        "In addition": "Furthermore",
        "A scalable": "An adaptable",
        "The solution should": "The expected system must",
        "to identify": "to detect",
        "impact": "effect",
        "platform": "system"
    }
    for k, v in replacements.items():
        text = text.replace(k, v)
        text = text.replace(k.lower(), v.lower())
    return text

def convert_tier_to_score(tier, is_effort=False):
    tier = str(tier).lower()
    if 'low' in tier or 'tight' in tier: return 1 if not is_effort else 1
    if 'medium' in tier or 'standard' in tier: return 3
    if 'high' in tier: return 4
    if 'breakthrough' in tier or 'disruption' in tier: return 5
    return 3

with open('sih2026-ps-codehunters.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

new_data = []
for item in data:
    level1 = {
        "background": rewrite_text(item.get("background", "")),
        "the_ask": rewrite_text(item.get("problem_decode", {}).get("plain_summary", "")),
        "real_struggle": rewrite_text(" ".join(item.get("problem_decode", {}).get("pain_points", []))),
        "expected_solution": rewrite_text(item.get("description", "")),
        "key_points": [rewrite_text(bp) for bp in item.get("expected_solution_bullets", [])]
    }
    
    inn_tier = item.get("evaluation_scorecard", {}).get("innovation", {}).get("tier", "Standard")
    eff_tier = item.get("evaluation_scorecard", {}).get("invention", {}).get("tier", "Medium")
    
    level2 = {
        "innovation_scope": convert_tier_to_score(inn_tier),
        "invention_effort": convert_tier_to_score(eff_tier, True)
    }
    
    new_item = {
        "id": item.get("ps_number", ""),
        "title": rewrite_text(item.get("title", "")),
        "organization": item.get("org", ""),
        "theme": item.get("theme", ""),
        "category": item.get("category", ""),
        "level1": level1,
        "level2": level2
    }
    new_data.append(new_item)

with open('src/data/sih-2026-data.json', 'w', encoding='utf-8') as f:
    json.dump(new_data, f, indent=2)

print(f"Successfully rewrote {len(new_data)} problem statements!")
