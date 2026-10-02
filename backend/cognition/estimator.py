# cognition/estimator.py

import re
from typing import List

TECHNICAL_TERMS = {
    "gradient", "loss", "optimization", "vector",
    "embedding", "probability", "model", "parameter"
}

class CognitiveStateEstimator:
    def __init__(self):
        self.followup_count = 0

    def estimate(self, question: str, previous_questions: List[str] = None) -> str:
        score = 0

        words = question.lower().split()
        word_count = len(words)

        # 1. Question length
        if word_count < 6:
            score -= 1
        elif word_count > 15:
            score += 1

        # 2. Technical vocabulary
        tech_hits = sum(1 for w in words if w in TECHNICAL_TERMS)
        score += tech_hits * 0.5

        # 3. Clarification markers
        if re.search(r"\b(why|how|explain|clarify)\b", question.lower()):
            score += 0.5

        # 4. Follow-up behavior
        if previous_questions:
            if question in previous_questions:
                score -= 0.5
            if len(previous_questions) > 2:
                score += 0.5

        # Final mapping
        if score <= 0:
            return "BEGINNER"
        elif score <= 2:
            return "INTERMEDIATE"
        else:
            return "ADVANCED"
