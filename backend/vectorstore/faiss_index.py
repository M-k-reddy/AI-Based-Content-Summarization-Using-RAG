# vectorstore/faiss_index.py

import faiss
import numpy as np
from typing import List
from models.chunk import DocumentChunk

class FaissVectorStore:
    def __init__(self, embedding_dim: int):
        self.index = faiss.IndexFlatIP(embedding_dim)
        self.chunks: List[DocumentChunk] = []

    def add_embeddings(self, embeddings: np.ndarray, chunks: List[DocumentChunk]):
        """
        Adds embeddings and their corresponding chunks to the index.
        """
        self.index.add(embeddings)
        self.chunks.extend(chunks)

    def search(self, query_embedding: np.ndarray, top_k: int = 5):
        """
        Returns top-k most similar chunks.
        """
        scores, indices = self.index.search(query_embedding, top_k)
        results = []

        for idx in indices[0]:
            if 0 <= idx < len(self.chunks):
                results.append(self.chunks[idx])

        return results
