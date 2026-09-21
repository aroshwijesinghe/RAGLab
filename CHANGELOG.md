# Changelog

All notable changes to the **RAGLaB** VS Code extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned for V0.2
- Local ONNX-based embedding generation.
- Interactive similarity search between generated chunks.
- Vector dimension analysis and embedding latency benchmarks.

---

## [0.1.0] - 2024-01-21

### Added
- **Initial Release** of **RAGLaB** (Interactive GUI Studio for RAG Engineering).
- **RAGLaB Studio Webview**:
  - Unified multi-tab dashboard with Document Inspector, Chunking Studio, Workspace Scanner, and Guidelines.
  - Interactive slider controls for Chunk Size and Overlap with real-time validation.
  - Interactive Chunk Explorer with full-text search, `<mark>` highlighting, keyboard navigation (`←`/`→`), and jump-to-chunk index.
  - 1-click clipboard actions: Copy current chunk, Copy all chunks, and Export as JSON.
  - Document analysis KPI cards (Characters, Words, Lines, Estimated Tokens `~words × 1.3`, Empty Line ratio).
  - Scratchpad for manual text input and rapid testing.
- **Smart Chunking Engine**:
  - Hierarchical boundary preservation: Paragraphs (`\n\n`) → Sentences (`.!?`) → Words (`\s`).
  - Strict preservation of word tokens without mid-word truncation.
  - Configurable sliding window overlap respecting whitespace boundaries.
- **Workspace RAG Scanner**:
  - Dependency inspection (`requirements.txt`, `package.json`, `pyproject.toml`).
  - Detection for vector databases: `pgvector`, `Chroma`, `FAISS`, `Qdrant`, `Pinecone`, `Weaviate`, `Milvus`, `PostgreSQL`.
  - Detection for embedding libraries: `Sentence Transformers`, `OpenAI`, `HuggingFace`.
  - Detection for orchestration frameworks: `LangChain`, `LlamaIndex`, `Haystack`.
  - Detection for backend frameworks: `FastAPI`, `Flask`, `Express`.
  - RAG directory structure mapper (`documents/`, `embeddings/`, `retrieval/`, etc.).
- **VS Code Native Integration**:
  - Activity Bar sidebar view with 1-click Studio launch.
  - Right-click editor context menu shortcuts for supported documents (`.md`, `.txt`, `.json`, `.csv`).
  - Command Palette triggers for all primary workflows.
  - Settings configuration for default chunk size, default overlap, notifications, and max file size.
- **Documentation**:
  - Comprehensive `README.md` with visual RAG diagrams.
  - `GUIDELINES.md` user manual and RAG engineering handbook.
  - `ARCHITECTURE.md` decoupled layered system specifications.
  - `ROADMAP.md` strategic milestone guide.
- **Test Suite**:
  - 52 automated unit tests across text processing, chunking strategies, and statistics.
