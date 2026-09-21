# Roadmap & Release Milestones

This document outlines the development roadmap and strategic release milestones for the **RAGLaB** VS Code extension.

---

## Strategic Vision

The mission of **RAGLaB** is to provide AI/ML engineers and developers with a comprehensive, end-to-end workbench for building, debugging, testing, and optimizing Retrieval-Augmented Generation (RAG) pipelines directly inside VS Code.

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      V0.1       │  ──►  │      V0.2       │  ──►  │      V0.3       │  ──►  │      V0.4       │  ──►  │      V1.0       │
│  Ingestion &    │       │ Embeddings &    │       │ Vector DB &     │       │ Retrieval &     │       │ Complete RAG    │
│  Smart Chunking │       │ Local Vectors   │       │ pgvector        │       │ Eval Testing    │       │ Dev Toolkit     │
└─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
```

---

## V0.1 (Current Release)

*Focus: Document inspection, recursive hierarchical chunking, chunk analytics, and workspace discovery.*

- [x] **Document Analysis**: Detailed document breakdown including character count (with/without spaces), word count, line count, and token estimations.
- [x] **Smart Text Chunking**: Configurable chunk size and overlap using hierarchical boundary detection (paragraph → sentence → word). Never truncates mid-word.
- [x] **Chunk Visualization Webview**: Interactive panel to preview chunks, copy individual chunks, and navigate through chunk collections.
- [x] **Chunk Statistics**: Granular min, max, and average length calculations across chunks for characters and tokens.
- [x] **Quality Warnings**: Automated detection of chunking anomalies (orphaned chunks, oversized chunks, high length variance).
- [x] **Workspace RAG Technology Detection**: Automated manifest scanner for LangChain, LlamaIndex, ChromaDB, Pinecone, pgvector, and LLM SDKs.
- [x] **Interactive Dashboard**: Centralized VS Code-native overview hub for quick actions and document inspection.
- [x] **VS Code Sidebar Integration**: Custom view container and tree view for quick navigation and status overview.
- [x] **Multi-format Support**: Native handling for `.txt`, `.md`, `.json`, and `.csv` files.

---

## V0.2 (Planned)

*Focus: Local vector embeddings, semantic similarity, and chunk space visualization.*

- [ ] **Local Embedding Generation**:
  - Integration with lightweight local embedding models via ONNX Runtime / Transformers.js (e.g., `all-MiniLM-L6-v2`, `bge-small-en-v1.5`).
  - Zero-cloud-cost vector embedding generation directly on the developer's workstation.
  - Optional integration with external embedding APIs (OpenAI, Cohere, Voyage AI, Hugging Face).
- [ ] **Embedding Visualization**:
  - Interactive 2D/3D scatter projection of chunk embeddings using PCA or UMAP.
  - Visual clustering to identify topical clusters, document gaps, and semantic redundancy.
- [ ] **Similarity Search Between Chunks**:
  - Cosine similarity and Euclidean distance calculations between document chunks.
  - Heatmap view showing chunk-to-chunk semantic overlap.
- [ ] **Embedding Dimension Analysis**:
  - Dimension inspection, norm checks, and vector magnitude distribution analysis.

---

## V0.3 (Planned)

*Focus: Vector database integration, PostgreSQL + pgvector, and vector indexing.*

- [ ] **PostgreSQL + pgvector Integration**:
  - Direct connection to local or remote PostgreSQL instances with the `pgvector` extension enabled.
  - Visual inspection of vector tables, embedding columns, and HNSW / IVFFlat indexes.
- [ ] **Vector Database Connection Management**:
  - Secure credential storage using VS Code SecretStorage.
  - Connection profiles for development, staging, and local Docker instances.
- [ ] **Index Management UI**:
  - Interactive index builder for HNSW (`m`, `ef_construction`) and IVFFlat (`lists`).
  - Index build time and memory consumption estimation.
- [ ] **Query Testing Interface**:
  - Execute vector similarity queries directly from VS Code (`<->` L2 distance, `<#>` inner product, `<=>` cosine distance).
  - Inspect top-$k$ nearest neighbors with distance scores and original text payloads.

---

## V0.4 (Planned)

*Focus: End-to-end retrieval evaluation, prompt context window simulation, and RAG testing.*

- [ ] **RAG Retrieval Testing**:
  - Run simulated queries against document chunks or connected vector databases.
  - Evaluate hit rate, MRR (Mean Reciprocal Rank), and recall at $k$.
- [ ] **Retrieval Quality Metrics**:
  - Context relevance scoring (assessing whether retrieved chunks match query intent).
  - Semantic noise detection (identifying irrelevant chunks in the top-$k$ context).
- [ ] **Context Window Analysis**:
  - Visual context window gauge for popular LLMs (GPT-4o, Claude 3.5 Sonnet, Llama 3, Gemini 1.5).
  - Token budget breakdown: System prompt vs. Retrieved chunks vs. User query vs. Response headroom.
- [ ] **Prompt Template Management**:
  - Interactive prompt template editor with dynamic chunk variable injection (`{context}`, `{question}`).
  - Live preview of final assembled prompt payloads.

---

## V1.0 (Vision)

*Focus: Complete, extensible, enterprise-grade RAG developer toolkit.*

- [ ] **Universal Vector Database Support**:
  - Native adapters for Pinecone, Qdrant, ChromaDB, Weaviate, and Milvus alongside pgvector.
- [ ] **Embedding Model Benchmark & Comparison**:
  - Side-by-side comparison of different embedding models on the same document corpus.
  - Retrieval accuracy, speed, and memory trade-off benchmarks.
- [ ] **RAG Pipeline Debugging**:
  - Step-through tracing of RAG requests: Query transformation → Vector search → Reranking → Context assembly → LLM response.
  - Integration with OpenTelemetry and Langfuse / Arize Phoenix traces.
- [ ] **Performance Profiling**:
  - End-to-end latency waterfall chart for ingestion and query pipelines.
- [ ] **Export & Import Configurations**:
  - Export chunking strategies, embedding presets, and pipeline configs as version-controllable files (`rag-helper.config.json`).
  - CI/CD CLI companion for automated chunk quality validation during build steps.

---

## Feature Requests & Milestones

Have an idea or want to prioritize a specific feature?
- Submit an issue or feature request on [GitHub Issues](https://github.com/aroshwijesinghe/rag-development-helper/issues).
- Join discussions on upcoming design proposals in [GitHub Discussions](https://github.com/aroshwijesinghe/rag-development-helper/discussions).
