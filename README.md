# 🧪 RAGLaB

**Interactive GUI Studio & Diagnostic Workbench for Retrieval-Augmented Generation (RAG) Pipelines**

[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue?logo=visualstudiocode)](https://github.com/aroshwijesinghe/RAGLab)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Local First](https://img.shields.io/badge/Security-100%25%20Local-success)](README.md#privacy)

---

```
┌───────────┐     ┌──────────┐     ┌────────────┐     ┌─────────────────┐     ┌───────────┐     ┌─────┐
│ Documents │ ──► │ Chunking │ ──► │ Embeddings │ ──► │ Vector Database │ ──► │ Retrieval │ ──► │ LLM │
│ (.md,.txt)│     │(RAGLaB)  │     │(Embeddings)│     │(pgvector,Chroma)│     │  (Top-K)  │     │(Gen)│
└───────────┘     └──────────┘     └────────────┘     └─────────────────┘     └───────────┘     └─────┘
```

> **Retrieval-Augmented Generation (RAG)** empowers Large Language Models (LLMs) with external, verifiable knowledge. Source documents are broken into text chunks, embedded into high-dimensional vectors, indexed into a vector database, retrieved based on semantic cosine similarity, and passed to the model as prompt context.
>
> The performance of your RAG application depends on the **quality of your document chunking**. Inaccurate boundaries, fragmented sentences, and noisy segments cause retrieval failure and model hallucinations. **RAGLaB** gives you an interactive, lightweight, 100% local GUI studio to inspect, test, and tune this critical pipeline.

---

## 🌟 Key Highlights

- **100% Graphical User Interface (GUI)**: Everything is interactive and accessible via the **RAGLaB Studio** dashboard, sidebar, or context menus.
- **Privacy First & 100% Local**: Zero cloud dependencies, zero telemetry, zero external API keys. All parsing and chunking is executed on your local machine.
- **Smart Boundary-Aware Chunking**: Splits text hierarchically at paragraph, sentence, and word boundaries. Never cuts words in half.
- **Real-Time Chunk Visualizer**: Step through chunks with keyboard shortcuts, perform instant full-text search with highlighting, and copy/export structured data.
- **RAG Technology Scanner**: Automatically detects RAG libraries, vector databases, and directory conventions in your project.
- **Fast & Lightweight**: Built with clean vanilla TypeScript and native VS Code theme integration (< 90 KB bundle footprint).

---

## 🚀 Quick Start & GUI Usage

For the complete user manual, see [GUIDELINES.md](GUIDELINES.md).

### 1. Launch RAGLaB Studio
- **From Activity Bar**: Click the **Beaker (`$(beaker)`)** icon on the left sidebar, then click **`🚀 Open Full Studio`**.
- **From Command Palette**: Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) and type **`RAGLaB: Open Studio Dashboard`**.
- **From File Explorer**: Right-click any `.md`, `.txt`, `.json`, or `.csv` file and select **`RAGLaB: Analyze Document`** or **`RAGLaB: Create Chunks`**.

### 2. 📄 Document Inspector Tab
1. Select a document via **`📂 Select File from Disk`**, **`⚡ Load Active File`**, or paste text into the scratchpad.
2. View real-time KPIs: Character count, Word count, Line count, Estimated Tokens (`~words × 1.3`), and Empty Line ratio.
3. Click **`🚀 Send to Chunking Studio`** to transition directly into the chunking workbench.

### 3. 🔪 Chunking Studio Tab
1. Adjust **Chunk Size** (e.g. 500 characters) and **Chunk Overlap** (e.g. 50 characters) using sliders or inputs.
2. Click **`⚡ Generate Chunks`**.
3. Use **`◀ Prev`** and **`Next ▶`** (or keyboard arrows `←`/`→`) to navigate through chunks.
4. Type in the **Search box** to highlight matching terms across all chunks in real-time.
5. Export your chunks using **`📋 Copy Chunk`**, **`📋 Copy All Chunks`**, or **`💾 Export JSON`**.

### 4. 🔍 Workspace Scanner Tab
1. Click **`🔄 Scan Workspace`**.
2. RAGLaB inspects your `requirements.txt`, `package.json`, `pyproject.toml`, and folder structure.
3. Instantly review detected Vector Databases (`pgvector`, `Chroma`, `FAISS`, etc.), Embeddings, Orchestration frameworks (`LangChain`, `LlamaIndex`), and RAG directories.

---

## ⚡ Commands

All commands are available via the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

| Command | Identifier | Description |
| :--- | :--- | :--- |
| **RAGLaB: Open Studio Dashboard** | `ragHelper.openDashboard` | Open the unified interactive RAGLaB Studio webview |
| **RAGLaB: Analyze Document** | `ragHelper.analyzeDocument` | Inspect file metrics and open in Document Inspector GUI |
| **RAGLaB: Create Chunks** | `ragHelper.createChunks` | Chunk file with custom parameters and open in Chunking Studio |
| **RAGLaB: Preview Chunks** | `ragHelper.previewChunks` | Quickly chunk the active editor file with default parameters |
| **RAGLaB: Analyze Workspace** | `ragHelper.analyzeWorkspace` | Scan project dependencies and folder structure for RAG tech |

---

## ⚙️ Configuration

Configure RAGLaB via VS Code Settings (`Ctrl+,` / `Cmd+,`) under **Extensions > RAGLaB**:

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `ragHelper.defaultChunkSize` | `number` | `500` | Default target chunk size in characters (min: 10, max: 10,000) |
| `ragHelper.defaultChunkOverlap` | `number` | `50` | Default overlap between consecutive chunks (min: 0, max: 5,000) |
| `ragHelper.showNotifications` | `boolean` | `true` | Show status notification toasts |
| `ragHelper.maxFileSize` | `number` | `5242880` | Maximum file size in bytes to process (default: 5 MB) |

---

## 📐 Chunking Strategy

RAGLaB uses a recursive hierarchical splitting approach:

1. **Paragraph Boundaries (`\n\n`)**: Natural semantic divisions in prose and documentation.
2. **Sentence Boundaries (`. `, `! `, `? `, `\n`)**: Complete grammatical statements.
3. **Word Boundaries (` `)**: Whitespace splits. Words are **never truncated in half**.

```
Document Text
  └─► Split at Paragraph Boundaries (\n\n)
        └─► If paragraph > Chunk Size:
              └─► Split at Sentence Boundaries (. ! ?)
                    └─► If sentence > Chunk Size:
                          └─► Split at Word Boundaries (whitespace)
```

---

## 📁 Supported File Types

| Format | Extension | Description |
| :--- | :--- | :--- |
| **Markdown** | `.md` | Technical documentation, knowledge articles, notes |
| **Plain Text**| `.txt` | Unstructured documents, logs, transcripts |
| **JSON** | `.json` | Structured records, conversational transcripts, data dumps |
| **CSV** | `.csv` | Tabular datasets, catalogs, structured knowledge tables |

---

## 🏗️ Architecture

RAGLaB follows a clean, decoupled layered architecture:

```
src/
├── extension.ts          # Entry point and command registrations
├── commands/             # User interaction & command triggers
├── services/             # Pure business logic (chunking, stats, workspace scan)
├── models/               # TypeScript interfaces and contracts
├── utils/                # Utility helpers (text parsing, token estimation)
├── views/                # Activity Bar sidebar provider
└── webview/              # Interactive Studio webviews & templates
```

For complete technical specifications, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 💻 Development & Testing

### Prerequisites
- **Node.js**: `>= 18.0.0`
- **npm**: `>= 9.0.0`
- **VS Code**: `>= 1.85.0`

### Build & Run
```bash
# Clone the repository
git clone https://github.com/aroshwijesinghe/RAGLab.git
cd RAGLab

# Install dependencies
npm install

# Compile the TypeScript extension
npm run compile

# Run all 52 unit tests
npm test

# Package the .vsix extension file
npm run package
```

To debug in VS Code, press `F5` to launch an **Extension Development Host**.

---

## 🗺️ Roadmap

- [x] **V0.1**: Document analysis, smart chunking, interactive Studio webview, workspace scanner.
- [ ] **V0.2**: Local embedding generation via ONNX, similarity search, dimension analysis.
- [ ] **V0.3**: PostgreSQL + `pgvector` live database integration and query playground.
- [ ] **V0.4**: RAG retrieval simulation, precision/recall scoring, context window headroom gauge.
- [ ] **V1.0**: Complete RAG developer toolkit with multi-vector store support and export integrations.

See [ROADMAP.md](ROADMAP.md) for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/cool-rag-feature`)
3. Commit your changes (`git commit -m "feat: add cosine similarity calculator"`)
4. Push to the branch (`git push origin feature/cool-rag-feature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

## 🔒 Security & Privacy

RAGLaB processes all documents and code **100% locally** on your machine. No telemetry is collected and no external API requests are made.
