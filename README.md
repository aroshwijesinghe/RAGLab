# 🧪 RAGLaB

**Interactive GUI Studio & Diagnostic Workbench for Retrieval-Augmented Generation (RAG) Pipelines**

[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue?logo=visualstudiocode)](https://github.com/aroshwijesinghe/RAGLab)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Local First](https://img.shields.io/badge/Security-100%25%20Local-success)](README.md#-security--privacy)

---

```
┌───────────┐     ┌──────────┐     ┌────────────┐     ┌─────────────────┐     ┌───────────┐     ┌─────┐
│ Documents │ ──► │ Chunking │ ──► │ Embeddings │ ──► │ Vector Database │ ──► │ Retrieval │ ──► │ LLM │
│ (.md,.txt)│     │(RAGLaB)  │     │(Embeddings)│     │(pgvector,Chroma)│     │  (Top-K)  │     │(Gen)│
└───────────┘     └──────────┘     └────────────┘     └─────────────────┘     └───────────┘     └─────┘
```

> **Retrieval-Augmented Generation (RAG)** empowers Large Language Models (LLMs) with external, verifiable knowledge. Source documents are broken into discrete text chunks, embedded into high-dimensional vectors, indexed into a vector database, retrieved based on semantic similarity to a query, and provided to the model as prompt context.
>
> The accuracy and hallucination rate of your RAG pipeline fundamentally depends on the **quality of your document chunking**. Inaccurate cuts, broken sentences, and noisy segments cause vector retrieval failures. **RAGLaB** gives you an interactive, lightweight, 100% local GUI studio to inspect, test, and tune your documents before ingestion.

---

## 📑 Table of Contents

- [🌟 Key Highlights](#-key-highlights)
- [🖥️ Interactive GUI Feature Tour](#️-interactive-gui-feature-tour)
- [📖 How to Use Every Feature](#-how-to-use-every-feature)
  - [1. Launching RAGLaB Studio](#1-launching-raglab-studio)
  - [2. Using the Document Inspector](#2-using-the-document-inspector)
  - [3. Using the Chunking Studio & Visualizer](#3-using-the-chunking-studio--visualizer)
  - [4. Using the Workspace RAG Scanner](#4-using-the-workspace-rag-scanner)
  - [5. Using the Activity Bar Sidebar](#5-using-the-activity-bar-sidebar)
- [⚡ Available Commands](#-available-commands)
- [⚙️ Configuration Settings](#️-configuration-settings)
- [📐 Chunking Strategy & Decision Guide](#-chunking-strategy--decision-guide)
- [📁 Supported File Types](#-supported-file-types)
- [🏗️ Decoupled Architecture](#️-decoupled-architecture)
- [💻 Development, Testing & Packaging](#-development-testing--packaging)
- [🗺️ Strategic Roadmap](#️-strategic-roadmap)
- [🤝 Contributing](#-contributing)
- [🔒 Security & Privacy](#-security--privacy)
- [📄 License](#-license)

---

## 🌟 Key Highlights

- **100% Graphical User Interface (GUI)**: Inspect documents, adjust chunking parameters, explore segments, and scan projects without ever needing terminal commands.
- **Privacy First & 100% Local**: Zero cloud dependencies, zero telemetry, zero external API keys. All parsing and chunking executes strictly on your local machine.
- **Smart Boundary-Aware Chunking**: Splits text hierarchically at paragraph (`\n\n`), sentence (`. ! ?`), and word (`\s`) boundaries. Words are never truncated mid-token.
- **Real-Time Visualizer & Search**: Step through chunks with keyboard shortcuts (`←`/`→`), jump to any index, and perform instant full-text searches with yellow `<mark>` highlighting.
- **RAG Technology Scanner**: Automatically inspects project dependency manifests (`requirements.txt`, `package.json`, `pyproject.toml`) to identify vector databases, embedding engines, and RAG folders.
- **Fast, Lightweight & Native**: Built with pure vanilla TypeScript and VS Code CSS custom variables. The entire packaged extension bundle is **under 100 KB**.

---

## 🖥️ Interactive GUI Feature Tour

| Tab / View | Capabilities & Visual Elements |
|---|---|
| **📄 Document Inspector** | • Load files via disk picker, current editor tab, or scratchpad.<br>• Visual KPI cards for Characters, Words, Lines, Empty Lines, and Density.<br>• Estimated Tokens metric using industry-standard BPE heuristic (`~words × 1.3`).<br>• Health warnings (e.g. high empty line ratio alerts).<br>• One-click **Send to Chunking Studio** button. |
| **🔪 Chunking Studio** | • Real-time interactive sliders & number inputs for **Chunk Size** (50–3,000) and **Overlap** (0–500).<br>• Live sanity validation (flags when overlap $\ge$ chunk size).<br>• Distribution summary: Total Chunks, Min/Avg/Max Characters, Words, and Tokens.<br>• Quality alert badges for small, oversized, or irregular chunks. |
| **👁️ Chunk Explorer** | • Navigation bar: `◀ Prev`, `Next ▶`, and `Chunk [ X ] of [ Total ]` jump input.<br>• Keyboard navigation: Arrow Left (`←`) and Arrow Right (`→`).<br>• Full-text search with instant `<mark>` highlight and match counter.<br>• Chunk metadata pills: character count, word count, token estimation, and start/end character offsets.<br>• Action buttons: **Copy Chunk**, **Copy All Chunks**, **Export as JSON**. |
| **🔍 Workspace Scanner** | • Automated dependency scanner for project manifests.<br>• **RAG Readiness Status**: Green pulse badge (`🟢 RAG Stack Active`) vs neutral badge.<br>• Categorized technology cards: Vector DBs (`pgvector`, `Chroma`, `FAISS`, etc.), Embeddings, Orchestration (`LangChain`, `LlamaIndex`), and Frameworks.<br>• Visual RAG folder chip map (`documents/`, `embeddings/`, etc.). |
| **📖 Guidelines Tab** | • ASCII RAG pipeline architectural diagram.<br>• Chunk sizing decision matrix (Small vs. Medium vs. Large).<br>• Overlap guidance (10–20% rule of thumb).<br>• Direct button to open the full [GUIDELINES.md](GUIDELINES.md) handbook in VS Code. |

---

## 📖 How to Use Every Feature

### 1. Launching RAGLaB Studio
RAGLaB can be opened in 3 convenient ways:
- **Activity Bar Icon**: Click the **Beaker (`$(beaker)`)** icon on the left Activity Bar labeled **RAGLaB**, then click **`🚀 Open Full Studio`**.
- **Command Palette**: Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS), type `RAGLaB`, and select **`RAGLaB: Open Studio Dashboard`**.
- **Context Menu**: Right-click any document in the VS Code File Explorer or Editor and choose **`RAGLaB: Analyze Document`** or **`RAGLaB: Create Chunks`**.

---

### 2. Using the Document Inspector
1. Click the **`📄 Document Inspector`** tab in RAGLaB Studio.
2. Select your text input method:
   - **`📂 Select File from Disk`**: Opens a native file dialog to choose any `.md`, `.txt`, `.json`, or `.csv` file.
   - **`⚡ Load Active File`**: Instantly imports text from whatever file is currently active in your editor.
   - **`📚 Load Sample Document`**: Instantly loads a comprehensive RAG pipeline reference document for testing without your own files.
   - **`✍️ Scratchpad`**: Paste or write custom text into the multi-line text box and click **`🔍 Analyze Text`**.
3. Review your Document Metrics:
   - **Characters**: Exact raw character length.
   - **Words**: Total words delimited by whitespace.
   - **Estimated Tokens**: Calculated as `~words × 1.3` (clearly labeled as an approximation).
   - **Lines & Empty Lines**: Total lines with breakdown of blank lines.
   - **Avg Words/Line**: Lexical density metric.
4. If the document has issues (e.g. >30% empty lines), a yellow warning banner will alert you.
5. Click **`🚀 Send to Chunking Studio`** to transition directly into the chunking workbench with your document loaded.

---

### 3. Using the Chunking Studio & Visualizer
1. Click the **`🔪 Chunking Studio`** tab.
2. Configure parameters using sliders, number inputs, or **Quick Presets**:
   - **`⚡ Factoid (250 / 25)`**: Small chunks for strict fact lookups and high-precision Q&A.
   - **`⚡ Standard RAG (500 / 50)`**: Balanced general-purpose chunks.
   - **`⚡ Deep Context (1000 / 100)`**: Large chunks for narratives and summaries.
   - Or manually customize **Chunk Size** (50–3,000) and **Chunk Overlap** (0–500).
   - *Sanity Check*: If overlap is greater than or equal to chunk size, the GUI immediately displays an error banner preventing invalid runs.
3. Click **`⚡ Generate Chunks`**.
4. Examine the **Set Statistics**:
   - Total Chunks generated.
   - Min, Average, and Max for Characters, Words, and Estimated Tokens.
   - Quality warnings (e.g. `⚠️ Very small chunk detected` if a chunk has < 50 characters).
5. Explore Chunks in the **Chunk Viewer**:
   - Use **`◀ Prev`** and **`Next ▶`** buttons or your keyboard arrow keys (`←`/`→`) to flip through chunks.
   - Type a chunk number into `Chunk [ X ] of [ Total ]` to jump directly.
   - In the **Search Box**, type any keyword:
     - The match counter displays how many chunks contain the query.
     - Matching terms are highlighted in yellow inside the chunk content in real time.
   - Click **`📋 Copy`** to copy the current chunk to clipboard.
   - Click **`📋 Copy All Chunks`** to copy all chunks formatted with delimiter headers.
   - Click **`📋 Copy JSON`** to copy the entire structured dataset to clipboard.
   - Click **`💾 Save to File (.json)`** to save the chunk dataset directly to a `.json` file in your workspace!

---

### 4. Using the Workspace RAG Scanner
1. Click the **`🔍 Workspace Scanner`** tab.
2. Click **`🔄 Scan Workspace`**.
3. RAGLaB parses project manifests (`requirements.txt`, `package.json`, `pyproject.toml`) and root folders without executing any untrusted code.
4. Review results:
   - **Project Name & Root**: Basic repository identification.
   - **RAG Status Badge**: `🟢 RAG Stack Active` if RAG dependencies exist, or `⚪ Standard Project` if none are found.
   - **Category Filters**: Filter technologies by `All`, `Vector DBs`, `Embeddings`, `Orchestration`, or `Frameworks`.
   - **Technology Cards**: Displays status pills:
     - `✓ Detected` (green background + file source label)
     - `○ Not found` (neutral gray badge)
     - Covers: `pgvector`, `Chroma`, `FAISS`, `Qdrant`, `Pinecone`, `Weaviate`, `Milvus`, `PostgreSQL`, `Sentence Transformers`, `OpenAI`, `HuggingFace`, `LangChain`, `LlamaIndex`, `Haystack`, `FastAPI`, `Flask`, `Express`, `Python`, `TypeScript`.
   - **RAG Directories**: Lists detected directories like `documents/`, `embeddings/`, `retrieval/`, `data/`, etc.
   - **`📋 Copy Report`**: Copy the complete workspace diagnostic report to your clipboard with one click.

---

### 5. Using the Activity Bar Sidebar
The RAGLaB Sidebar lives in the left VS Code Activity Bar:
- Click **`🚀 Open Full Studio`** to open the unified multi-tab studio.
- Click **`📄 Analyze Document`** for quick file metrics.
- Click **`🔪 Create Chunks`** to prompt for chunk parameters and open the visualizer.
- Click **`⚡ Quick Preview Active File`** to instantly chunk the open file using default settings.
- Click **`🔍 Scan RAG Technologies`** to trigger a workspace scan.

---

## ⚡ Available Commands

All commands are available via the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

| Command | Identifier | Description |
| :--- | :--- | :--- |
| **RAGLaB: Open Studio Dashboard** | `ragHelper.openDashboard` | Open the unified interactive RAGLaB Studio webview |
| **RAGLaB: Analyze Document** | `ragHelper.analyzeDocument` | Inspect file metrics and open in Document Inspector GUI |
| **RAGLaB: Create Chunks** | `ragHelper.createChunks` | Chunk file with custom parameters and open in Chunking Studio |
| **RAGLaB: Preview Chunks** | `ragHelper.previewChunks` | Quickly chunk the active editor file with default parameters |
| **RAGLaB: Analyze Workspace** | `ragHelper.analyzeWorkspace` | Scan project dependencies and folder structure for RAG tech |

---

## ⚙️ Configuration Settings

Configure RAGLaB via VS Code Settings (`Ctrl+,` / `Cmd+,`) under **Extensions > RAGLaB**:

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `ragHelper.defaultChunkSize` | `number` | `500` | Default target chunk size in characters (min: 10, max: 10,000) |
| `ragHelper.defaultChunkOverlap` | `number` | `50` | Default overlap between consecutive chunks (min: 0, max: 5,000) |
| `ragHelper.showNotifications` | `boolean` | `true` | Show status notification toast alerts |
| `ragHelper.maxFileSize` | `number` | `5242880` | Maximum file size in bytes allowed for analysis (default: 5 MB) |

---

## 📐 Chunking Strategy & Decision Guide

### Recursive Hierarchical Splitting
RAGLaB implements a recursive boundary algorithm:

```
Raw Document Text
  │
  ├─► 1. Split at Paragraph Boundaries (\n\n)
  │      └─► Fits in target size? Keep paragraph intact.
  │
  ├─► 2. Split at Sentence Boundaries (. ! ? \n)
  │      └─► Fits in target size? Keep sentence intact.
  │
  └─► 3. Split at Word Boundaries (whitespace)
         └─► Prevents mid-word truncation (never cuts words in half).
```

### Chunk Sizing Decision Matrix

| Target Size | Approx Tokens | Best Use Case | Trade-offs |
|---|---|---|---|
| **Small (100–300 chars)** | 25–75 tokens | Strict sentence matching, FAQ lookup, entity extraction | ➕ High precision, low noise<br>➖ Lacks surrounding narrative context |
| **Medium (500–1,000 chars)** | 125–250 tokens | Technical manuals, knowledge base articles, general Q&A | ➕ Balanced context and vector specificity<br>⭐ **Recommended default** |
| **Large (1,200–2,500 chars)** | 300–600 tokens | Summarization, legal documents, thematic reasoning | ➕ Rich context<br>➖ May dilute vector similarity search |

### Overlap Rule of Thumb
- Always configure an overlap between **10% and 20%** of your chunk size (e.g. 50 characters for a 500-character chunk).
- Overlap ensures that thoughts, named entities, and clauses spanning across chunk boundaries are retained in both retrieval units.

---

## 📁 Supported File Types

RAGLaB supports standard unstructured and semi-structured formats:

| Format | Extension | Common Use Case in RAG |
| :--- | :--- | :--- |
| **Markdown** | `.md` | Technical documentation, GitHub READMEs, knowledge bases |
| **Plain Text**| `.txt` | Unstructured raw text, customer service transcripts, meeting notes |
| **JSON** | `.json` | Exported chat history, conversational datasets, structured dumps |
| **CSV** | `.csv` | Tabular datasets, catalogs, tabular knowledge rows |

---

## 🏗️ Decoupled Architecture

RAGLaB is built with a strictly decoupled architecture:

```
src/
├── extension.ts          # Entry point and lifecycle activations
├── commands/             # VS Code command bridges (GUI launchers & output channels)
│   ├── analyzeDocument.ts
│   ├── createChunks.ts
│   ├── previewChunks.ts
│   ├── analyzeWorkspace.ts
│   └── openDashboard.ts
├── services/             # Pure business logic (zero VS Code UI dependencies)
│   ├── documentAnalyzer.ts
│   ├── chunkingService.ts
│   ├── statisticsService.ts
│   └── workspaceAnalyzer.ts
├── models/               # TypeScript data schemas and interface contracts
│   └── types.ts
├── utils/                # Pure utility helpers
│   ├── textUtils.ts      # Word/line/token heuristics and HTML escaping
│   └── fileUtils.ts      # Safe file reading and size validation
├── views/                # Activity Bar sidebar provider
│   └── sidebarProvider.ts
└── webview/              # Webview panels, HTML templates, and GUI controllers
    ├── dashboardPanel.ts
    ├── chunkViewerPanel.ts
    └── templates/
        ├── dashboard.ts
        └── chunkViewer.ts
```

For comprehensive architectural design diagrams, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 💻 Development, Testing & Packaging

### Prerequisites
- **Node.js**: `>= 18.0.0`
- **npm**: `>= 9.0.0`
- **VS Code**: `>= 1.85.0`

### Build & Run Locally
```bash
# 1. Clone repository
git clone https://github.com/aroshwijesinghe/RAGLab.git
cd RAGLab

# 2. Install dependencies
npm install

# 3. Compile the extension
npm run compile

# 4. Run the automated test suite (52 unit tests)
npm test

# 5. Package as redistributable VSIX
npm run package
```

To run and debug the extension live, press `F5` in VS Code to launch the **Extension Development Host**.

---

## 🗺️ Strategic Roadmap

- [x] **V0.1 (Current)**:
  - Document analysis with character, word, line, and estimated token counts.
  - Smart boundary-aware chunking with sliding overlap.
  - Unified interactive RAGLaB Studio webview.
  - Full-text chunk search with `<mark>` match highlighting.
  - Workspace RAG technology and directory scanner.
  - Activity Bar sidebar view with 1-click launch.
- [ ] **V0.2 (Planned)**:
  - Local ONNX-based embedding generation.
  - Live similarity search between chunks.
  - Embedding dimension analysis and token-cost estimator.
- [ ] **V0.3 (Planned)**:
  - PostgreSQL + `pgvector` live database integration.
  - Index management and interactive query tester.
- [ ] **V0.4 (Planned)**:
  - RAG retrieval simulation and precision/recall scoring.
  - Context window headroom gauge.
- [ ] **V1.0 (Vision)**:
  - Multi-vector database support and automated pipeline diagnostics.

See [ROADMAP.md](ROADMAP.md) for full milestone details.

---

## 🤝 Contributing

Contributions are warmly welcomed!
1. Fork the repository on GitHub.
2. Create your feature branch (`git checkout -b feature/my-feature`).
3. Ensure all tests pass (`npm test`).
4. Commit following conventional commit rules (`git commit -m "feat: add support for custom delimiters"`).
5. Push to your branch and open a Pull Request.

---

## 🔒 Security & Privacy

- **100% Local**: All processing occurs strictly inside your local VS Code extension host.
- **Zero Network Calls**: Documents, text snippets, and project metadata are never transmitted to external servers.
- **Zero Telemetry**: No analytics or tracking scripts are included.
- **Safe File Access**: Read-only operations by default; user documents are never modified or overwritten.

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.
