import { DocumentAnalysis, ChunkResult, ChunkStatistics, WorkspaceAnalysis } from '../../models/types';
import { escapeHtml } from '../../utils/textUtils';

export interface DashboardInitialState {
  activeTab?: 'document' | 'chunking' | 'workspace' | 'guidelines';
  documentAnalysis?: DocumentAnalysis | null;
  chunkResult?: ChunkResult | null;
  chunkStatistics?: ChunkStatistics | null;
  workspaceAnalysis?: WorkspaceAnalysis | null;
  defaultChunkSize?: number;
  defaultChunkOverlap?: number;
}

export function getDashboardHtml(
  nonce: string,
  cspSource: string,
  initialState?: DashboardInitialState
): string {
  const stateJson = JSON.stringify(initialState || {});

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RAGLaB Studio</title>
  <style nonce="${nonce}">
    :root {
      --card-bg: var(--vscode-editor-background);
      --border-color: var(--vscode-panel-border, rgba(128, 128, 128, 0.25));
      --header-bg: rgba(128, 128, 128, 0.08);
      --accent-color: var(--vscode-button-background, #0e639c);
      --success-color: #388a34;
      --warning-color: #cca700;
      --error-color: #f48771;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
      color: var(--vscode-editor-foreground);
      background-color: var(--vscode-editor-background);
      line-height: 1.5;
      font-size: 13px;
      padding: 16px 24px;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* Top Brand Bar */
    .brand-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 12px;
      flex-shrink: 0;
    }

    .brand-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-title h1 {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: var(--vscode-editor-foreground);
    }

    .brand-badge {
      background: var(--vscode-badge-background, #4d4d4d);
      color: var(--vscode-badge-foreground, #ffffff);
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 600;
    }

    .brand-subtitle {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
    }

    /* Navigation Tabs */
    .tab-bar {
      display: flex;
      gap: 6px;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 16px;
      flex-shrink: 0;
    }

    .tab-button {
      background: transparent;
      border: none;
      color: var(--vscode-descriptionForeground);
      padding: 8px 16px;
      cursor: pointer;
      font-size: 13px;
      font-family: inherit;
      border-bottom: 2px solid transparent;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }

    .tab-button:hover {
      color: var(--vscode-editor-foreground);
      background: rgba(128, 128, 128, 0.06);
    }

    .tab-button.active {
      color: var(--vscode-editor-foreground);
      border-bottom-color: var(--vscode-activityBar-activeBorder, var(--accent-color));
      font-weight: 600;
    }

    /* Tab Content Panels */
    .tab-container {
      flex: 1;
      overflow-y: auto;
      padding-right: 4px;
    }

    .tab-panel {
      display: none;
      flex-direction: column;
      gap: 16px;
      animation: fadeIn 0.15s ease-in-out;
    }

    .tab-panel.active {
      display: flex;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(2px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Common Card Styles */
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-title {
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Buttons */
    .btn {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 6px 14px;
      border-radius: 4px;
      font-size: 12px;
      font-family: inherit;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background-color 0.15s;
    }

    .btn:hover {
      background-color: var(--vscode-button-hoverBackground);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: var(--vscode-button-secondaryBackground, rgba(128, 128, 128, 0.2));
      color: var(--vscode-button-secondaryForeground, var(--vscode-editor-foreground));
    }

    .btn-secondary:hover {
      background-color: var(--vscode-button-secondaryHoverBackground, rgba(128, 128, 128, 0.3));
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 10px;
    }

    .kpi-card {
      background: var(--header-bg);
      border: 1px solid var(--border-color);
      border-radius: 5px;
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
    }

    .kpi-label {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .kpi-value {
      font-size: 18px;
      font-weight: 700;
      color: var(--vscode-editor-foreground);
    }

    .kpi-note {
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      margin-top: 2px;
    }

    /* Forms & Inputs */
    .form-row {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 140px;
    }

    .form-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--vscode-descriptionForeground);
      text-transform: uppercase;
    }

    input[type="number"], input[type="text"], textarea {
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border, var(--border-color));
      border-radius: 3px;
      padding: 6px 10px;
      font-size: 12px;
      font-family: inherit;
    }

    input[type="range"] {
      width: 160px;
      accent-color: var(--accent-color);
    }

    textarea {
      font-family: var(--vscode-editor-font-family, monospace);
      resize: vertical;
      min-height: 100px;
      width: 100%;
    }

    /* Warnings Banner */
    .warning-box {
      border-radius: 4px;
      padding: 8px 12px;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-left: 3px solid;
    }

    .warning-box.warning {
      background: rgba(204, 167, 0, 0.12);
      border-color: var(--warning-color);
      color: var(--vscode-editor-foreground);
    }

    .warning-box.error {
      background: rgba(244, 135, 113, 0.12);
      border-color: var(--error-color);
      color: var(--vscode-editor-foreground);
    }

    .warning-box.info {
      background: rgba(117, 190, 255, 0.12);
      border-color: #75beff;
      color: var(--vscode-editor-foreground);
    }

    /* Chunk Visualizer */
    .chunk-preview-box {
      border: 1px solid var(--border-color);
      border-radius: 5px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: var(--vscode-editor-background);
    }

    .chunk-preview-header {
      background: var(--header-bg);
      padding: 8px 12px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .chunk-badges {
      display: flex;
      gap: 6px;
    }

    .badge-pill {
      background: var(--vscode-badge-background, rgba(128,128,128,0.2));
      color: var(--vscode-badge-foreground, inherit);
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: 500;
    }

    .badge-pill.success {
      background: rgba(56, 138, 52, 0.2);
      color: #73c991;
    }

    .chunk-body {
      padding: 14px;
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: var(--vscode-editor-font-size, 13px);
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 320px;
      overflow-y: auto;
      line-height: 1.6;
    }

    mark {
      background-color: rgba(255, 220, 0, 0.35);
      color: inherit;
      border-radius: 2px;
      padding: 0 2px;
    }

    /* Technology Grid */
    .tech-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
      gap: 10px;
    }

    .tech-card {
      border: 1px solid var(--border-color);
      border-radius: 5px;
      padding: 10px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--card-bg);
      transition: border-color 0.15s;
    }

    .tech-card.detected {
      border-color: rgba(56, 138, 52, 0.5);
      background: rgba(56, 138, 52, 0.05);
    }

    .tech-info {
      display: flex;
      flex-direction: column;
    }

    .tech-name {
      font-weight: 600;
      font-size: 13px;
    }

    .tech-category {
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      text-transform: capitalize;
    }

    .tech-source {
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      font-style: italic;
    }

    .status-pill {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .status-pill.yes {
      background: rgba(56, 138, 52, 0.2);
      color: #73c991;
    }

    .status-pill.no {
      background: rgba(128, 128, 128, 0.15);
      color: var(--vscode-descriptionForeground);
    }

    /* Directory Chips */
    .dir-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .dir-chip {
      background: var(--header-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 4px 12px;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: var(--vscode-editor-font-family, monospace);
    }

    /* Diagram Block */
    .diagram-box {
      background: var(--header-bg);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 16px;
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 12px;
      line-height: 1.7;
      overflow-x: auto;
      white-space: pre;
    }

    /* Empty State */
    .empty-state {
      padding: 32px 16px;
      text-align: center;
      color: var(--vscode-descriptionForeground);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .empty-icon {
      font-size: 28px;
      opacity: 0.7;
    }
  </style>
</head>
<body>
  <!-- Brand Header -->
  <div class="brand-header">
    <div class="brand-title">
      <h1>🧪 RAGLaB Studio</h1>
      <span class="brand-badge">v0.1.0</span>
      <span class="brand-subtitle">Interactive RAG Pipeline &amp; Chunking Workbench</span>
    </div>
    <div style="display: flex; gap: 8px;">
      <button class="btn btn-secondary" id="btn-open-guide-header">📖 Guidelines</button>
    </div>
  </div>

  <!-- Tab Bar -->
  <div class="tab-bar">
    <button class="tab-button active" data-tab="document">📄 Document Inspector</button>
    <button class="tab-button" data-tab="chunking">🔪 Chunking Studio</button>
    <button class="tab-button" data-tab="workspace">🔍 Workspace Scanner</button>
    <button class="tab-button" data-tab="guidelines">📖 RAG Guidelines</button>
  </div>

  <!-- Tab Content Area -->
  <div class="tab-container">
    <!-- TAB 1: Document Inspector -->
    <div class="tab-panel active" id="tab-document">
      <div class="card">
        <div class="card-header">
          <div class="card-title">📄 Document Source</div>
          <div style="display: flex; gap: 8px;">
            <button class="btn" id="btn-pick-file">📂 Select File from Disk</button>
            <button class="btn btn-secondary" id="btn-load-active-editor">⚡ Load Active File</button>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div class="form-label">Or Paste / Type Text to Inspect:</div>
          <textarea id="doc-text-input" placeholder="Paste document text here or choose a file above to inspect characters, words, and estimated tokens..."></textarea>
          <div style="display: flex; justify-content: flex-end; gap: 8px;">
            <button class="btn btn-secondary" id="btn-analyze-custom-text">🔍 Analyze Text</button>
            <button class="btn" id="btn-send-to-chunking" disabled>🚀 Send to Chunking Studio</button>
          </div>
        </div>
      </div>

      <!-- Analysis Results Card -->
      <div class="card" id="doc-analysis-card" style="display: none;">
        <div class="card-header">
          <div class="card-title">
            <span id="doc-file-name">document.txt</span>
            <span class="badge-pill" id="doc-file-type">.txt</span>
            <span class="badge-pill" id="doc-file-size">0 B</span>
          </div>
        </div>

        <div id="doc-warnings-container"></div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <span class="kpi-label">Characters</span>
            <span class="kpi-value" id="kpi-chars">0</span>
            <span class="kpi-note">Total length</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Words</span>
            <span class="kpi-value" id="kpi-words">0</span>
            <span class="kpi-note">Whitespace split</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Estimated Tokens</span>
            <span class="kpi-value" id="kpi-tokens">~0</span>
            <span class="kpi-note">Formula: words × 1.3</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Total Lines</span>
            <span class="kpi-value" id="kpi-lines">0</span>
            <span class="kpi-note" id="kpi-empty-lines">0 empty lines</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Avg Words / Line</span>
            <span class="kpi-value" id="kpi-avg-words-line">0</span>
            <span class="kpi-note">Density metric</span>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: Chunking Studio -->
    <div class="tab-panel" id="tab-chunking">
      <div class="card">
        <div class="card-header">
          <div class="card-title">🔪 Chunk Configuration</div>
          <button class="btn" id="btn-run-chunking">⚡ Generate Chunks</button>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Chunk Size (chars): <span id="label-chunk-size">500</span></label>
            <div style="display: flex; align-items: center; gap: 8px;">
              <input type="range" id="slider-chunk-size" min="50" max="3000" step="50" value="500">
              <input type="number" id="input-chunk-size" min="10" max="10000" value="500" style="width: 70px;">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Chunk Overlap (chars): <span id="label-chunk-overlap">50</span></label>
            <div style="display: flex; align-items: center; gap: 8px;">
              <input type="range" id="slider-chunk-overlap" min="0" max="500" step="10" value="50">
              <input type="number" id="input-chunk-overlap" min="0" max="5000" value="50" style="width: 70px;">
            </div>
          </div>

          <div class="form-group" style="flex: 1; min-width: 200px;">
            <label class="form-label">Active Document</label>
            <div id="chunking-doc-name" style="font-weight: 600; padding: 6px 0;">No document loaded yet</div>
          </div>
        </div>

        <div id="chunk-config-error" style="display: none;" class="warning-box error"></div>
      </div>

      <!-- Chunk Results Card -->
      <div class="card" id="chunk-results-card" style="display: none;">
        <div class="card-header">
          <div class="card-title">📊 Chunk Set Statistics</div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary" id="btn-copy-all-chunks">📋 Copy All Chunks</button>
            <button class="btn btn-secondary" id="btn-export-chunks-json">💾 Export JSON</button>
          </div>
        </div>

        <div id="chunk-warnings-container"></div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <span class="kpi-label">Total Chunks</span>
            <span class="kpi-value" id="kpi-total-chunks">0</span>
            <span class="kpi-note">Created segments</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Avg Characters</span>
            <span class="kpi-value" id="kpi-avg-chars">0</span>
            <span class="kpi-note" id="kpi-min-max-chars">Min: 0 | Max: 0</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Avg Est. Tokens</span>
            <span class="kpi-value" id="kpi-avg-tokens">~0</span>
            <span class="kpi-note" id="kpi-min-max-tokens">Min: 0 | Max: 0</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Avg Words</span>
            <span class="kpi-value" id="kpi-avg-words">0</span>
            <span class="kpi-note" id="kpi-min-max-words">Min: 0 | Max: 0</span>
          </div>
        </div>

        <!-- Chunk Visualizer / Navigator -->
        <div class="chunk-preview-box">
          <div class="chunk-preview-header">
            <div style="display: flex; align-items: center; gap: 10px;">
              <button class="btn btn-secondary" id="btn-prev-chunk" disabled>◀ Prev</button>
              <span>Chunk <input type="number" id="input-chunk-jump" value="1" min="1" max="1" style="width: 50px; text-align: center;"> of <span id="label-total-chunks-nav">1</span></span>
              <button class="btn btn-secondary" id="btn-next-chunk">Next ▶</button>
            </div>

            <div class="chunk-badges">
              <span class="badge-pill" id="badge-current-chars">0 chars</span>
              <span class="badge-pill" id="badge-current-words">0 words</span>
              <span class="badge-pill" id="badge-current-tokens">~0 tokens</span>
              <span class="badge-pill" id="badge-current-offsets">Offsets: 0 → 0</span>
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              <input type="text" id="input-chunk-search" placeholder="Filter/Search chunks..." style="width: 170px;">
              <span id="search-matches-pill" style="font-size: 11px; color: var(--vscode-descriptionForeground);"></span>
              <button class="btn" id="btn-copy-current-chunk">📋 Copy</button>
            </div>
          </div>

          <div class="chunk-body" id="chunk-content-view">
            No chunk selected.
          </div>
        </div>
      </div>

      <div class="empty-state" id="chunk-empty-state">
        <div class="empty-icon">🔪</div>
        <div style="font-weight: 600;">No chunks generated yet</div>
        <div style="max-width: 400px; font-size: 12px;">Load a document from the Document Inspector tab or paste text above, then click <strong>Generate Chunks</strong>.</div>
      </div>
    </div>

    <!-- TAB 3: Workspace Scanner -->
    <div class="tab-panel" id="tab-workspace">
      <div class="card">
        <div class="card-header">
          <div class="card-title">🔍 RAG Technology Scanner</div>
          <button class="btn" id="btn-scan-workspace">🔄 Scan Workspace</button>
        </div>
        <div style="color: var(--vscode-descriptionForeground); font-size: 12px;">
          RAGLaB scans your project configuration (<code>requirements.txt</code>, <code>package.json</code>, <code>pyproject.toml</code>) and workspace directory structure to detect vector databases, embedding engines, orchestration frameworks, and storage.
        </div>
      </div>

      <!-- Workspace Scan Results Card -->
      <div class="card" id="workspace-results-card" style="display: none;">
        <div class="card-header">
          <div>
            <div style="font-size: 16px; font-weight: 700;" id="ws-project-name">Project Name</div>
            <div style="font-size: 11px; color: var(--vscode-descriptionForeground);" id="ws-root-path">Path</div>
          </div>
          <span class="status-pill yes" id="ws-rag-status">🟢 RAG Stack Active</span>
        </div>

        <div class="card-title">Detected Technologies &amp; Dependencies</div>
        <div class="tech-grid" id="ws-tech-grid"></div>

        <div class="card-title" style="margin-top: 8px;">RAG-Related Directories</div>
        <div class="dir-chips" id="ws-dir-chips"></div>
      </div>

      <div class="empty-state" id="workspace-empty-state">
        <div class="empty-icon">📁</div>
        <div style="font-weight: 600;">Workspace not scanned yet</div>
        <div style="font-size: 12px;">Click <strong>Scan Workspace</strong> to analyze your project dependencies and RAG structure.</div>
      </div>
    </div>

    <!-- TAB 4: Guidelines & Flow -->
    <div class="tab-panel" id="tab-guidelines">
      <div class="card">
        <div class="card-header">
          <div class="card-title">📖 The Standard RAG Pipeline Architecture</div>
          <button class="btn" id="btn-open-guidelines-file">📄 Open Full GUIDELINES.md</button>
        </div>

        <div class="diagram-box">
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    Documents    │  ───▶ │ Text Extraction │  ───▶ │ Smart Chunking  │
│ (.md, .txt,...) │       │  (Clean Text)   │       │ (Size & Overlap)│
└─────────────────┘       └─────────────────┘       └─────────────────┘
                                                             │
                                                             ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   LLM Context   │  ◀─── │ Similarity Top-K│  ◀─── │ Vector Database │
│ (Augmented Gen) │       │   (Retrieval)   │       │ (pgvector, etc.)│
└─────────────────┘       └─────────────────┘       └─────────────────┘
        </div>

        <div class="card-title">Chunk Size Decision Matrix</div>
        <div class="kpi-grid">
          <div class="kpi-card">
            <span class="kpi-label">Small Chunks</span>
            <span class="kpi-value" style="font-size: 14px;">100 - 300 Chars</span>
            <span class="kpi-note">Best for exact fact lookups, strict sentence retrieval, low noise.</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Medium Chunks (Recommended)</span>
            <span class="kpi-value" style="font-size: 14px;">500 - 1000 Chars</span>
            <span class="kpi-note">Optimal for general RAG, balance between context and embedding specificity.</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Large Chunks</span>
            <span class="kpi-value" style="font-size: 14px;">1200 - 2500 Chars</span>
            <span class="kpi-note">Best for complex reasoning or summaries, but risks context dilution.</span>
          </div>
        </div>

        <div class="warning-box info">
          💡 <strong>Chunk Overlap Rule of Thumb:</strong> Use 10% to 20% overlap (e.g. 50 characters for a 500-character chunk). This prevents sentence boundaries or thoughts from being abruptly severed at chunk cutoffs.
        </div>
      </div>
    </div>
  </div>

  <script nonce="${nonce}">
    var vscode = acquireVsCodeApi();
    var initialState = ${stateJson};

    // State Variables
    var currentText = '';
    var currentFileName = 'document.txt';
    var currentChunks = [];
    var currentChunkIndex = 0;
    var searchQuery = '';

    // Elements
    var tabButtons = document.querySelectorAll('.tab-button');
    var tabPanels = document.querySelectorAll('.tab-panel');

    // Document Inspector Elements
    var btnPickFile = document.getElementById('btn-pick-file');
    var btnLoadActive = document.getElementById('btn-load-active-editor');
    var docTextInput = document.getElementById('doc-text-input');
    var btnAnalyzeText = document.getElementById('btn-analyze-custom-text');
    var btnSendToChunking = document.getElementById('btn-send-to-chunking');
    var docAnalysisCard = document.getElementById('doc-analysis-card');
    var docFileName = document.getElementById('doc-file-name');
    var docFileType = document.getElementById('doc-file-type');
    var docFileSize = document.getElementById('doc-file-size');
    var docWarnings = document.getElementById('doc-warnings-container');
    var kpiChars = document.getElementById('kpi-chars');
    var kpiWords = document.getElementById('kpi-words');
    var kpiTokens = document.getElementById('kpi-tokens');
    var kpiLines = document.getElementById('kpi-lines');
    var kpiEmptyLines = document.getElementById('kpi-empty-lines');
    var kpiAvgWordsLine = document.getElementById('kpi-avg-words-line');

    // Chunking Studio Elements
    var sliderChunkSize = document.getElementById('slider-chunk-size');
    var inputChunkSize = document.getElementById('input-chunk-size');
    var labelChunkSize = document.getElementById('label-chunk-size');
    var sliderChunkOverlap = document.getElementById('slider-chunk-overlap');
    var inputChunkOverlap = document.getElementById('input-chunk-overlap');
    var labelChunkOverlap = document.getElementById('label-chunk-overlap');
    var chunkingDocName = document.getElementById('chunking-doc-name');
    var chunkConfigError = document.getElementById('chunk-config-error');
    var btnRunChunking = document.getElementById('btn-run-chunking');
    var chunkResultsCard = document.getElementById('chunk-results-card');
    var chunkEmptyState = document.getElementById('chunk-empty-state');
    var chunkWarnings = document.getElementById('chunk-warnings-container');

    // Chunk Stats
    var kpiTotalChunks = document.getElementById('kpi-total-chunks');
    var kpiAvgChars = document.getElementById('kpi-avg-chars');
    var kpiMinMaxChars = document.getElementById('kpi-min-max-chars');
    var kpiAvgTokens = document.getElementById('kpi-avg-tokens');
    var kpiMinMaxTokens = document.getElementById('kpi-min-max-tokens');
    var kpiAvgWords = document.getElementById('kpi-avg-words');
    var kpiMinMaxWords = document.getElementById('kpi-min-max-words');

    // Chunk Viewer Navigation
    var btnPrevChunk = document.getElementById('btn-prev-chunk');
    var btnNextChunk = document.getElementById('btn-next-chunk');
    var inputChunkJump = document.getElementById('input-chunk-jump');
    var labelTotalChunksNav = document.getElementById('label-total-chunks-nav');
    var badgeCurrentChars = document.getElementById('badge-current-chars');
    var badgeCurrentWords = document.getElementById('badge-current-words');
    var badgeCurrentTokens = document.getElementById('badge-current-tokens');
    var badgeCurrentOffsets = document.getElementById('badge-current-offsets');
    var inputChunkSearch = document.getElementById('input-chunk-search');
    var searchMatchesPill = document.getElementById('search-matches-pill');
    var chunkContentView = document.getElementById('chunk-content-view');
    var btnCopyCurrentChunk = document.getElementById('btn-copy-current-chunk');
    var btnCopyAllChunks = document.getElementById('btn-copy-all-chunks');
    var btnExportChunksJson = document.getElementById('btn-export-chunks-json');

    // Workspace Elements
    var btnScanWorkspace = document.getElementById('btn-scan-workspace');
    var wsResultsCard = document.getElementById('workspace-results-card');
    var wsEmptyState = document.getElementById('workspace-empty-state');
    var wsProjectName = document.getElementById('ws-project-name');
    var wsRootPath = document.getElementById('ws-root-path');
    var wsRagStatus = document.getElementById('ws-rag-status');
    var wsTechGrid = document.getElementById('ws-tech-grid');
    var wsDirChips = document.getElementById('ws-dir-chips');

    // Guidelines
    var btnOpenGuidelinesFile = document.getElementById('btn-open-guidelines-file');
    var btnOpenGuideHeader = document.getElementById('btn-open-guide-header');

    // Helper functions
    function switchTab(tabId) {
      tabButtons.forEach(function(btn) {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
      });
      tabPanels.forEach(function(panel) {
        panel.classList.toggle('active', panel.id === 'tab-' + tabId);
      });
    }

    tabButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        switchTab(btn.getAttribute('data-tab'));
      });
    });

    function escapeHtmlClient(str) {
      return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    // Sync Slider and Number inputs
    function syncSize(val) {
      var num = parseInt(val, 10) || 500;
      sliderChunkSize.value = num;
      inputChunkSize.value = num;
      labelChunkSize.textContent = num;
      validateChunkInputs();
    }

    function syncOverlap(val) {
      var num = parseInt(val, 10) || 0;
      sliderChunkOverlap.value = num;
      inputChunkOverlap.value = num;
      labelChunkOverlap.textContent = num;
      validateChunkInputs();
    }

    function validateChunkInputs() {
      var size = parseInt(inputChunkSize.value, 10);
      var overlap = parseInt(inputChunkOverlap.value, 10);
      if (size <= 0) {
        chunkConfigError.textContent = '❌ Chunk size must be greater than 0.';
        chunkConfigError.style.display = 'block';
        return false;
      }
      if (overlap < 0) {
        chunkConfigError.textContent = '❌ Overlap cannot be negative.';
        chunkConfigError.style.display = 'block';
        return false;
      }
      if (overlap >= size) {
        chunkConfigError.textContent = '❌ Overlap (' + overlap + ') must be strictly less than chunk size (' + size + ').';
        chunkConfigError.style.display = 'block';
        return false;
      }
      chunkConfigError.style.display = 'none';
      return true;
    }

    sliderChunkSize.addEventListener('input', function(e) { syncSize(e.target.value); });
    inputChunkSize.addEventListener('input', function(e) { syncSize(e.target.value); });
    sliderChunkOverlap.addEventListener('input', function(e) { syncOverlap(e.target.value); });
    inputChunkOverlap.addEventListener('input', function(e) { syncOverlap(e.target.value); });

    // Document Inspector Actions
    btnPickFile.addEventListener('click', function() {
      vscode.postMessage({ command: 'requestSelectFile' });
    });

    btnLoadActive.addEventListener('click', function() {
      vscode.postMessage({ command: 'requestLoadActiveEditor' });
    });

    btnAnalyzeText.addEventListener('click', function() {
      var text = docTextInput.value;
      if (!text.trim()) {
        vscode.postMessage({ command: 'showWarning', text: 'Please enter or paste text to analyze.' });
        return;
      }
      vscode.postMessage({ command: 'requestAnalyzeText', text: text, fileName: currentFileName || 'scratchpad.txt' });
    });

    docTextInput.addEventListener('input', function() {
      currentText = docTextInput.value;
      btnSendToChunking.disabled = !currentText.trim();
    });

    btnSendToChunking.addEventListener('click', function() {
      currentText = docTextInput.value;
      chunkingDocName.textContent = currentFileName + ' (' + (currentText.length.toLocaleString()) + ' chars)';
      switchTab('chunking');
    });

    // Chunking Actions
    btnRunChunking.addEventListener('click', function() {
      if (!validateChunkInputs()) return;
      var text = currentText || docTextInput.value;
      if (!text || !text.trim()) {
        vscode.postMessage({ command: 'showWarning', text: 'No document text to chunk. Load a file or enter text first.' });
        return;
      }
      var size = parseInt(inputChunkSize.value, 10);
      var overlap = parseInt(inputChunkOverlap.value, 10);
      vscode.postMessage({
        command: 'requestChunking',
        text: text,
        fileName: currentFileName,
        chunkSize: size,
        overlap: overlap
      });
    });

    // Chunk Viewer Navigation
    function renderCurrentChunk() {
      if (!currentChunks || currentChunks.length === 0) {
        chunkContentView.textContent = 'No chunks available.';
        return;
      }

      var chunk = currentChunks[currentChunkIndex];
      inputChunkJump.value = currentChunkIndex + 1;
      badgeCurrentChars.textContent = chunk.characterCount.toLocaleString() + ' chars';
      badgeCurrentWords.textContent = chunk.wordCount.toLocaleString() + ' words';
      badgeCurrentTokens.textContent = '~' + chunk.estimatedTokenCount.toLocaleString() + ' tokens';
      badgeCurrentOffsets.textContent = 'Offsets: ' + chunk.startOffset + ' → ' + chunk.endOffset;

      btnPrevChunk.disabled = (currentChunkIndex === 0);
      btnNextChunk.disabled = (currentChunkIndex === currentChunks.length - 1);

      // Search highlight
      if (searchQuery) {
        var escapedText = escapeHtmlClient(chunk.content);
        var escapedQuery = escapeHtmlClient(searchQuery);
        var regex = new RegExp(escapedQuery.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'), 'gi');
        chunkContentView.innerHTML = escapedText.replace(regex, function(m) { return '<mark>' + m + '</mark>'; });
      } else {
        chunkContentView.textContent = chunk.content;
      }
    }

    btnPrevChunk.addEventListener('click', function() {
      if (currentChunkIndex > 0) {
        currentChunkIndex--;
        renderCurrentChunk();
      }
    });

    btnNextChunk.addEventListener('click', function() {
      if (currentChunkIndex < currentChunks.length - 1) {
        currentChunkIndex++;
        renderCurrentChunk();
      }
    });

    inputChunkJump.addEventListener('change', function(e) {
      var val = parseInt(e.target.value, 10) - 1;
      if (val >= 0 && val < currentChunks.length) {
        currentChunkIndex = val;
        renderCurrentChunk();
      } else {
        e.target.value = currentChunkIndex + 1;
      }
    });

    inputChunkSearch.addEventListener('input', function() {
      searchQuery = inputChunkSearch.value.trim();
      if (searchQuery) {
        var matches = currentChunks.filter(function(c) {
          return c.content.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1;
        });
        searchMatchesPill.textContent = matches.length + ' / ' + currentChunks.length + ' match';
        if (matches.length > 0 && currentChunks[currentChunkIndex].content.toLowerCase().indexOf(searchQuery.toLowerCase()) === -1) {
          currentChunkIndex = matches[0].index;
        }
      } else {
        searchMatchesPill.textContent = '';
      }
      renderCurrentChunk();
    });

    btnCopyCurrentChunk.addEventListener('click', function() {
      if (!currentChunks || currentChunks.length === 0) return;
      var chunk = currentChunks[currentChunkIndex];
      vscode.postMessage({ command: 'copy', text: chunk.content, label: 'Chunk #' + (chunk.index + 1) });
    });

    btnCopyAllChunks.addEventListener('click', function() {
      if (!currentChunks || currentChunks.length === 0) return;
      var allText = currentChunks.map(function(c) {
        return '--- Chunk #' + (c.index + 1) + ' (' + c.characterCount + ' chars, ~' + c.estimatedTokenCount + ' tokens) ---\\n' + c.content;
      }).join('\\n\\n');
      vscode.postMessage({ command: 'copy', text: allText, label: 'All ' + currentChunks.length + ' Chunks' });
    });

    btnExportChunksJson.addEventListener('click', function() {
      if (!currentChunks || currentChunks.length === 0) return;
      var jsonStr = JSON.stringify(currentChunks, null, 2);
      vscode.postMessage({ command: 'copy', text: jsonStr, label: 'Chunks JSON' });
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft' && currentChunkIndex > 0) {
        currentChunkIndex--;
        renderCurrentChunk();
      } else if (e.key === 'ArrowRight' && currentChunkIndex < currentChunks.length - 1) {
        currentChunkIndex++;
        renderCurrentChunk();
      }
    });

    // Workspace Scanner Actions
    btnScanWorkspace.addEventListener('click', function() {
      vscode.postMessage({ command: 'requestWorkspaceScan' });
    });

    // Guidelines Buttons
    function openGuidelines() {
      vscode.postMessage({ command: 'openGuidelines' });
    }
    btnOpenGuidelinesFile.addEventListener('click', openGuidelines);
    btnOpenGuideHeader.addEventListener('click', openGuidelines);

    // Apply Document Analysis
    function applyDocumentAnalysis(analysis) {
      if (!analysis) return;
      currentText = analysis.content || '';
      currentFileName = analysis.fileName;
      docTextInput.value = currentText;
      btnSendToChunking.disabled = !currentText.trim();

      docFileName.textContent = analysis.fileName;
      docFileType.textContent = analysis.fileType;
      docFileSize.textContent = analysis.fileSizeFormatted;

      kpiChars.textContent = analysis.characterCount.toLocaleString();
      kpiWords.textContent = analysis.wordCount.toLocaleString();
      kpiTokens.textContent = '~' + analysis.estimatedTokenCount.toLocaleString();
      kpiLines.textContent = analysis.lineCount.toLocaleString();
      kpiEmptyLines.textContent = analysis.emptyLineCount + ' empty lines';
      kpiAvgWordsLine.textContent = analysis.averageWordsPerLine.toFixed(2);

      // Warnings
      docWarnings.innerHTML = '';
      if (analysis.lineCount > 0 && (analysis.emptyLineCount / analysis.lineCount) > 0.3) {
        var warnDiv = document.createElement('div');
        warnDiv.className = 'warning-box warning';
        warnDiv.innerHTML = '⚠️ Document has a high ratio of empty lines (' + Math.round((analysis.emptyLineCount / analysis.lineCount) * 100) + '%). Consider cleaning text before chunking.';
        docWarnings.appendChild(warnDiv);
      }

      chunkingDocName.textContent = analysis.fileName + ' (' + analysis.characterCount.toLocaleString() + ' chars)';
      docAnalysisCard.style.display = 'flex';
    }

    // Apply Chunk Results
    function applyChunkResults(chunkResult, stats) {
      if (!chunkResult) return;
      currentChunks = chunkResult.chunks || [];
      currentChunkIndex = 0;

      kpiTotalChunks.textContent = stats.totalChunks.toLocaleString();
      kpiAvgChars.textContent = Math.round(stats.averageCharacters).toLocaleString();
      kpiMinMaxChars.textContent = 'Min: ' + stats.minCharacters.toLocaleString() + ' | Max: ' + stats.maxCharacters.toLocaleString();

      kpiAvgTokens.textContent = '~' + Math.round(stats.averageEstimatedTokens).toLocaleString();
      kpiMinMaxTokens.textContent = 'Min: ' + stats.minEstimatedTokens.toLocaleString() + ' | Max: ' + stats.maxEstimatedTokens.toLocaleString();

      kpiAvgWords.textContent = Math.round(stats.averageWords).toLocaleString();
      kpiMinMaxWords.textContent = 'Min: ' + stats.minWords.toLocaleString() + ' | Max: ' + stats.maxWords.toLocaleString();

      labelTotalChunksNav.textContent = stats.totalChunks;
      inputChunkJump.max = stats.totalChunks;

      // Warnings
      chunkWarnings.innerHTML = '';
      if (chunkResult.warnings && chunkResult.warnings.length > 0) {
        chunkResult.warnings.forEach(function(w) {
          var box = document.createElement('div');
          box.className = 'warning-box ' + (w.severity || 'info');
          box.textContent = (w.severity === 'error' ? '❌ ' : '⚠️ ') + w.message;
          chunkWarnings.appendChild(box);
        });
      }

      chunkEmptyState.style.display = 'none';
      chunkResultsCard.style.display = 'flex';
      renderCurrentChunk();
    }

    // Apply Workspace Analysis
    function applyWorkspaceAnalysis(ws) {
      if (!ws) return;
      wsProjectName.textContent = ws.projectName;
      wsRootPath.textContent = ws.rootPath;

      if (ws.isLikelyRagProject) {
        wsRagStatus.className = 'status-pill yes';
        wsRagStatus.textContent = '🟢 RAG Stack Active';
      } else {
        wsRagStatus.className = 'status-pill no';
        wsRagStatus.textContent = '⚪ Standard Project';
      }

      wsTechGrid.innerHTML = '';
      ws.technologies.forEach(function(t) {
        var card = document.createElement('div');
        card.className = 'tech-card' + (t.detected ? ' detected' : '');

        var info = document.createElement('div');
        info.className = 'tech-info';

        var name = document.createElement('span');
        name.className = 'tech-name';
        name.textContent = t.name;

        var cat = document.createElement('span');
        cat.className = 'tech-category';
        cat.textContent = t.category + (t.source ? ' • ' + t.source : '');

        info.appendChild(name);
        info.appendChild(cat);

        var pill = document.createElement('span');
        pill.className = 'status-pill ' + (t.detected ? 'yes' : 'no');
        pill.textContent = t.detected ? '✓ Detected' : '○ Not found';

        card.appendChild(info);
        card.appendChild(pill);
        wsTechGrid.appendChild(card);
      });

      wsDirChips.innerHTML = '';
      if (!ws.ragDirectories || ws.ragDirectories.length === 0) {
        wsDirChips.innerHTML = '<span style="font-size: 12px; color: var(--vscode-descriptionForeground);">No standard RAG directory names detected in root.</span>';
      } else {
        ws.ragDirectories.forEach(function(d) {
          var chip = document.createElement('span');
          chip.className = 'dir-chip';
          chip.textContent = '📁 ' + d.name + '/';
          chip.title = d.purpose;
          wsDirChips.appendChild(chip);
        });
      }

      wsEmptyState.style.display = 'none';
      wsResultsCard.style.display = 'flex';
    }

    // Message listener from extension host
    window.addEventListener('message', function(event) {
      var msg = event.data;
      switch (msg.type) {
        case 'documentAnalyzed':
          applyDocumentAnalysis(msg.payload);
          switchTab('document');
          break;
        case 'chunkingCompleted':
          applyChunkResults(msg.payload.chunkResult, msg.payload.statistics);
          switchTab('chunking');
          break;
        case 'workspaceScanned':
          applyWorkspaceAnalysis(msg.payload);
          switchTab('workspace');
          break;
        case 'switchTab':
          switchTab(msg.tab);
          break;
      }
    });

    // Initialize with state
    if (initialState) {
      if (initialState.defaultChunkSize) syncSize(initialState.defaultChunkSize);
      if (initialState.defaultChunkOverlap) syncOverlap(initialState.defaultChunkOverlap);
      if (initialState.documentAnalysis) applyDocumentAnalysis(initialState.documentAnalysis);
      if (initialState.chunkResult && initialState.chunkStatistics) {
        applyChunkResults(initialState.chunkResult, initialState.chunkStatistics);
      }
      if (initialState.workspaceAnalysis) applyWorkspaceAnalysis(initialState.workspaceAnalysis);
      if (initialState.activeTab) switchTab(initialState.activeTab);
    }
  </script>
</body>
</html>`;
}
