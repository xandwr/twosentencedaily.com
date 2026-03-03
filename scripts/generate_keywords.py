"""
Generate keyword pool for twosentencedaily.com

Embeds a large English word list + the 8 story type anchors with all-mpnet-base-v2,
then keeps words within a useful distance band from the type anchors.

Too close = boring (the keyword basically IS the type)
Too far = incoherent (no emotional leverage)
The sweet spot = evocative, bridgeable, surprising

Outputs: ../src/lib/keywords.json
"""

import json
import sys
from pathlib import Path

import numpy as np
from sentence_transformers import SentenceTransformer

# Octonion basis types
TYPES = ["comedy", "horror", "love", "grief", "mystery", "revenge", "wonder", "regret"]

# Distance band — tune these
MIN_DIST = 0.45  # reject words too similar to a type anchor
MAX_DIST = 0.65  # reject words too unrelated to any type anchor
PER_TYPE_CAP = 75  # max keywords per nearest-type bucket

OUTPUT = Path(__file__).parent.parent / "src" / "lib" / "keywords.json"


def get_word_list() -> list[str]:
    """Load English words, filter to useful nouns/concepts."""
    words_path = Path("/usr/share/dict/words")
    if not words_path.exists():
        print("No system dictionary found at /usr/share/dict/words")
        print("Install with: sudo pacman -S words")
        sys.exit(1)

    raw = words_path.read_text().splitlines()

    # Filter: lowercase, 3-12 chars, no proper nouns, no affixes
    words = []
    seen = set()
    for w in raw:
        w_lower = w.lower()
        if (
            w == w_lower          # no proper nouns
            and 3 <= len(w) <= 12 # reasonable length
            and w_lower not in seen
            and "'" not in w      # no contractions
            and w.isalpha()       # no hyphens/numbers
        ):
            words.append(w_lower)
            seen.add(w_lower)

    print(f"Filtered dictionary: {len(words)} words")
    return words


def main():
    print("Loading model...")
    model = SentenceTransformer("all-mpnet-base-v2")

    words = get_word_list()

    print(f"Embedding {len(TYPES)} type anchors...")
    type_embeddings = model.encode(TYPES, normalize_embeddings=True, show_progress_bar=False)

    print(f"Embedding {len(words)} candidate words...")
    word_embeddings = model.encode(words, normalize_embeddings=True, show_progress_bar=True, batch_size=512)

    # Cosine distance to nearest type anchor for each word
    # Since embeddings are normalized, cosine_sim = dot product
    similarities = word_embeddings @ type_embeddings.T  # (n_words, 8)
    max_sim = similarities.max(axis=1)                  # nearest anchor similarity
    nearest_type = similarities.argmax(axis=1)           # which anchor

    # Convert similarity to distance (1 - cosine_sim)
    min_dist_from_anchor = 1 - max_sim

    # Keep words in the sweet spot
    mask = (min_dist_from_anchor >= MIN_DIST) & (min_dist_from_anchor <= MAX_DIST)
    kept_indices = np.where(mask)[0]

    print(f"\nDistance band [{MIN_DIST}, {MAX_DIST}]:")
    print(f"  Kept: {len(kept_indices)} / {len(words)}")
    print(f"  Rejected (too close): {(min_dist_from_anchor < MIN_DIST).sum()}")
    print(f"  Rejected (too far): {(min_dist_from_anchor > MAX_DIST).sum()}")

    # Build candidates grouped by nearest type
    by_type: dict[str, list[dict]] = {t: [] for t in TYPES}
    for idx in kept_indices:
        t = TYPES[nearest_type[idx]]
        by_type[t].append({
            "word": words[idx],
            "nearest_type": t,
            "distance": round(float(min_dist_from_anchor[idx]), 4),
        })

    # Sort each bucket by distance (prefer middle of band = most interesting)
    band_center = (MIN_DIST + MAX_DIST) / 2
    for t in TYPES:
        by_type[t].sort(key=lambda k: abs(k["distance"] - band_center))

    # Cap per type
    keywords = []
    for t in TYPES:
        bucket = by_type[t][:PER_TYPE_CAP]
        keywords.extend(bucket)

    # Sort by word for determinism
    keywords.sort(key=lambda k: k["word"])

    # Summary per type
    print("\nPer-type breakdown:")
    for t in TYPES:
        count = sum(1 for k in keywords if k["nearest_type"] == t)
        print(f"  {t}: {count} keywords")

    print(f"\nTotal keywords: {len(keywords)}")

    # Save
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(keywords, indent=2))
    print(f"Saved to {OUTPUT}")


if __name__ == "__main__":
    main()
