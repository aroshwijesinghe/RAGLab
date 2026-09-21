# 🧪 RAGLaB User Guidelines & Engineering Handbook

Welcome to **RAGLaB** — the interactive GUI toolkit for developers, AI engineers, and students building and tuning **Retrieval-Augmented Generation (RAG)** pipelines.

This guide explains how to use all features of RAGLaB directly through the **Graphical User Interface (GUI)** without requiring command-line tools, external backend servers, or API keys.

---

## 📑 Table of Contents

1. [Quick Start: Opening the GUI](#1-quick-start-opening-the-gui)
2. [Document Inspector Guide](#2-document-inspector-guide)
3. [Chunking Studio & Visualizer Guide](#3-chunking-studio--visualizer-guide)
4. [Workspace RAG Scanner Guide](#4-workspace-rag-scanner-guide)
5. [Sidebar Quick Access](#5-sidebar-quick-access)
6. [RAG Engineering Best Practices](#6-rag-engineering-best-practices)
7. [Troubleshooting & Quality Warnings](#7-troubleshooting--quality-warnings)

---

## 1. Quick Start: Opening the GUI

You can open **RAGLaB Studio** in three effortless ways:

### Option A: From the Activity Bar (Sidebar)
1. Click the **Beaker icon (`$(beaker)`)** on the left VS Code Activity Bar labeled **RAGLaB**.
2. Click the primary button: **🚀 Open Full Studio**.

### Option B: From the Command Palette
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS).
2. Type `RAGLaB` and select **`RAGLaB: Open Studio Dashboard`**.

### Option C: Right-Click Any Document
1. In the file explorer or editor, right-click any `.md`, `.txt`, `.json`, or `.csv` file.
2. Select **`RAGLaB: Analyze Document`** or **`RAGLaB: Create Chunks`**.

---

## 2. Document Inspector Guide

The **Document Inspector** analyzes documents to calculate character density, word count, line distribution, and estimated embedding tokens.

### How to Use the GUI:
1. Open the **📄 Document Inspector** tab inside RAGLaB Studio.
2. Load text using any of these 4 intuitive methods:
   - **📂 Select File from Disk**: Click to choose any `.txt`, `.md`, `.json`, or `.csv` file from your computer.
   - **⚡ Load Active File**: Click to instantly pull text from whatever file is currently active in your VS Code editor.
   - **📚 Load Sample Document**: Click to instantly load an informative Markdown document about RAG pipelines to test RAGLaB without your own files!
   - **✍️ Manual Scratchpad**: Paste or type text directly into the text box and click **🔍 Analyze Text**.
3. Inspect your document KPIs:
   - **Characters**: Total raw characters.
   - **Words**: Total words split by whitespace.
   - **Estimated Tokens**: Word-based heuristic (`~words × 1.3`).
   - **Total Lines**: Total line count and empty line breakdown.
   - **Avg Words/Line**: Document density metric.
4. When ready, click **`🚀 Send to Chunking Studio`** to automatically transfer the text into the chunking workbench.

---

## 3. Chunking Studio & Visualizer Guide

The **Chunking Studio** divides documents into semantically coherent segments, preserving paragraph and sentence boundaries while preventing words from being cut in half.

### How to Configure Chunks in the GUI:
1. Open the **🔪 Chunking Studio** tab.
2. Adjust the sliders or numeric input boxes, or click one of the **Quick Presets**:
   - **⚡ Factoid (250 / 25)**: Small chunks for strict fact lookups and high-precision Q&A.
   - **⚡ Standard RAG (500 / 50)**: Balanced general-purpose chunks.
   - **⚡ Deep Context (1000 / 100)**: Large chunks for narratives and summaries.
   - Or manually set **Chunk Size** (50–3000) and **Chunk Overlap** (0–500).
3. **Live Validation**: The GUI automatically validates your settings. If the overlap is greater than or equal to the chunk size, you will see an immediate warning.
4. Click **`⚡ Generate Chunks`**.

### Exploring Chunks Interactively:
- **Navigation Controls**:
  - Click **◀ Prev** and **Next ▶** or use keyboard arrow keys (`←` and `→`) to step through chunks.
  - Type a specific chunk number into the `Chunk [ X ] of [ Total ]` input to jump directly.
- **Search & Highlighting**:
  - Type a query into the `Filter/Search chunks...` input box.
  - Matches are highlighted in yellow (`<mark>`) inside the chunk content in real time.
  - The match counter displays how many chunks contain the query.
- **Metrics Display**:
  - Every chunk displays its exact **Character count**, **Word count**, **Estimated tokens**, and original **Character Offsets**.
- **One-Click Exporting**:
  - Click **📋 Copy** to copy the current chunk to your clipboard.
  - Click **📋 Copy All Chunks** to copy all chunks with formatted headers.
  - Click **📋 Copy JSON** to copy the entire structured dataset to clipboard.
  - Click **💾 Save to File (.json)** to launch a native file save dialog and save the chunk dataset directly to a JSON file in your project!

### 🎯 Local Retrieval Simulator & Context Headroom Gauge:
Right below your chunks in the Chunking Studio, RAGLaB provides a local **Retrieval Simulator**:
1. Type a realistic query or question into the input (e.g., `"Why does document chunking matter?"`).
2. Click **`🔎 Retrieve Top-K`** or press `Enter`.
3. RAGLaB runs a local TF-IDF relevance scoring engine across all your chunks and displays the **Top-3 Most Relevant Chunks** with match percentage badges.
4. **Click any ranked card** to instantly jump to and view that chunk in the viewer!
5. **Context Headroom Gauge**: Displays the total token footprint of the Top-K chunks and calculates what percentage of a standard 4K/8K LLM context window is consumed, helping you prevent context window overflow before ever deploying to production!

---

## 4. Workspace RAG Scanner Guide

The **Workspace Scanner** inspects your active VS Code project to identify installed RAG frameworks, vector databases, embedding engines, and folder structures.

### How to Use the GUI:
1. Open the **🔍 Workspace Scanner** tab.
2. Click **`🔄 Scan Workspace`**.
3. Review your RAG Stack:
   - **Readiness Badge**: Displays `🟢 RAG Stack Active` if vector databases, orchestration libraries, or embedding packages are found.
   - **Category Filters**: Click `All`, `Vector DBs`, `Embeddings`, `Orchestration`, or `Frameworks` to isolate specific dependencies.
   - **Technology Cards**: Displays each technology with its detection status (`✓ Detected` in green or `○ Not found` in gray) and the source file where it was identified (`requirements.txt`, `package.json`, etc.).
   - **RAG Directories**: Highlights folders dedicated to document ingestion, embeddings, or retrieval (e.g., `documents/`, `embeddings/`, `retrieval/`).
   - **📋 Copy Report**: Click to copy the full formatted workspace audit report to your clipboard.

### Supported Technologies Detected:
- **Vector Databases**: `pgvector`, `Chroma`, `FAISS`, `Qdrant`, `Pinecone`, `Weaviate`, `Milvus`, `PostgreSQL`
- **Embedding Libraries**: `Sentence Transformers`, `OpenAI Embeddings`, `HuggingFace Transformers`
- **Orchestration**: `LangChain`, `LlamaIndex`, `Haystack`
- **Backend Frameworks**: `FastAPI`, `Flask`, `Express`
- **Languages**: `Python`, `TypeScript / JavaScript`

---

## 5. Sidebar Quick Access

The RAGLaB Sidebar provides a compact controller directly inside VS Code's Activity Bar:
- **🚀 Open Full Studio**: Launches the primary multi-tab workbench.
- **📄 Analyze Document**: Prompts to pick a document and shows instant stats.
- **🔪 Create Chunks**: Quick chunk generator with modal prompts.
- **⚡ Quick Preview Active File**: Immediately splits the active file using default settings.
- **🔍 Scan RAG Technologies**: Runs an immediate workspace scan.

---

## 6. RAG Engineering Best Practices

### Chunk Size Strategy
Choosing the right chunk size directly impacts retrieval accuracy:

| Chunk Size | Approximate Tokens | Ideal Use Case | Pros & Cons |
|---|---|---|---|
| **Small (100–300 chars)** | 25–75 tokens | Fact extraction, FAQ lookups, strict sentence matching | ➕ High precision, low noise<br>➖ Lacks surrounding context |
| **Medium (500–1000 chars)** | 125–250 tokens | General documentation, blog posts, knowledge bases | ➕ Balanced context & specificity<br>⭐ **Recommended default** |
| **Large (1200–2500 chars)** | 300–600 tokens | Summarization, legal contracts, comprehensive narrative | ➕ Broad contextual understanding<br>➖ Risk of vector dilution |

### Overlap Rule of Thumb
- Always use **10% to 20% overlap** (e.g., 50 characters for a 500-character chunk).
- **Why overlap matters**: Without overlap, a critical keyword or sentence split across two chunks may lose its semantic meaning, leading to retrieval failures.

---

## 7. Troubleshooting & Quality Warnings

| Warning in GUI | Cause | Solution |
|---|---|---|
| `⚠️ Very small chunk detected` | A chunk has fewer than 50 characters, often due to a short trailing paragraph. | Review your document endings or merge small trailing chunks. |
| `⚠️ Large chunk detected` | A paragraph or sentence exceeded 1.5× the target chunk size without boundary breaks. | Break extremely long run-on sentences or paragraphs with punctuation. |
| `⚠️ High ratio of empty lines` | More than 30% of document lines are whitespace or blank. | Clean and normalize document formatting before generating embeddings. |
| `❌ Overlap must be strictly less than chunk size` | Overlap was configured greater than or equal to chunk size. | Decrease overlap or increase chunk size in the GUI sliders. |
| `❌ Document contains no usable text` | File is empty or only whitespace. | Verify file content before processing. |

---

*RAGLaB is developed and maintained locally with zero external API dependencies. All calculations are executed on your local machine.*
