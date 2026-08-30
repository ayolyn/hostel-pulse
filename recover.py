import json
import os

log_file = r"C:\Users\USER\.gemini\antigravity\brain\f3159b35-58ce-4b96-aa97-0b4226b0855f\.system_generated\logs\transcript.jsonl"
target_file = r"c:\Users\USER\Documents\hostelio-app\app\hq_admin_7X9A3vB8nK2mQ5wE1pL0zY4c\page.tsx"

contents = None

with open(log_file, "r", encoding="utf-8") as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get("type") == "PLANNER_RESPONSE":
                # Check if it was a view_file response that showed the whole file... but view_file only showed parts.
                # Is there a moment when I wrote the whole file?
                pass
        except:
            pass

print("Looking for file...")
