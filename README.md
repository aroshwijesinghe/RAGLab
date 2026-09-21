<p align="center">
  <img src="resources/logo.png" width="160" alt="RAGLaB Logo" />
</p>

# RAGLaB

**Interactive GUI Studio and Diagnostic Workbench for Retrieval-Augmented Generation (RAG) Engineering**

[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue?logo=visualstudiocode)](https://github.com/aroshwijesinghe/RAGLab)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Local First](https://img.shields.io/badge/Security-100%25%20Local-success)](#security--privacy)

---

```
+-----------+     +----------+     +------------+     +-----------------+     +-----------+     +-----+
| Documents | --> | Chunking | --> | Embeddings | --> | Vector Database | --> | Retrieval | --> | LLM |
| (.md,.txt)|     | (RAGLaB) |     | (Vectors)  |     |(pgvector,Chroma)|     |  (Top-K)  |     |(Gen)|
+-----------+     +----------+     +------------+     +-----------------+     +-----------+     +-----+
```

> **Retrieval-Augmented Generation (RAG)** pairs Large Language Models with external, verifiable reference materials. Source files are segmented into discrete text chunks, embedded into vector space, stored in a vector index, retrieved by semantic relevance to a query, and provided as prompt context.
>
> Downstream model precision and hallucination prevention depend directly on **chunking quality**. Arbitrary text splits, severed sentences, and noisy segments degrade similarity search and truncate critical facts. **RAGLaB** provides an interactive, lightweight, 100% local workbench within your IDE to inspect, partition, test, and tune document structures before ingestion.

---

## Table of Contents

- [Key Highlights](#key-highlights)
- [Interactive GUI Feature Tour](#interactive-gui-feature-tour)
- [Feature Usage Guide](#feature-usage-guide)
  - [1. Launching RAGLaB Studio](#1-launching-raglab-studio)
  - [2. Document Inspector](#2-document-inspector)
  - [3. Chunking Studio and Visualizer](#3-chunking-studio-and-visualizer)
  - [4. Local Retrieval Simulator and Headroom Gauge](#4-local-retrieval-simulator-and-headroom-gauge)
  - [5. Workspace Technology Scanner](#5-workspace-technology-scanner)
  - [6. Activity Bar Sidebar](#6-activity-bar-sidebar)
- [Available Commands](#available-commands)
- [Configuration Settings](#configuration-settings)
- [Chunking Strategy and Engineering Guide](#chunking-strategy-and-engineering-guide)
- [Supported File Formats](#supported-file-formats)
- [Decoupled Architecture](#decoupled-architecture)
- [Development, Testing and Packaging](#development-testing-and-packaging)
- [Strategic Roadmap](#strategic-roadmap)
- [Contributing](#contributing)
- [Security and Privacy](#security-and-privacy)
- [License](#license)

---

## Key Highlights

- **Complete Graphical User Interface (GUI)**: Profile document metrics, slide chunk parameters, navigate partitions, and audit repository dependencies through an integrated visual workbench.
- **Privacy First and Fully Local**: Zero network requests, zero telemetry, and zero third-party API dependencies. Every computation runs locally on your workstation.
- **Hierarchical Boundary-Aware Chunking**: Intelligently segments prose along paragraph (`\n\n`), sentence (`. ! ?`), and word boundaries. Words and semantic clauses remain intact.
- **Interactive Visualizer and In-Place Search**: Step through chunks sequentially with arrow keys, jump to arbitrary indices, and perform instant full-text searches with highlighted matches.
- **RAG Stack Dependency Scanner**: Audits project dependency manifests (`requirements.txt`, `package.json`, `pyproject.toml`) and directory layouts to report vector databases, embedding engines, and RAG folders.
- **Lightweight Footprint**: Constructed with vanilla TypeScript and native editor design tokens. The packaged extension distribution is under 100 KB.

---

## Interactive GUI Feature Tour

| Tab / View | Capabilities and Visual Elements |
|---|---|
| **Document Inspector** | Load content via file picker, active editor tab, sample data, or custom scratchpad. Visual metric cards for Characters, Words, Lines, Empty Lines, and Lexical Density. Token estimation heuristic (~words x 1.3). Real-time formatting warnings and direct dispatch to the chunking workbench. |
| **Chunking Studio** | Dynamic architecture strategy selector: **Parent-Document (Small-to-Big)** for maximum accuracy, **Markdown & Structural Hierarchy** for AST table/code preservation, and **Recursive Boundary-Aware**. Interactive sliders and steppers for Chunk Size (50-3,000), Overlap (0-500), and Parent Context Size (600-4,000). Quick presets for Factoid (250/25), Standard RAG (500/50), and Deep Context (1,000/100). Live parameter validation and direct JSON export to disk. |
| **Chunk Explorer** | Sequential navigation controls (`Previous`, `Next`, index input, and left/right keyboard arrows). Dual-mode toggle for Parent-Document strategy: inspect the **Child Search Unit** or the expanded **Parent LLM Context** with the child highlighted inside it. Breadcrumb hierarchy tags and atomic block badges (`Table Preserved`, `Code Block Preserved`). In-place search with marked keyword matches. Chunk utilization progress bar and context continuity indicators. |
| **Local Retrieval Simulator** | Top-K similarity engine running TF-IDF scoring across in-memory chunks. Enter natural-language queries to inspect the Top-3 matching chunks with relevance percentages. In Parent-Document mode, inspects both child match score and expanded parent context token footprint. LLM Context Headroom Gauge tracking combined token load and percent consumption of 4K and 8K context windows. |
| **Workspace Scanner** | Automatic scan of project manifests (`requirements.txt`, `package.json`, `pyproject.toml`). RAG readiness indicator with status pill. Category filters for Vector Databases, Embeddings, Orchestration, and Web Frameworks. Detected folder map (`documents/`, `embeddings/`, etc.) and formatted text report export. |
| **Guidelines Tab** | Visual architectural ASCII diagram, chunk sizing decision matrix, overlap engineering formulas, and direct navigation to the comprehensive user handbook. |

---

## Feature Usage Guide

### 1. Launching RAGLaB Studio

RAGLaB can be opened through three convenient entry points:
- **Activity Bar Icon**: Click the beaker icon on the left Activity Bar labeled **RAGLaB**, then click **Launch Visual Workbench**.
- **Command Palette**: Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS), search for `RAGLaB`, and select **RAGLaB: Open Studio Dashboard**.
- **Context Menu**: Right-click any supported document (`.pdf`, `.md`, `.txt`, `.json`, `.csv`) in your File Explorer or Editor and select **RAGLaB: Analyze Document** or **RAGLaB: Create Chunks**.

---

### 2. Document Inspector

1. Open the **Document Inspector** tab in RAGLaB Studio.
2. Select your preferred text input source:
   - **Select File from Disk**: Opens a native file dialog to choose any `.pdf`, `.md`, `.txt`, `.json`, or `.csv` file.
   - **Load Active File**: Reads content directly from the file currently open in your editor.
   - **Load Sample Document**: Populates the inspector with a pre-configured technical document on RAG architectures for immediate testing.
   - **Scratchpad**: Type or paste arbitrary text directly into the scratchpad area and click **Analyze Text**.
3. Review key document statistics:
   - **Characters**: Exact character count.
   - **Words**: Total words segmented by whitespace.
   - **Estimated Tokens**: Word-based heuristic calculated as `~words x 1.3`.
   - **Total Pages**: When analyzing PDF files, reports verified pagination count from the PDF engine.
   - **Lines and Blank Lines**: Total line count alongside empty line distribution.
   - **Average Words per Line**: Measure of textual density.
4. If formatting issues are detected (e.g. excessive empty lines), a notification banner highlights recommendations.
5. Click **Send to Chunking Studio** to transfer the parsed text directly into the chunking workbench. Page-level breadcrumbs (`### Page X`) are preserved for citation lineage.

---

### 3. Chunking Studio and Visualizer

1. Open the **Chunking Studio** tab.
2. Select your **Architecture Strategy**:
   - **Parent-Document (Small-to-Big) [Highest Accuracy]**: Partitions text into large parent context blocks (for the LLM prompt) and small child units (for vector search). Eliminates vector dilution while preventing context starvation.
   - **Markdown & Structural Hierarchy [AST Integrity]**: Preserves Markdown tables and fenced code blocks as atomic units (never severed), while attaching hierarchical heading breadcrumbs (`[Document > Section > Subsection]`).
   - **Recursive Boundary-Aware [Balanced]**: Hierarchically splits across paragraphs (`\n\n`), sentences (`. ! ?`), and words.
3. Configure parameters using sliders, steppers, or **Quick Presets**:
   - **Factoid (250 / 25)**: Compact partitions optimized for precise entity lookups and FAQ matching.
   - **Standard RAG (500 / 50)**: Balanced partitions suitable for general technical documentation and articles.
   - **Deep Context (1000 / 100)**: Broad partitions for narrative prose, legal briefs, and summaries.
   - For Parent-Document mode, adjust **Parent Context Size** (default: 1,200 chars).
   - *Parameter Validation*: If overlap equals or exceeds chunk size, or if parent size is less than child size, an inline alert prevents execution until corrected.
4. Click **Generate Chunks**.
5. Examine the generated distribution:
   - Total chunk count.
   - Character, word, and token distribution (Min, Average, Max).
   - Quality indicators flagging sub-sized or oversized segments.
6. Inspect segments in the **Chunk Explorer**:
   - In Parent-Document mode, toggle between **Child Search Unit** (the exact vector search slice) and **Parent LLM Context** (the full context block with the child slice highlighted).
   - In Markdown mode, review the **Hierarchy Breadcrumb** pill and atomic preservation badges.
   - Use **Previous** and **Next** buttons or keyboard arrow keys (`Left` / `Right`) to browse segments sequentially.
   - Enter terms into the search bar to highlight occurrences in yellow and view matching chunk totals.
   - Use **Copy Chunk** for the active segment, **Copy All Chunks** for a concatenated overview, or **Save to File (.json)** to write the dataset directly to your workspace.

---

### 4. Local Retrieval Simulator and Headroom Gauge

Located beneath the chunk preview in the Chunking Studio:
1. Enter a natural language query (for example: *"How does vector chunking preserve context?"*).
2. Click **Retrieve Top Chunks** or press `Enter`.
3. The local retrieval engine scores all chunks using TF-IDF and returns the **Top-3 Ranked Matches** with match percentages.
4. In Parent-Document mode, each card displays the matching child score alongside the **Parent Context token size**.
5. Click any ranked match card to instantly navigate to that chunk in the explorer with matching terms highlighted.
6. Review the **LLM Context Headroom Gauge**:
   - Calculates the collective token footprint of retrieved chunks (or unique parent context blocks).
   - Displays percentage consumption against standard 4K and 8K context windows, ensuring prompt templates and system directives have ample headroom.

---

### 5. Workspace Technology Scanner

1. Open the **Workspace Scanner** tab.
2. Click **Scan Workspace**.
3. RAGLaB parses repository configuration manifests (`requirements.txt`, `package.json`, `pyproject.toml`) and directory trees safely without running code.
4. Review findings:
   - **RAG Readiness**: Displays an active status pill when vector databases, embedding engines, or orchestrators are detected.
   - **Category Filters**: Filter cards by `All`, `Vector DBs`, `Embeddings`, `Orchestration`, or `Frameworks`.
   - **Technology Cards**: Indicates detection status (`[Active]` with source filename vs `[Not Found]`).
   - Supported technologies include: `pgvector`, `Chroma`, `FAISS`, `Qdrant`, `Pinecone`, `Weaviate`, `Milvus`, `PostgreSQL`, `Sentence Transformers`, `OpenAI`, `HuggingFace`, `LangChain`, `LlamaIndex`, `Haystack`, `FastAPI`, `Flask`, `Express`, `Python`, and `TypeScript`.
   - **RAG Directories**: Highlights ingestion folders such as `documents/`, `embeddings/`, `retrieval/`, and `data/`.
   - **Copy Report**: Copies the full repository audit summary to your clipboard.

---

### 6. Activity Bar Sidebar

The RAGLaB Sidebar lives in the primary Activity Bar:
- **Launch Visual Workbench**: Opens the full multi-tab studio.
- **Analyze Document Structure**: Prompts for a file and opens its structural profile.
- **Partition & Chunk Document**: Opens chunking options for the selected file.
- **Preview Active Document**: Generates an immediate chunk preview of the active editor file.
- **Scan RAG Tech Stack**: Performs a workspace technology scan.

---

## Available Commands

Every capability is accessible via the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

| Command | Identifier | Description |
| :--- | :--- | :--- |
| **RAGLaB: Open Studio Dashboard** | `ragHelper.openDashboard` | Opens the unified visual studio dashboard |
| **RAGLaB: Analyze Document** | `ragHelper.analyzeDocument` | Profiles file metrics and loads them in the inspector |
| **RAGLaB: Create Chunks** | `ragHelper.createChunks` | Partitions a document and opens the chunking studio |
| **RAGLaB: Preview Chunks** | `ragHelper.previewChunks` | Quickly chunks active editor text using default parameters |
| **RAGLaB: Analyze Workspace** | `ragHelper.analyzeWorkspace` | Audits workspace dependencies and folders for RAG components |

---

## Configuration Settings

Configure global defaults in VS Code Settings (`Ctrl+,` / `Cmd+,`) under **Extensions > RAGLaB**:

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `ragHelper.defaultChunkSize` | `number` | `500` | Default chunk size in characters (minimum: 10, maximum: 10,000) |
| `ragHelper.defaultChunkOverlap` | `number` | `50` | Default overlap between adjacent chunks (minimum: 0, maximum: 5,000) |
| `ragHelper.showNotifications` | `boolean` | `true` | Show status notification banners on operations |
| `ragHelper.maxFileSize` | `number` | `5242880` | Maximum file size in bytes allowed for analysis (default: 5 MB) |

---

## Chunking Strategy and Engineering Guide

RAGLaB equips engineers with three distinct architectural chunking strategies directly in the GUI:

### 1. Parent-Document (Small-to-Big) Strategy [Highest Accuracy]
Solves the fundamental contradiction between vector search precision and LLM context completeness:
- **Vector Search** prefers small chunks (100–250 tokens) to produce sharp, focused embedding vectors without semantic dilution.
- **The LLM** needs large chunks (800–2,000 tokens) to retain definitions, conditions, caveats, and full narrative context.
- **Workflow**: Large Parent Chunks (1,200–1,500 chars) are created for context, and small Child Chunks (250–300 chars) are created for indexing. When a Child Chunk is retrieved, its full Parent Chunk is supplied to the LLM prompt.

```
Document Text
  |
  +--> Parent Chunk #1 (1,200 chars) [Passed to LLM Prompt]
  |      |-- Child Chunk 1.1 (250 chars) [Indexed in Vector DB]
  |      |-- Child Chunk 1.2 (250 chars) [Indexed in Vector DB]
  |      \-- Child Chunk 1.3 (250 chars) [Indexed in Vector DB]
  |
  \--> Parent Chunk #2 (1,200 chars) [Passed to LLM Prompt]
         |-- Child Chunk 2.1 (250 chars) [Indexed in Vector DB]
         \-- Child Chunk 2.2 (250 chars) [Indexed in Vector DB]
```

### 2. Markdown & Structural Hierarchy Strategy [AST Integrity]
Protects structured documents from boundary fracture:
- **Table Preservation**: Markdown tables (`| col1 | col2 |`) are treated as atomic units and are never severed across chunk borders.
- **Code Block Preservation**: Fenced code blocks (` ```python ... ``` `) remain whole to avoid syntax fragmentation.
- **Contextual Breadcrumb Hierarchy**: Parses headings (`#`, `##`, `###`) and prepends breadcrumbs (`[Document > Installation > Config]`) to chunk metadata so isolated chunks carry their domain origin.

### 3. Recursive Boundary-Aware Splitting [Balanced]
Processes prose hierarchically along natural language boundaries:

```
Raw Text Input
  |
  +--> 1. Paragraph Boundaries (\n\n)
  |      Preserves thematic sections when length fits within target size.
  |
  +--> 2. Sentence Boundaries (. ! ? \n)
  |      Preserves grammatical completeness when paragraphs exceed target size.
  |
  +--> 3. Word Boundaries (whitespace)
         Prevents mid-token truncation so words are never severed.
```

### Strategy Selection Matrix

| Strategy | Search Precision | Context Completeness | Best Suited For |
|---|---|---|---|
| **Parent-Document** | Maximum | Maximum | Mission-critical RAG, legal contracts, complex analytical Q&A |
| **Markdown / Structural** | High | Very High | Technical wikis, API documentation, developer manuals, tables |
| **Recursive Boundary** | Balanced | High | Unstructured prose, meeting notes, customer service transcripts |

### Overlap Engineering Guidelines
- Maintain an overlap ratio between **10% and 20%** of your target chunk size (for example, 50 characters for a 500-character chunk).
- Overlap guarantees that compound ideas, dependent clauses, and entities spanning chunk cutoffs remain represented in adjacent retrieval units.

---

## Supported File Formats

| Format | Extension | Common RAG Application |
| :--- | :--- | :--- |
| **PDF Documents** | `.pdf` | Research papers, financial filings, whitepapers, enterprise reports |
| **Markdown** | `.md` | Technical documentation, developer guides, README files |
| **Plain Text** | `.txt` | Unstructured source notes, logs, customer transcripts |
| **JSON** | `.json` | Chat logs, structured conversational exports, entity dumps |
| **CSV** | `.csv` | Tabular datasets, catalog inventories, tabular rows |

---

## Decoupled Architecture

RAGLaB follows a modular separation of concerns:

```
src/
|-- extension.ts             # Entry point and subscription lifecycle
|-- commands/                # Command bridges between VS Code and workbench panels
|   |-- analyzeDocument.ts
|   |-- createChunks.ts
|   |-- previewChunks.ts
|   |-- analyzeWorkspace.ts
|   +-- openDashboard.ts
|-- services/                # Pure business logic isolated from UI concerns
|   |-- documentAnalyzer.ts  # Lexical and token calculation
|   |-- pdfService.ts        # Pure TypeScript PDF extraction and page mapping
|   |-- pdfPolyfill.ts       # Runtime DOM polyfills for PDF worker execution
|   |-- chunkingService.ts   # Boundary-aware text partitioning
|   |-- statisticsService.ts # Distribution mathematics
|   +-- workspaceAnalyzer.ts # Manifest parsing and folder audit
|-- models/                  # TypeScript interface contracts
|   +-- types.ts
|-- utils/                   # Pure helper functions
|   |-- textUtils.ts         # Formatting, token heuristics, and HTML escaping
|   +-- fileUtils.ts         # File system operations and size limits
|-- views/                   # Activity Bar sidebar implementation
|   +-- sidebarProvider.ts
+-- webview/                 # Studio panels, scripts, and layout controllers
    |-- dashboardPanel.ts
    |-- chunkViewerPanel.ts
    +-- templates/
        |-- dashboard.ts
        +-- chunkViewer.ts
```

---

## Development, Testing and Packaging

### Environment Prerequisites
- **Node.js**: `>= 18.0.0`
- **npm**: `>= 9.0.0`
- **VS Code**: `>= 1.85.0`

### Build and Verification Commands
```bash
# Clone repository
git clone https://github.com/aroshwijesinghe/RAGLab.git
cd RAGLab

# Install dependencies
npm install

# Compile TypeScript bundle
npm run compile

# Run automated unit test suite (52 tests)
npm test

# Package VSIX distribution bundle
npx vsce package --no-dependencies
```

Press `F5` in VS Code to start the Extension Development Host and debug live.

---

## Strategic Roadmap

- [x] **V0.1 (Current)**:
  - Document profiling with character, word, line, and token metrics.
  - Smart boundary-aware chunk partitioning with sliding overlap.
  - Interactive multi-tab RAGLaB Studio webview with official branding.
  - Real-time full-text search with marked match highlights.
  - Workspace technology scanner and folder audit.
  - Activity Bar sidebar view with immediate launch controls.
  - Local TF-IDF retrieval simulator and LLM context headroom gauge.
- [ ] **V0.2 (Upcoming)**:
  - Local ONNX-powered vector embedding generation.
  - Cosine similarity matrix between adjacent chunks.
  - Embedding dimension analysis and token cost calculator.
- [ ] **V0.3 (Planned)**:
  - PostgreSQL + pgvector live database connection manager.
  - Interactive SQL vector query runner.
- [ ] **V0.4 (Planned)**:
  - Synthetic evaluation of retrieval precision and recall.
  - End-to-end prompt assembly preview.
- [ ] **V1.0 (Vision)**:
  - Multi-vector database connector and automated pipeline optimization.

---

## Contributing

Contributions are welcomed:
1. Fork the repository on GitHub.
2. Create a feature branch (`git checkout -b feature/boundary-enhancement`).
3. Verify all automated tests pass (`npm test`).
4. Commit using conventional commit format (`git commit -m "feat: enhance sentence splitting for abbreviations"`).
5. Push to your branch and submit a Pull Request.

---

## Security and Privacy

- **100% Local Execution**: All computations execute inside the local VS Code extension process.
- **Zero External Network Requests**: Content and project structures are never transmitted externally.
- **Zero Telemetry**: No tracking scripts, analytics, or behavioral cookies are present.
- **Read-Only Operations**: File operations are strictly read-only by default; source files are never altered without user confirmation.

---

## License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for terms.
