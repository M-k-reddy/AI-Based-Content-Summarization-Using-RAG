# retrieval/adaptive_retriever.py

from typing import List
from cognition.estimator import CognitiveStateEstimator
from embeddings.embedder import TextEmbedder
from vectorstore.faiss_index import FaissVectorStore
from models.chunk import DocumentChunk


class AdaptiveRetriever:
    def __init__(
        self,
        vector_store: FaissVectorStore,
        embedder: TextEmbedder,
        cognitive_estimator: CognitiveStateEstimator
    ):
        self.vector_store = vector_store
        self.embedder = embedder
        self.cognitive_estimator = cognitive_estimator

    def _get_top_k(self, cognitive_state: str) -> int:
        if cognitive_state == "BEGINNER":
            return 3
        elif cognitive_state == "INTERMEDIATE":
            return 5
        else:  # ADVANCED
            return 8

    def retrieve(
        self,
        question: str,
        previous_questions: List[str] = None
    ) -> List[DocumentChunk]:

        # 1. Estimate cognitive state
        cognitive_state = self.cognitive_estimator.estimate(
            question, previous_questions
        )

        # 2. Decide retrieval depth
        top_k = self._get_top_k(cognitive_state)

        # 3. Embed query
        query_embedding = self.embedder.embed_texts([question])

        # 4. Retrieve relevant chunks
        retrieved_chunks = self.vector_store.search(
            query_embedding, top_k=top_k
        )

        return retrieved_chunks, cognitive_state
