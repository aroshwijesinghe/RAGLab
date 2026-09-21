<p align="center">
  <img src="resources/logo.png" width="140" alt="RAGLaB Logo" />
</p>

# RAGLaB User Guidelines and Engineering Handbook

Welcome to **RAGLaB** — the interactive GUI studio designed for engineers, researchers, and developers constructing, inspecting, and fine-tuning **Retrieval-Augmented Generation (RAG)** pipelines.

This handbook details how to operate every capability of RAGLaB directly through the **Graphical User Interface (GUI)** without requiring command-line scripts, external backend daemons, or cloud API keys.

---

## Table of Contents

1. [Quick Start: Opening the Workbench](#1-quick-start-opening-the-workbench)
2. [Document Inspector and Supported Text Formats](#2-document-inspector-and-supported-text-formats)
3. [Chunking Studio and Visualizer Guide](#3-chunking-studio-and-visualizer-guide)
4. [Document Partition Minimap](#4-document-partition-minimap)
5. [Local Retrieval Simulator and Headroom Gauge](#5-local-retrieval-simulator-and-headroom-gauge)
6. [Workspace Technology Scanner](#6-workspace-technology-scanner)
7. [Sidebar Controller](#7-sidebar-controller)
8. [Chunking Engineering Principles](#8-chunking-engineering-principles)
9. [Diagnostic Warnings and Troubleshooting](#9-diagnostic-warnings-and-troubleshooting)
10. [UI Micro-Interactions and Accessibility](#10-ui-micro-interactions-and-accessibility)

---

## 1. Quick Start: Opening the Workbench

RAGLaB Studio can be accessed through three entry points:

### Option A: From the Activity Bar
1. Click the beaker icon on the left Activity Bar labeled **RAGLaB**.
2. Click **Launch Visual Workbench**.

### Option B: From the Command Palette
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS).
2. Type `RAGLaB` and choose **RAGLaB: Open Studio Dashboard**.

### Option C: Right-Click in the Editor or Explorer
1. Right-click any supported text file (`.md`, `.txt`, `.json`, or `.csv`).
2. Select **RAGLaB: Analyze Document** or **RAGLaB: Create Chunks**.

---

## 2. Document Inspector and Supported Text Formats

The **Document Inspector** parses source text to calculate character count, word density, line distribution, and estimated token usage.

### Supported Document Formats
RAGLaB exclusively accepts text-native documents for deterministic character slicing and zero binary decoding distortion:

| Format | Extension | Processing Capabilities |
| :--- | :--- | :--- |
| **Markdown** | `.md`, `.markdown` | Full AST boundary detection, header preserving, code blocks, and table atomicity |
| **Plain Text** | `.txt` | Multi-tiered sentence boundary and paragraph splitting with token sliding window |
| **Structured JSON** | `.json` | Structured object hierarchy, schema keys, and record-level boundary preservation |
| **Tabular CSV** | `.csv` | Tabular row-level data and record chunking |
| **Direct Scratchpad Input** | *Direct Paste* | Instant ad-hoc chunking, token estimation, and retrieval simulation |

> **Why Text-Native Formats?**
> Binary formats (such as PDF or DOCX) rely on complex positioning streams and font-glyph coordinate maps. Slicing extracted binary text frequently introduces hyphenation artifacts, merged columns, and lost whitespace. Text-native formats provide exact UTF-8 character offsets, preserving deterministic boundaries for embedding models.

### How to Use the Interface:
1. Open the **Document Inspector** tab inside RAGLaB Studio.
2. Load content using any of the input methods:
   - **Interactive Drop Zone**: Drag and drop any `.md`, `.txt`, `.json`, or `.csv` file directly onto the upload target. Files are read instantaneously in memory using standard UTF-8 stream readers.
   - **Select File from Disk**: Select any supported text file from your workspace or local filesystem.
   - **Load Active File**: Imports text directly from whichever editor tab is currently open.
   - **Load Sample Document**: Instantly loads a comprehensive technical guide on RAG architectures for rapid experimentation without local files.
   - **Scratchpad**: Type or paste arbitrary text into the textarea and click **Analyze Text**.
3. Review key document metrics:
   - **Characters**: Total raw characters in the source.
   - **Words**: Word count based on whitespace separation.
   - **Estimated Tokens**: BPE token heuristic (`~words x 1.3`).
   - **Lines and Blank Lines**: Total line count alongside empty line distribution.
   - **Average Words per Line**: Text density metric.
4. If excessive empty lines or irregular formatting are detected, a warning banner will appear with recommendations.
5. Click **Send to Chunking Studio** to transfer the parsed text directly into the chunking workbench.

---

## 3. Chunking Studio and Visualizer Guide

The **Chunking Studio** divides source text into semantically cohesive partitions using your choice of three architectural strategies:

### Architecture Strategies in the GUI:
1. **Parent-Document (Small-to-Big) [Highest Accuracy]**:
   - Generates compact Child Search Units (250–300 chars) for high-precision vector similarity matching without embedding dilution.
   - Generates large Parent Context Units (1,200–1,500 chars) that are fed into the LLM prompt.
   - Resolves the tension between vector search precision and LLM context completeness.
2. **Markdown & Structural Hierarchy [AST Integrity]**:
   - Treats Markdown tables and fenced code blocks as unbroken atomic units (never severed across chunk boundaries).
   - Generates hierarchical breadcrumbs (`[Document > Section > Subsection]`) so isolated chunks retain their structural provenance.
3. **Recursive Boundary-Aware [Balanced]**:
   - Splits text sequentially along paragraph (`\n\n`), sentence (`. ! ?`), and word boundaries.

### Configuring Parameters:
1. Open the **Chunking Studio** tab.
2. Select your **Architecture Strategy** from the dropdown.
3. Adjust settings with the sliders, steppers, or one-click **Quick Presets**:
   - **Factoid (250 / 25)**: Compact segments for strict fact extraction and FAQ lookup.
   - **Standard RAG (500 / 50)**: Balanced segments for general technical documentation.
   - **Deep Context (1000 / 100)**: Broad segments for narrative prose and summaries.
   - When in Parent-Document mode, customize **Parent Context Size** (default: 1,200 chars).
4. **Live Validation**: The interface validates parameters in real time. Alerts will flag if overlap equals or exceeds chunk size, or if parent size is smaller than child size.
5. Click **Generate Chunks**.

### Navigating and Inspecting Chunks:
- **Parent-Document Dual View**:
  - In Parent-Document mode, click **Child Search Unit** to inspect the vector search slice, or click **Parent LLM Context** to inspect the full surrounding context with the child unit highlighted inside it.
- **Hierarchy & Structural Badges**:
  - Review the active heading breadcrumb trail (for example, `Architecture > Vector Store > Indexing`) and atomic block badges (`Table Preserved`, `Code Block Preserved`).
- **Navigation Controls**:
  - Click **Previous** and **Next** or use the left and right keyboard arrow keys to step through segments.
  - Enter a number into the `Chunk [ X ] of [ Total ]` field to jump directly to any chunk.
- **In-Place Search (Debounced 120ms)**:
  - Type terms into the search bar.
  - Matches are highlighted in yellow inside the chunk text in real time.
  - The match counter reports how many chunks contain the query.
- **Metrics**:
  - Every chunk displays its character count, word count, estimated token footprint, and source character offsets.
  - The **Chunk Utilization Progress Bar** visualizes length relative to the target size.
- **Exporting**:
  - Click **Copy Chunk** to copy the displayed segment to the clipboard.
  - Click **Copy All Chunks** to copy all segments with demarcated headers.
  - Click **Copy JSON** to copy the full structured dataset.
  - Click **Save to File (.json)** to save the dataset directly to a `.json` file in your workspace.

---

## 4. Document Partition Minimap

Positioned directly above the Chunk Visualizer box, the **Document Partition Minimap Strip** offers a high-density, interactive visual index of every chunk across the document:

- **Segment Representation**: Each chunk is rendered as an interactive horizontal segment sized proportionally across the document track.
- **Active State Feedback**: The active chunk segment scales dynamically and illuminates with a glowing blue border.
- **Atomic Block Indicators**: Segments representing atomic Markdown tables or fenced code blocks display a bright green top border (`.minimap-seg.atomic`).
- **Instant Click-to-Jump**: Clicking any segment in the minimap immediately jumps to that chunk in the viewer.
- **Smooth Auto-Scroll Synchronization**: Moving through chunks via arrow keys or navigation buttons smoothly scrolls the active minimap segment into view.

---

## 5. Local Retrieval Simulator and Headroom Guide

Located directly beneath the chunk visualizer in the Chunking Studio, the **Retrieval Simulator** evaluates retrieval viability before publishing to an external vector database.

### How to Use the Simulator:
1. Enter a realistic user prompt or question (for example: *"Why is sentence boundary preservation critical for vector search?"*).
2. Click **Retrieve Top Chunks** or press `Enter`.
3. The internal TF-IDF scoring engine evaluates all chunks and displays the **Top-3 Ranked Matches** with relevance score percentages.
4. When Parent-Document mode is active, each card displays the matching child score alongside the **Parent Context token size**.
5. **Click any ranked card** to jump directly to that chunk in the explorer with query terms highlighted.

### Dual-Tier LLM Context Headroom Gauge:
Directly below the simulator results, the headroom gauge monitors cumulative token load:
- **Cumulative Token Footprint**: Sums the token footprint of all retrieved chunks (or unique parent context blocks in Parent-Document mode).
- **Dual Budget Tracking**: Simultaneously calculates percentage utilization for both **4K (4,096 tokens)** and **8K (8,192 tokens)** context windows.
- **Dynamic Color Indicators**:
  - **Green (<40%)**: Safe context headroom. Ample room remains for system instructions, conversation history, and model generation.
  - **Amber / Yellow (40%–75%)**: Moderate context utilization. Monitor prompt overhead.
  - **Crimson / Red (>75%)**: High-risk context saturation. Chunks risk exceeding prompt limits or causing output truncation.

---

## 6. Workspace Technology Scanner

The **Workspace Scanner** audits your repository to discover RAG libraries, vector databases, embedding frameworks, and ingestion directories.

### How to Run the Scanner:
1. Open the **Workspace Scanner** tab.
2. Click **Scan Workspace**.
3. Review your RAG architecture summary:
   - **Readiness Pill**: Indicates `[Active]` when vector stores, embedding models, or orchestrators are found, or `[Standard Project]` when none are detected.
   - **Category Filters**: Filter cards by `All`, `Vector DBs`, `Embeddings`, `Orchestration`, or `Frameworks`.
   - **Technology Cards**: Displays each technology with its detection status (`[Active]` with source file vs `[Not Found]`).
   - Supported frameworks include: `pgvector`, `Chroma`, `FAISS`, `Qdrant`, `Pinecone`, `Weaviate`, `Milvus`, `PostgreSQL`, `Sentence Transformers`, `OpenAI`, `HuggingFace`, `LangChain`, `LlamaIndex`, `Haystack`, `FastAPI`, `Flask`, `Express`, `Python`, and `TypeScript`.
   - **RAG Directories**: Lists folders configured for data ingestion, such as `documents/`, `embeddings/`, and `retrieval/`.
   - **Copy Report**: Copies the full text diagnostic audit to your clipboard.

---

## 7. Sidebar Controller

The RAGLaB Sidebar provides quick-access controls in VS Code's Activity Bar:
- **Launch Visual Workbench**: Opens the primary multi-tab studio.
- **Analyze Document Structure**: Prompts for a file and shows its profile in the inspector.
- **Partition & Chunk Document**: Opens chunking options for the active or selected file.
- **Preview Active Document**: Generates an immediate chunk preview of the current editor file.
- **Scan RAG Tech Stack**: Triggers a repository audit.

---

## 8. Chunking Engineering Principles

### Chunk Size Strategy
Chunk size dictates the balance between contextual breadth and vector specificity:

| Chunk Size | Approximate Tokens | Ideal Use Case | Trade-offs |
|---|---|---|---|
| **Small (100-300 chars)** | 25-75 tokens | Fact extraction, FAQ lookups, strict sentence matching | High precision, low noise; lacks surrounding narrative context. |
| **Medium (500-1,000 chars)** | 125-250 tokens | Technical manuals, articles, general Q&A | Balanced context and vector specificity (standard default). |
| **Large (1,200-2,500 chars)** | 300-600 tokens | Summarization, contracts, comprehensive analysis | Broad context; potential dilution of vector similarity scores. |

### Overlap Principles
- Always maintain an overlap between **10% and 20%** (for example, 50 characters for a 500-character chunk).
- Overlap prevents context loss: without overlap, keywords or compound clauses split across boundary cuts lose semantic continuity in vector space.

---

## 9. Diagnostic Warnings and Troubleshooting

| Warning / Alert in GUI | Cause | Recommended Action |
|---|---|---|
| `[Notice] Very small chunk detected` | A chunk has fewer than 50 characters, often due to a short trailing paragraph. | Review document endings or adjust minimum chunk thresholds. |
| `[Warning] Large chunk detected` | A paragraph or sentence exceeded 1.5x the target chunk size without natural breaks. | Add punctuation or line breaks to long run-on sentences. |
| `[Warning] High ratio of empty lines` | More than 30% of document lines are blank. | Clean and normalize document whitespace before embedding. |
| `[Error] Overlap must be strictly less than chunk size` | Overlap was set greater than or equal to chunk size. | Decrease overlap or increase chunk size using the sliders. |
| `[Error] Selected file type is not supported` | Attempted to load a binary or unsupported file format (such as PDF or DOCX). | Provide a supported text format: `.md`, `.txt`, `.json`, or `.csv`, or paste text directly. |
| `[Error] Document contains no usable text` | File is empty or contains only whitespace. | Verify source file contents before processing. |

---

## 10. UI Micro-Interactions and Accessibility

- **Fluid Tab Transitions**: Switching workbench tabs triggers a subtle slide-and-fade animation (`tabSlideUp 0.22s`).
- **Tactile Copy Confirmation**: Clicking copy buttons swaps the icon to an animated checkmark with "Copied!" text for 1.8 seconds.
- **Cascading Retrieval Cards**: Ranked query match cards enter with staggered animation delays (`cascadeIn` with `idx * 60ms`).
- **Active Studio Status Indicator**: The laboratory pulse indicator in the header and sidebar pulses continuously while RAGLaB is active.
- **Full Keyboard Navigation**: Use `Left` and `Right` arrow keys to step through chunks without touching the mouse.
- **Zero Emojis**: The interface adheres strictly to professional typography, using crisp SVG icons and high-contrast design tokens.

---

*RAGLaB is developed and executed entirely on your local machine with zero external network calls.*
