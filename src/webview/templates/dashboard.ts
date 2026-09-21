import { DocumentAnalysis, ChunkResult, ChunkStatistics, WorkspaceAnalysis } from '../../models/types';

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
  initialState?: DashboardInitialState,
  logoUri?: string
): string {
  const stateJson = JSON.stringify(initialState || {});
  const logoTag = logoUri
    ? `<img src="${logoUri}" alt="RAGLaB" class="brand-logo-img" />`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'nonce-${nonce}'; script-src 'nonce-${nonce}'; img-src ${cspSource} data:;">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RAGLaB Studio</title>
  <style nonce="${nonce}">
    :root {
      --card-bg: var(--vscode-editor-background);
      --border-color: var(--vscode-panel-border, rgba(128, 128, 128, 0.22));
      --header-bg: rgba(128, 128, 128, 0.06);
      --accent-color: var(--vscode-button-background, #0e639c);
      --accent-hover: var(--vscode-button-hoverBackground, #1177bb);
      --success-color: #388a34;
      --warning-color: #cca700;
      --error-color: #f48771;
      --card-radius: 8px;
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

    /* Brand Header */
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
      gap: 12px;
    }

    .brand-logo-img {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      object-fit: cover;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
    }

    .brand-logo-img:hover {
      transform: scale(1.06) rotate(-2deg);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
    }

    .brand-text-group {
      display: flex;
      flex-direction: column;
    }

    .brand-title h1 {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: var(--vscode-editor-foreground);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-badge {
      background: var(--vscode-badge-background, #4d4d4d);
      color: var(--vscode-badge-foreground, #ffffff);
      font-size: 10px;
      padding: 2px 7px;
      border-radius: 10px;
      font-weight: 600;
      letter-spacing: 0.3px;
      transition: transform 0.2s ease;
    }
    .brand-badge:hover {
      transform: scale(1.05);
    }

    .brand-subtitle {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
    }

    /* Navigation Tabs */
    .tab-bar {
      display: flex;
      gap: 4px;
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
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .tab-button:hover {
      color: var(--vscode-editor-foreground);
      background: rgba(128, 128, 128, 0.08);
      border-radius: 4px 4px 0 0;
    }

    .tab-button.active {
      color: var(--vscode-editor-foreground);
      border-bottom-color: var(--vscode-activityBar-activeBorder, var(--accent-color));
      font-weight: 600;
    }

    /* Tab Content Area */
    .tab-container {
      flex: 1;
      overflow-y: auto;
      padding-right: 4px;
    }

    .tab-panel {
      display: none;
      flex-direction: column;
      gap: 16px;
    }

    .tab-panel.active {
      display: flex;
      animation: tabSlideUp 0.24s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes tabSlideUp {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Common Card Styles */
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--card-radius);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
      transition: border-color 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s ease;
    }

    .card:hover {
      border-color: rgba(14, 99, 156, 0.45);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
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
      justify-content: center;
      gap: 6px;
      transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn:hover {
      background-color: var(--vscode-button-hoverBackground);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .btn:active {
      transform: translateY(0) scale(0.98);
      box-shadow: none;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .btn-secondary {
      background-color: var(--vscode-button-secondaryBackground, rgba(128, 128, 128, 0.16));
      color: var(--vscode-button-secondaryForeground, var(--vscode-editor-foreground));
    }

    .btn-secondary:hover {
      background-color: var(--vscode-button-secondaryHoverBackground, rgba(128, 128, 128, 0.26));
    }

    .btn-copied {
      background-color: var(--success-color, #388a34) !important;
      color: #ffffff !important;
      animation: copyPop 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes copyPop {
      0% { transform: scale(0.95); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
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
      border-radius: 6px;
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      border-color: rgba(14, 99, 156, 0.5);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

    .kpi-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--accent-color);
      opacity: 0.4;
      transition: opacity 0.2s ease;
    }
    .kpi-card:hover::before {
      opacity: 1;
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
      transition: border-color 0.15s ease;
    }

    input[type="number"]:focus, input[type="text"]:focus, textarea:focus {
      outline: none;
      border-color: var(--vscode-focusBorder, var(--accent-color));
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

    /* Strategy & Parent-Child Controls */
    .btn-toggle-group {
      display: inline-flex;
      background: rgba(128, 128, 128, 0.12);
      border-radius: 4px;
      padding: 2px;
      gap: 2px;
      align-items: center;
    }

    .btn-toggle-group .btn {
      padding: 3px 8px;
      font-size: 11px;
      border-radius: 3px;
      background: transparent;
      color: var(--vscode-descriptionForeground);
      box-shadow: none;
      transform: none;
    }

    .btn-toggle-group .btn.active {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .badge-breadcrumb {
      background: rgba(117, 190, 255, 0.12);
      color: #75beff;
      border: 1px solid rgba(117, 190, 255, 0.25);
      max-width: 280px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .badge-atomic {
      background: rgba(115, 201, 145, 0.14);
      color: #73c991;
      border: 1px solid rgba(115, 201, 145, 0.3);
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
      animation: tabSlideUp 0.2s ease;
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

    /* Drop Zone */
    .drop-zone {
      border: 2px dashed var(--border-color);
      border-radius: 6px;
      padding: 18px 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: rgba(128, 128, 128, 0.03);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
    }
    .drop-zone:hover, .drop-zone.drag-active {
      border-color: var(--accent-color);
      background: rgba(14, 99, 156, 0.08);
      transform: scale(1.005);
    }
    .drop-zone.drag-active {
      border-style: solid;
      box-shadow: 0 0 12px rgba(14, 99, 156, 0.25);
    }
    .drop-icon {
      color: var(--accent-color);
      opacity: 0.85;
      transition: transform 0.2s ease;
    }
    .drop-zone:hover .drop-icon {
      transform: translateY(-2px);
    }
    .drop-label {
      font-size: 12.5px;
      font-weight: 600;
      color: var(--vscode-editor-foreground);
    }
    .drop-hint {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
    }

    /* Chunk Minimap Strip */
    .chunk-minimap-container {
      display: flex;
      flex-direction: column;
      gap: 5px;
      background: var(--header-bg);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 2px;
    }
    .chunk-minimap-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--vscode-descriptionForeground);
      font-weight: 600;
    }
    .chunk-minimap-track {
      display: flex;
      gap: 3px;
      overflow-x: auto;
      padding: 3px 1px;
      height: 22px;
      align-items: center;
      border-radius: 3px;
      scrollbar-width: thin;
    }
    .minimap-seg {
      flex: 1;
      min-width: 8px;
      max-width: 24px;
      height: 12px;
      background: rgba(128, 128, 128, 0.25);
      border-radius: 2px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .minimap-seg:hover {
      background: var(--accent-hover);
      transform: scaleY(1.35);
    }
    .minimap-seg.active {
      background: var(--accent-color);
      transform: scaleY(1.5);
      box-shadow: 0 0 6px var(--accent-color);
    }
    .minimap-seg.atomic {
      border-top: 2px solid #73c991;
    }

    /* Chunk Visualizer */
    .chunk-preview-box {
      border: 1px solid var(--border-color);
      border-radius: 6px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: var(--vscode-editor-background);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
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

    .chunk-util-bar-container {
      height: 4px;
      width: 100%;
      background: rgba(128, 128, 128, 0.15);
      overflow: hidden;
    }

    .chunk-util-bar {
      height: 100%;
      background: var(--accent-color);
      transition: width 0.35s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.3s ease;
    }

    .chunk-badges {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .badge-pill {
      background: var(--vscode-badge-background, rgba(128,128,128,0.2));
      color: var(--vscode-badge-foreground, inherit);
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: 500;
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

    .chunk-fade-in {
      animation: chunkFade 0.16s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes chunkFade {
      from { opacity: 0.3; transform: translateY(3px); }
      to { opacity: 1; transform: translateY(0); }
    }

    mark {
      background-color: rgba(255, 220, 0, 0.35);
      color: inherit;
      border-radius: 2px;
      padding: 0 2px;
    }

    /* Headroom Dual-Progress Gauge */
    .headroom-gauge-container {
      background: var(--header-bg);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 6px;
    }
    .headroom-gauge-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .headroom-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--vscode-descriptionForeground);
    }
    .headroom-bars {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .headroom-bar-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .headroom-bar-label {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--vscode-editor-foreground);
    }
    .headroom-progress-track {
      height: 6px;
      background: rgba(128, 128, 128, 0.18);
      border-radius: 3px;
      overflow: hidden;
    }
    .headroom-progress-fill {
      height: 100%;
      width: 0%;
      background: #73c991;
      border-radius: 3px;
      transition: width 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), background-color 0.3s ease;
    }

    /* Retrieval Simulator */
    .retrieval-card {
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 10px 14px;
      background: var(--header-bg);
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      animation: cascadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) backwards;
      transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes cascadeIn {
      from {
        opacity: 0;
        transform: translateY(8px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .retrieval-card:hover {
      border-color: var(--accent-color);
      background: rgba(14, 99, 156, 0.08);
      transform: translateX(4px);
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
      transition: all 0.18s ease;
    }

    .tech-card:hover {
      transform: translateY(-1px);
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

    .status-pill {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      display: inline-block;
    }

    .status-pill.yes {
      background: rgba(56, 138, 52, 0.2);
      color: #73c991;
    }
    .status-pill.yes .status-dot {
      background: #73c991;
      animation: pulseDot 1.8s infinite ease-in-out;
    }

    .status-pill.no {
      background: rgba(128, 128, 128, 0.15);
      color: var(--vscode-descriptionForeground);
    }
    .status-pill.no .status-dot {
      background: var(--vscode-descriptionForeground);
    }

    @keyframes pulseDot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
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

    .preset-btn {
      padding: 4px 10px;
      font-size: 11px;
    }

    .filter-btn {
      padding: 3px 10px;
      font-size: 11px;
      border-radius: 12px;
    }

    .filter-btn.active {
      background: var(--accent-color);
      color: var(--vscode-button-foreground);
    }
  </style>
</head>
<body>
  <!-- Brand Header -->
  <div class="brand-header">
    <div class="brand-title">
      ${logoTag}
      <div class="brand-text-group">
        <h1>RAGLaB Studio <span class="brand-badge">v0.1.0</span></h1>
        <span class="brand-subtitle">Interactive RAG Pipeline &amp; Chunking Workbench</span>
      </div>
    </div>
    <div style="display: flex; gap: 8px;">
      <button class="btn btn-secondary" id="btn-open-guide-header">Guidelines Handbook</button>
    </div>
  </div>

  <!-- Tab Bar -->
  <div class="tab-bar">
    <button class="tab-button active" data-tab="document">Document Inspector</button>
    <button class="tab-button" data-tab="chunking">Chunking Studio</button>
    <button class="tab-button" data-tab="workspace">Workspace Scanner</button>
    <button class="tab-button" data-tab="guidelines">Guidelines &amp; Flow</button>
  </div>

  <!-- Tab Content Area -->
  <div class="tab-container">
    <!-- TAB 1: Document Inspector -->
    <div class="tab-panel active" id="tab-document">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Document Source</div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn" id="btn-pick-file">Select File from Disk</button>
            <button class="btn btn-secondary" id="btn-load-active-editor">Load Active File</button>
            <button class="btn btn-secondary" id="btn-load-sample-doc">Load Sample Document</button>
          </div>
        </div>

        <div class="warning-box info" style="margin-bottom: 2px;">
          <strong>Supported Input Formats:</strong> RAGLaB profiles and partitions text-native documents: <strong>Markdown (.md)</strong>, <strong>Plain Text (.txt)</strong>, <strong>JSON (.json)</strong>, and <strong>CSV (.csv)</strong>. Supplying clean text ensures exact token boundary identification and preserves embedding fidelity.
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div class="drop-zone" id="doc-drop-zone" title="Click or drag text documents here">
            <svg class="drop-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="12" y2="12"></line>
              <line x1="15" y1="15" x2="12" y2="12"></line>
            </svg>
            <div class="drop-label">Drop Text Document Here to Profile &amp; Chunk</div>
            <div class="drop-hint">Accepts Markdown (.md), Plain Text (.txt), JSON (.json), and CSV (.csv)</div>
          </div>

          <div class="form-label">Or Paste Document Text Directly:</div>
          <textarea id="doc-text-input" placeholder="Paste document content here or drop a file above to inspect characters, words, and estimated tokens..."></textarea>
          <div style="display: flex; justify-content: flex-end; gap: 8px;">
            <button class="btn btn-secondary" id="btn-analyze-custom-text">Analyze Text</button>
            <button class="btn" id="btn-send-to-chunking" disabled>Send to Chunking Studio</button>
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
            <span class="kpi-note">Total character count</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Words</span>
            <span class="kpi-value" id="kpi-words">0</span>
            <span class="kpi-note">Whitespace split</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Estimated Tokens</span>
            <span class="kpi-value" id="kpi-tokens">~0</span>
            <span class="kpi-note">Heuristic: words * 1.3</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Total Lines</span>
            <span class="kpi-value" id="kpi-lines">0</span>
            <span class="kpi-note" id="kpi-empty-lines">0 empty lines</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Avg Words / Line</span>
            <span class="kpi-value" id="kpi-avg-words-line">0</span>
            <span class="kpi-note">Lexical density</span>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: Chunking Studio -->
    <div class="tab-panel" id="tab-chunking">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Chunk Configuration</div>
          <button class="btn" id="btn-run-chunking">Generate Chunks</button>
        </div>

        <div class="form-row" style="margin-bottom: 6px;">
          <div class="form-group" style="min-width: 290px;">
            <label class="form-label">Architecture Strategy</label>
            <select id="select-chunk-strategy" style="background: var(--vscode-dropdown-background, var(--vscode-input-background)); color: var(--vscode-dropdown-foreground, var(--vscode-input-foreground)); border: 1px solid var(--border-color); border-radius: 4px; padding: 6px 10px; font-size: 12px; cursor: pointer; width: 100%;">
              <option value="parent_document">Parent-Document (Small-to-Big) [Highest Accuracy]</option>
              <option value="markdown">Markdown &amp; Structural Hierarchy [AST Integrity]</option>
              <option value="boundary" selected>Recursive Boundary-Aware (Paragraphs &amp; Sentences)</option>
            </select>
          </div>

          <div class="form-group" id="group-parent-size" style="display: none; min-width: 220px;">
            <label class="form-label">Parent Context Size (chars): <span id="label-parent-size">1200</span></label>
            <div style="display: flex; align-items: center; gap: 8px;">
              <input type="range" id="slider-parent-size" min="600" max="4000" step="100" value="1200">
              <input type="number" id="input-parent-size" min="200" max="10000" value="1200" style="width: 70px;">
            </div>
          </div>

          <div id="strategy-explainer" style="font-size: 11.5px; color: var(--vscode-descriptionForeground); align-self: center; line-height: 1.4; flex: 1; min-width: 240px; background: rgba(128,128,128,0.06); padding: 8px 12px; border-radius: 4px; border-left: 3px solid var(--accent-color);">
            Recursive boundary-aware splitting across paragraphs, sentences, and words.
          </div>
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

        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span class="form-label">Quick Presets:</span>
          <button class="btn btn-secondary preset-btn" id="preset-small">Factoid (250 / 25)</button>
          <button class="btn btn-secondary preset-btn" id="preset-medium">Standard RAG (500 / 50)</button>
          <button class="btn btn-secondary preset-btn" id="preset-large">Deep Context (1000 / 100)</button>
        </div>

        <div id="chunk-config-error" style="display: none;" class="warning-box error"></div>
      </div>

      <!-- Chunk Results Card -->
      <div class="card" id="chunk-results-card" style="display: none;">
        <div class="card-header">
          <div class="card-title">Chunk Set Statistics</div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-secondary" id="btn-copy-all-chunks">Copy All Chunks</button>
            <button class="btn btn-secondary" id="btn-export-chunks-json">Copy JSON</button>
            <button class="btn" id="btn-save-chunks-file">Save to File (.json)</button>
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

        <!-- Chunk Minimap Strip -->
        <div class="chunk-minimap-container" id="chunk-minimap-container" title="Click any block to navigate directly">
          <div class="chunk-minimap-header">
            <span>Document Partition Minimap</span>
            <span id="label-minimap-info">0 Chunks</span>
          </div>
          <div class="chunk-minimap-track" id="chunk-minimap-track"></div>
        </div>

        <!-- Chunk Visualizer / Navigator -->
        <div class="chunk-preview-box">
          <div class="chunk-preview-header">
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <button class="btn btn-secondary" id="btn-prev-chunk" disabled>Previous</button>
              <span>Chunk <input type="number" id="input-chunk-jump" value="1" min="1" max="1" style="width: 50px; text-align: center;"> of <span id="label-total-chunks-nav">1</span></span>
              <button class="btn btn-secondary" id="btn-next-chunk">Next</button>

              <div class="btn-toggle-group" id="parent-child-toggle" style="display: none; margin-left: 6px;">
                <button class="btn active" id="btn-view-child">Child Search Unit</button>
                <button class="btn" id="btn-view-parent">Parent LLM Context</button>
              </div>
            </div>

            <div class="chunk-badges">
              <span class="badge-pill badge-breadcrumb" id="badge-breadcrumb" style="display: none;"></span>
              <span class="badge-pill badge-atomic" id="badge-atomic" style="display: none;"></span>
              <span class="badge-pill" id="badge-current-chars">0 chars</span>
              <span class="badge-pill" id="badge-current-words">0 words</span>
              <span class="badge-pill" id="badge-current-tokens">~0 tokens</span>
              <span class="badge-pill" id="badge-current-offsets">Offsets: 0 -> 0</span>
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              <input type="text" id="input-chunk-search" placeholder="Filter/Search chunks..." style="width: 170px;">
              <span id="search-matches-pill" style="font-size: 11px; color: var(--vscode-descriptionForeground);"></span>
              <button class="btn" id="btn-copy-current-chunk">Copy Chunk</button>
            </div>
          </div>

          <div class="chunk-util-bar-container">
            <div class="chunk-util-bar" id="chunk-util-bar" style="width: 0%;"></div>
          </div>

          <div class="chunk-body" id="chunk-content-view">
            No chunk selected.
          </div>

          <div id="chunk-overlap-notice" style="font-size: 11px; padding: 6px 12px; background: rgba(117,190,255,0.08); border-top: 1px solid var(--border-color); color: var(--vscode-descriptionForeground);">
            Context Continuity: Ready
          </div>
        </div>

        <!-- Local Retrieval Simulator Card -->
        <div class="card" id="retrieval-sim-card" style="margin-top: 8px;">
          <div class="card-header">
            <div class="card-title">Local Retrieval Simulator</div>
            <span class="badge-pill" id="badge-sim-status">Lexical Ranker Ready</span>
          </div>
          <div style="font-size: 12px; color: var(--vscode-descriptionForeground);">
            Test how your chunking configuration retrieves context against realistic user queries using local lexical relevance scoring.
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <input type="text" id="input-sim-query" placeholder="Enter query (e.g. 'How does vector chunking work?')..." style="flex: 1;">
            <button class="btn" id="btn-run-sim">Retrieve Top Chunks</button>
          </div>
          <div id="sim-results-container" style="display: flex; flex-direction: column; gap: 6px; margin-top: 4px;"></div>

          <!-- Dual-Tier Prompt Headroom Gauge -->
          <div class="headroom-gauge-container" id="headroom-gauge-container">
            <div class="headroom-gauge-header">
              <span class="headroom-title">LLM Prompt Headroom Consumption</span>
              <span class="badge-pill" id="badge-headroom">Top-K Load: 0 tokens</span>
            </div>
            <div class="headroom-bars">
              <div class="headroom-bar-group">
                <div class="headroom-bar-label"><span>4K Context Window (4,096 tokens)</span><span id="label-headroom-4k">0% (4,096 free)</span></div>
                <div class="headroom-progress-track">
                  <div class="headroom-progress-fill" id="fill-headroom-4k" style="width: 0%;"></div>
                </div>
              </div>
              <div class="headroom-bar-group">
                <div class="headroom-bar-label"><span>8K Context Window (8,192 tokens)</span><span id="label-headroom-8k">0% (8,192 free)</span></div>
                <div class="headroom-progress-track">
                  <div class="headroom-progress-fill" id="fill-headroom-8k" style="width: 0%;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" id="chunk-empty-state">
        <div style="font-weight: 600;">No chunks generated yet</div>
        <div style="max-width: 400px; font-size: 12px;">Load a document from the Document Inspector tab or click <strong>Load Sample Document</strong>, then click <strong>Generate Chunks</strong>.</div>
      </div>
    </div>

    <!-- TAB 3: Workspace Scanner -->
    <div class="tab-panel" id="tab-workspace">
      <div class="card">
        <div class="card-header">
          <div class="card-title">RAG Technology Scanner</div>
          <button class="btn" id="btn-scan-workspace">Scan Workspace</button>
        </div>
        <div style="color: var(--vscode-descriptionForeground); font-size: 12px;">
          RAGLaB scans your project configuration (<code>requirements.txt</code>, <code>package.json</code>, <code>pyproject.toml</code>) and directory layout to detect vector databases, embedding engines, orchestration frameworks, and storage.
        </div>
      </div>

      <!-- Workspace Scan Results Card -->
      <div class="card" id="workspace-results-card" style="display: none;">
        <div class="card-header">
          <div>
            <div style="font-size: 16px; font-weight: 700;" id="ws-project-name">Project Name</div>
            <div style="font-size: 11px; color: var(--vscode-descriptionForeground);" id="ws-root-path">Path</div>
          </div>
          <span class="status-pill yes" id="ws-rag-status"><span class="status-dot"></span> RAG Stack Detected</span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div class="card-title">Detected Technologies &amp; Dependencies</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button class="btn btn-secondary filter-btn active" data-filter="all">All</button>
            <button class="btn btn-secondary filter-btn" data-filter="vectordb">Vector DBs</button>
            <button class="btn btn-secondary filter-btn" data-filter="embedding">Embeddings</button>
            <button class="btn btn-secondary filter-btn" data-filter="orchestration">Orchestration</button>
            <button class="btn btn-secondary filter-btn" data-filter="framework">Frameworks</button>
            <button class="btn btn-secondary filter-btn" id="btn-copy-ws-report">Copy Report</button>
          </div>
        </div>

        <div class="tech-grid" id="ws-tech-grid"></div>

        <div class="card-title" style="margin-top: 8px;">RAG-Related Directories</div>
        <div class="dir-chips" id="ws-dir-chips"></div>
      </div>

      <div class="empty-state" id="workspace-empty-state">
        <div style="font-weight: 600;">Workspace not scanned yet</div>
        <div style="font-size: 12px;">Click <strong>Scan Workspace</strong> to analyze your project dependencies and RAG structure.</div>
      </div>
    </div>

    <!-- TAB 4: Guidelines & Flow -->
    <div class="tab-panel" id="tab-guidelines">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Standard RAG Pipeline Architecture</div>
          <button class="btn" id="btn-open-guidelines-file">Open GUIDELINES.md in Editor</button>
        </div>

        <div class="diagram-box">
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    Documents    │  ---> │ Text Extraction │  ---> │ Smart Chunking  │
│ (.md, .txt,...) │       │  (Clean Text)   │       │ (Size & Overlap)│
└─────────────────┘       └─────────────────┘       └─────────────────┘
                                                             │
                                                             v
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   LLM Context   │  <--- │ Similarity Top-K│  <--- │ Vector Database │
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
          [Notice] <strong>Chunk Overlap Rule of Thumb:</strong> Use 10% to 20% overlap (e.g. 50 characters for a 500-character chunk). This prevents sentence boundaries or thoughts from being abruptly severed at chunk cutoffs.
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
    var lastWorkspaceAnalysis = null;
    var activeTechFilter = 'all';

    // Sample Document Content
    var SAMPLE_RAG_DOCUMENT = '# Introduction to Retrieval-Augmented Generation (RAG)\\n\\nRetrieval-Augmented Generation (RAG) is an architecture that couples the natural language synthesis of Large Language Models (LLMs) with dynamic retrieval from an external knowledge store.\\n\\nInstead of relying exclusively on frozen model weights, a RAG system queries a specialized vector database like pgvector, Chroma, or FAISS to retrieve relevant factual excerpts matching a user inquiry.\\n\\n## Why Document Chunking Matters\\n\\nEnterprise documents, technical manuals, and API specifications are frequently thousands of tokens long. LLMs have limited context windows and can experience degraded recall when given broad, noisy text blocks.\\n\\nSmart chunking divides documents into atomic, semantically dense units. Preserving paragraph and sentence boundaries prevents concepts from being severed mid-thought.\\n\\n## Selecting Chunk Size and Overlap\\n\\nA standard chunk size of 500 to 1,000 characters paired with a 50 to 100 character overlap provides an effective balance between retrieval precision and conversational context. Sliding window overlap ensures entities spanning across chunk splits are retained in both retrieval units.\\n\\n## The Vector Search Pipeline\\n\\n1. Ingestion: Documents are extracted and cleaned.\\n2. Chunking: Text is split at logical boundaries.\\n3. Embedding: Text chunks are converted to vectors using embedding models.\\n4. Storage: High-dimensional vectors are indexed in vector databases.\\n5. Retrieval: Cosine similarity identifies the top-K relevant chunks for any query.';

    // Elements
    var tabButtons = document.querySelectorAll('.tab-button');
    var tabPanels = document.querySelectorAll('.tab-panel');

    // Document Inspector Elements
    var btnPickFile = document.getElementById('btn-pick-file');
    var btnLoadActive = document.getElementById('btn-load-active-editor');
    var btnLoadSample = document.getElementById('btn-load-sample-doc');
    var docTextInput = document.getElementById('doc-text-input');
    var docDropZone = document.getElementById('doc-drop-zone');
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
    var selectChunkStrategy = document.getElementById('select-chunk-strategy');
    var groupParentSize = document.getElementById('group-parent-size');
    var sliderParentSize = document.getElementById('slider-parent-size');
    var inputParentSize = document.getElementById('input-parent-size');
    var labelParentSize = document.getElementById('label-parent-size');
    var strategyExplainer = document.getElementById('strategy-explainer');
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
    var parentChildToggle = document.getElementById('parent-child-toggle');
    var btnViewChild = document.getElementById('btn-view-child');
    var btnViewParent = document.getElementById('btn-view-parent');
    var badgeBreadcrumb = document.getElementById('badge-breadcrumb');
    var badgeAtomic = document.getElementById('badge-atomic');
    var currentViewMode = 'child'; // 'child' or 'parent'
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
    var btnSaveChunksFile = document.getElementById('btn-save-chunks-file');
    var chunkUtilBar = document.getElementById('chunk-util-bar');
    var chunkOverlapNotice = document.getElementById('chunk-overlap-notice');
    var chunkMinimapContainer = document.getElementById('chunk-minimap-container');
    var chunkMinimapTrack = document.getElementById('chunk-minimap-track');
    var labelMinimapInfo = document.getElementById('label-minimap-info');

    // Retrieval Simulator Elements
    var inputSimQuery = document.getElementById('input-sim-query');
    var btnRunSim = document.getElementById('btn-run-sim');
    var simResultsContainer = document.getElementById('sim-results-container');
    var badgeHeadroom = document.getElementById('badge-headroom');
    var fillHeadroom4k = document.getElementById('fill-headroom-4k');
    var fillHeadroom8k = document.getElementById('fill-headroom-8k');
    var labelHeadroom4k = document.getElementById('label-headroom-4k');
    var labelHeadroom8k = document.getElementById('label-headroom-8k');

    // Presets
    document.getElementById('preset-small').addEventListener('click', function() {
      syncSize(250);
      syncOverlap(25);
    });
    document.getElementById('preset-medium').addEventListener('click', function() {
      syncSize(500);
      syncOverlap(50);
    });
    document.getElementById('preset-large').addEventListener('click', function() {
      syncSize(1000);
      syncOverlap(100);
    });

    // Workspace Elements
    var btnScanWorkspace = document.getElementById('btn-scan-workspace');
    var wsResultsCard = document.getElementById('workspace-results-card');
    var wsEmptyState = document.getElementById('workspace-empty-state');
    var wsProjectName = document.getElementById('ws-project-name');
    var wsRootPath = document.getElementById('ws-root-path');
    var wsRagStatus = document.getElementById('ws-rag-status');
    var wsTechGrid = document.getElementById('ws-tech-grid');
    var wsDirChips = document.getElementById('ws-dir-chips');
    var btnCopyWsReport = document.getElementById('btn-copy-ws-report');

    // Filter Buttons
    var filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        filterBtns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeTechFilter = btn.getAttribute('data-filter') || 'all';
        renderTechGrid();
      });
    });

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

    function showCopySuccess(btn, originalHtml) {
      if (!btn) return;
      var prevHtml = originalHtml || btn.innerHTML;
      btn.classList.add('btn-copied');
      btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-right: 4px;"><polyline points="20 6 9 17 4 12"></polyline></svg>Copied!';
      setTimeout(function() {
        btn.classList.remove('btn-copied');
        btn.innerHTML = prevHtml;
      }, 1800);
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
      var strat = selectChunkStrategy ? selectChunkStrategy.value : 'boundary';
      if (size <= 0) {
        chunkConfigError.textContent = 'Chunk size must be greater than 0.';
        chunkConfigError.style.display = 'block';
        return false;
      }
      if (overlap < 0) {
        chunkConfigError.textContent = 'Overlap cannot be negative.';
        chunkConfigError.style.display = 'block';
        return false;
      }
      if (overlap >= size) {
        chunkConfigError.textContent = 'Overlap (' + overlap + ') must be strictly less than chunk size (' + size + ').';
        chunkConfigError.style.display = 'block';
        return false;
      }
      if (strat === 'parent_document') {
        var parentSize = parseInt(inputParentSize.value, 10) || 1200;
        if (parentSize <= size) {
          chunkConfigError.textContent = 'Parent context size (' + parentSize + ') must be strictly greater than child chunk size (' + size + ').';
          chunkConfigError.style.display = 'block';
          return false;
        }
      }
      chunkConfigError.style.display = 'none';
      return true;
    }

    function syncParentSize(val) {
      var num = parseInt(val, 10) || 1200;
      sliderParentSize.value = num;
      inputParentSize.value = num;
      labelParentSize.textContent = num;
      validateChunkInputs();
    }

    sliderChunkSize.addEventListener('input', function(e) { syncSize(e.target.value); });
    inputChunkSize.addEventListener('input', function(e) { syncSize(e.target.value); });
    sliderChunkOverlap.addEventListener('input', function(e) { syncOverlap(e.target.value); });
    inputChunkOverlap.addEventListener('input', function(e) { syncOverlap(e.target.value); });
    sliderParentSize.addEventListener('input', function(e) { syncParentSize(e.target.value); });
    inputParentSize.addEventListener('input', function(e) { syncParentSize(e.target.value); });

    selectChunkStrategy.addEventListener('change', function() {
      var strat = selectChunkStrategy.value;
      if (strat === 'parent_document') {
        groupParentSize.style.display = 'flex';
        strategyExplainer.innerHTML = '<strong>Small-to-Big Strategy:</strong> Partitions document into large parent context blocks (for the LLM) and focused child units (for vector search). Eliminates vector dilution without losing context.';
      } else if (strat === 'markdown') {
        groupParentSize.style.display = 'none';
        strategyExplainer.innerHTML = '<strong>Markdown AST Strategy:</strong> Preserves tables and fenced code blocks as unbroken atomic units and tracks heading breadcrumb hierarchies.';
      } else {
        groupParentSize.style.display = 'none';
        strategyExplainer.innerHTML = '<strong>Recursive Boundary-Aware:</strong> Standard hierarchical splitting across paragraphs, sentences, and words.';
      }
      validateChunkInputs();
    });

    btnViewChild.addEventListener('click', function() {
      currentViewMode = 'child';
      btnViewChild.classList.add('active');
      btnViewParent.classList.remove('active');
      renderCurrentChunk();
    });

    btnViewParent.addEventListener('click', function() {
      currentViewMode = 'parent';
      btnViewParent.classList.add('active');
      btnViewChild.classList.remove('active');
      renderCurrentChunk();
    });

    // Document Inspector Actions
    btnPickFile.addEventListener('click', function() {
      vscode.postMessage({ command: 'requestSelectFile' });
    });

    if (docDropZone) {
      docDropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        docDropZone.classList.add('drag-over');
      });
      docDropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        docDropZone.classList.remove('drag-over');
      });
      docDropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        docDropZone.classList.remove('drag-over');

        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          var file = e.dataTransfer.files[0];
          currentFileName = file.name;
          var ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
          var allowed = ['.txt', '.md', '.json', '.csv'];
          if (allowed.indexOf(ext) === -1) {
            vscode.postMessage({
              command: 'showWarning',
              text: 'Unsupported format: "' + file.name + '". RAGLaB profiles text-native documents: Markdown (.md), Plain Text (.txt), JSON (.json), and CSV (.csv).'
            });
            return;
          }

          var reader = new FileReader();
          reader.onload = function(evt) {
            var text = evt.target.result || '';
            docTextInput.value = text;
            currentText = text;
            btnSendToChunking.disabled = false;
            vscode.postMessage({
              command: 'requestAnalyzeDroppedFile',
              fileName: file.name,
              text: text
            });
          };
          reader.readAsText(file);
        }
      });
      docDropZone.addEventListener('click', function() {
        vscode.postMessage({ command: 'requestSelectFile' });
      });
    }

    btnLoadActive.addEventListener('click', function() {
      vscode.postMessage({ command: 'requestLoadActiveEditor' });
    });

    btnLoadSample.addEventListener('click', function() {
      currentFileName = 'sample_rag_overview.md';
      docTextInput.value = SAMPLE_RAG_DOCUMENT;
      currentText = SAMPLE_RAG_DOCUMENT;
      btnSendToChunking.disabled = false;
      vscode.postMessage({ command: 'requestAnalyzeText', text: SAMPLE_RAG_DOCUMENT, fileName: currentFileName });
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
      var strategy = selectChunkStrategy ? selectChunkStrategy.value : 'boundary';
      var parentChunkSize = parseInt(inputParentSize.value, 10) || 1200;
      vscode.postMessage({
        command: 'requestChunking',
        text: text,
        fileName: currentFileName,
        chunkSize: size,
        overlap: overlap,
        strategy: strategy,
        parentChunkSize: parentChunkSize
      });
    });

    // Chunk Viewer Navigation
    function renderCurrentChunk() {
      if (!currentChunks || currentChunks.length === 0) {
        chunkContentView.textContent = 'No chunks available.';
        chunkUtilBar.style.width = '0%';
        chunkOverlapNotice.textContent = 'No active chunk.';
        badgeBreadcrumb.style.display = 'none';
        badgeAtomic.style.display = 'none';
        parentChildToggle.style.display = 'none';
        if (chunkMinimapContainer) chunkMinimapContainer.style.display = 'none';
        return;
      }

      chunkContentView.classList.remove('chunk-fade-in');
      void chunkContentView.offsetWidth;
      chunkContentView.classList.add('chunk-fade-in');

      var chunk = currentChunks[currentChunkIndex];
      inputChunkJump.value = currentChunkIndex + 1;

      // Breadcrumb badge
      if (chunk.breadcrumb) {
        badgeBreadcrumb.style.display = 'inline-flex';
        badgeBreadcrumb.textContent = chunk.breadcrumb;
        badgeBreadcrumb.title = chunk.breadcrumb;
      } else {
        badgeBreadcrumb.style.display = 'none';
      }

      // Atomic block badge
      if (chunk.isAtomic) {
        badgeAtomic.style.display = 'inline-flex';
        badgeAtomic.textContent = 'Preserved ' + (chunk.atomicType === 'code' ? 'Code Block' : (chunk.atomicType === 'table' ? 'Table' : 'Atomic Block'));
      } else {
        badgeAtomic.style.display = 'none';
      }

      // Parent-Child Toggle
      if (chunk.parentContent) {
        parentChildToggle.style.display = 'inline-flex';
      } else {
        parentChildToggle.style.display = 'none';
        currentViewMode = 'child';
        btnViewChild.classList.add('active');
        btnViewParent.classList.remove('active');
      }

      if (currentViewMode === 'parent' && chunk.parentContent) {
        badgeCurrentChars.textContent = chunk.parentContent.length.toLocaleString() + ' chars (Parent Context)';
        var parentWords = chunk.parentContent.trim().split(/\s+/).length;
        badgeCurrentWords.textContent = parentWords.toLocaleString() + ' words';
        badgeCurrentTokens.textContent = '~' + Math.round(parentWords * 1.3).toLocaleString() + ' tokens';
        badgeCurrentOffsets.textContent = 'Parent Unit #' + ((chunk.parentId !== undefined ? chunk.parentId : 0) + 1);
        chunkUtilBar.style.width = '100%';
        chunkUtilBar.style.background = 'var(--accent-color)';

        chunkOverlapNotice.innerHTML = '<strong>Parent LLM Context:</strong> This full context block is supplied to the LLM prompt when Child Unit #' + (chunk.index + 1) + ' matches vector retrieval.';

        var parentEscaped = escapeHtmlClient(chunk.parentContent);
        var childEscaped = escapeHtmlClient(chunk.content);
        if (childEscaped && parentEscaped.indexOf(childEscaped) !== -1) {
          chunkContentView.innerHTML = parentEscaped.replace(childEscaped, '<mark style="background: rgba(0, 120, 212, 0.35); color: inherit; border-radius: 2px; padding: 2px 0;">' + childEscaped + '</mark>');
        } else {
          chunkContentView.textContent = chunk.parentContent;
        }
      } else {
        badgeCurrentChars.textContent = chunk.characterCount.toLocaleString() + ' chars';
        badgeCurrentWords.textContent = chunk.wordCount.toLocaleString() + ' words';
        badgeCurrentTokens.textContent = '~' + chunk.estimatedTokenCount.toLocaleString() + ' tokens';
        badgeCurrentOffsets.textContent = 'Offsets: ' + chunk.startOffset + ' -> ' + chunk.endOffset;

        var targetSize = parseInt(inputChunkSize.value, 10) || 500;
        var pct = Math.min(100, Math.round((chunk.characterCount / targetSize) * 100));
        chunkUtilBar.style.width = pct + '%';
        if (pct < 50 && !chunk.isAtomic) {
          chunkUtilBar.style.background = 'var(--warning-color)';
        } else if (pct > 130 && !chunk.isAtomic) {
          chunkUtilBar.style.background = 'var(--error-color)';
        } else {
          chunkUtilBar.style.background = 'var(--accent-color)';
        }

        // Overlap Notice
        if (currentChunkIndex < currentChunks.length - 1) {
          var nextChunk = currentChunks[currentChunkIndex + 1];
          var overlapLen = Math.max(0, chunk.endOffset - nextChunk.startOffset);
          chunkOverlapNotice.innerHTML = '<strong>Context Continuity:</strong> Shares ~' + overlapLen + ' overlapping characters with Chunk #' + (nextChunk.index + 1) + '.';
        } else {
          chunkOverlapNotice.innerHTML = '<strong>Terminal Chunk:</strong> Final segment of document.';
        }

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

      btnPrevChunk.disabled = (currentChunkIndex === 0);
      btnNextChunk.disabled = (currentChunkIndex === currentChunks.length - 1);
      updateMinimapSelection();
    }

    function renderMinimap() {
      if (!chunkMinimapTrack || !currentChunks || currentChunks.length === 0) {
        if (chunkMinimapContainer) chunkMinimapContainer.style.display = 'none';
        return;
      }
      if (chunkMinimapContainer) chunkMinimapContainer.style.display = 'flex';
      if (labelMinimapInfo) {
        labelMinimapInfo.textContent = currentChunks.length + ' Chunks' + (currentChunks.some(function(c) { return c.isAtomic; }) ? ' (Atomic Blocks Preserved)' : '');
      }

      chunkMinimapTrack.innerHTML = '';
      for (var i = 0; i < currentChunks.length; i++) {
        var seg = document.createElement('div');
        seg.className = 'minimap-seg' + (i === currentChunkIndex ? ' active' : '') + (currentChunks[i].isAtomic ? ' atomic' : '');
        seg.setAttribute('data-index', i);
        seg.title = 'Chunk #' + (i + 1) + ' (' + currentChunks[i].characterCount + ' chars' + (currentChunks[i].isAtomic ? ', ' + currentChunks[i].atomicType : '') + ')';
        chunkMinimapTrack.appendChild(seg);
      }
    }

    function updateMinimapSelection() {
      if (!chunkMinimapTrack) return;
      var segs = chunkMinimapTrack.querySelectorAll('.minimap-seg');
      segs.forEach(function(seg) {
        var idx = parseInt(seg.getAttribute('data-index'), 10);
        if (idx === currentChunkIndex) {
          seg.classList.add('active');
          seg.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          seg.classList.remove('active');
        }
      });
    }

    if (chunkMinimapTrack) {
      chunkMinimapTrack.addEventListener('click', function(e) {
        var target = e.target.closest('.minimap-seg');
        if (target && target.hasAttribute('data-index')) {
          var idx = parseInt(target.getAttribute('data-index'), 10);
          if (!isNaN(idx) && idx >= 0 && idx < currentChunks.length) {
            currentChunkIndex = idx;
            renderCurrentChunk();
          }
        }
      });
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

    var searchDebounceTimer = null;
    inputChunkSearch.addEventListener('input', function() {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(function() {
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
      }, 120);
    });

    btnCopyCurrentChunk.addEventListener('click', function() {
      if (!currentChunks || currentChunks.length === 0) return;
      var chunk = currentChunks[currentChunkIndex];
      vscode.postMessage({ command: 'copy', text: chunk.content, label: 'Chunk #' + (chunk.index + 1) });
      showCopySuccess(btnCopyCurrentChunk, 'Copy Chunk');
    });

    btnCopyAllChunks.addEventListener('click', function() {
      if (!currentChunks || currentChunks.length === 0) return;
      var allText = currentChunks.map(function(c) {
        return '--- Chunk #' + (c.index + 1) + ' (' + c.characterCount + ' chars, ~' + c.estimatedTokenCount + ' tokens) ---\\n' + c.content;
      }).join('\\n\\n');
      vscode.postMessage({ command: 'copy', text: allText, label: 'All ' + currentChunks.length + ' Chunks' });
      showCopySuccess(btnCopyAllChunks, 'Copy All');
    });

    btnExportChunksJson.addEventListener('click', function() {
      if (!currentChunks || currentChunks.length === 0) return;
      var jsonStr = JSON.stringify(currentChunks, null, 2);
      vscode.postMessage({ command: 'copy', text: jsonStr, label: 'Chunks JSON' });
      showCopySuccess(btnExportChunksJson, 'Copy JSON');
    });

    btnSaveChunksFile.addEventListener('click', function() {
      if (!currentChunks || currentChunks.length === 0) return;
      var jsonStr = JSON.stringify(currentChunks, null, 2);
      vscode.postMessage({
        command: 'requestSaveChunksFile',
        jsonContent: jsonStr,
        fileName: currentFileName
      });
    });

    // Retrieval Simulation Algorithm (Local TF-IDF Lexical Similarity)
    function runRetrievalSimulation() {
      var query = (inputSimQuery.value || '').trim();
      if (!query || currentChunks.length === 0) {
        simResultsContainer.innerHTML = '<span style="font-size: 11px; color: var(--vscode-descriptionForeground);">Enter a query above to inspect ranked matching chunks.</span>';
        if (fillHeadroom4k) fillHeadroom4k.style.width = '0%';
        if (fillHeadroom8k) fillHeadroom8k.style.width = '0%';
        if (labelHeadroom4k) labelHeadroom4k.textContent = '0% (4,096 tokens free)';
        if (labelHeadroom8k) labelHeadroom8k.textContent = '0% (8,192 tokens free)';
        return;
      }

      var terms = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(function(w) { return w.length > 1; });
      if (terms.length === 0) return;

      var N = currentChunks.length;
      var dfMap = {};
      terms.forEach(function(t) {
        dfMap[t] = currentChunks.filter(function(c) { return c.content.toLowerCase().indexOf(t) !== -1; }).length;
      });

      var scored = currentChunks.map(function(chunk) {
        var lower = chunk.content.toLowerCase();
        var score = 0;
        terms.forEach(function(t) {
          var count = 0;
          var pos = lower.indexOf(t);
          while (pos !== -1) {
            count++;
            pos = lower.indexOf(t, pos + 1);
          }
          if (count > 0) {
            var tf = count / (chunk.wordCount || 1);
            var idf = Math.log(1 + (N / ((dfMap[t] || 0) + 1)));
            score += tf * idf * 100;
          }
        });
        return { chunk: chunk, score: score };
      });

      scored.sort(function(a, b) { return b.score - a.score; });
      var topK = scored.slice(0, 3).filter(function(item) { return item.score > 0; });

      simResultsContainer.innerHTML = '';
      if (topK.length === 0) {
        simResultsContainer.innerHTML = '<div style="font-size: 12px; color: var(--vscode-descriptionForeground);">No relevant chunks matched query terms. Try different keywords.</div>';
        badgeHeadroom.textContent = 'Top-K: 0 tokens';
        if (fillHeadroom4k) fillHeadroom4k.style.width = '0%';
        if (fillHeadroom8k) fillHeadroom8k.style.width = '0%';
        if (labelHeadroom4k) labelHeadroom4k.textContent = '0% (4,096 tokens free)';
        if (labelHeadroom8k) labelHeadroom8k.textContent = '0% (8,192 tokens free)';
        return;
      }

      var totalTopTokens = 0;
      var seenParentIds = {};
      topK.forEach(function(item, idx) {
        if (item.chunk.parentContent && item.chunk.parentId !== undefined) {
          if (!seenParentIds[item.chunk.parentId]) {
            seenParentIds[item.chunk.parentId] = true;
            totalTopTokens += Math.round(item.chunk.parentContent.trim().split(/\s+/).length * 1.3);
          }
        } else {
          totalTopTokens += item.chunk.estimatedTokenCount;
        }

        var card = document.createElement('div');
        card.className = 'retrieval-card';
        card.style.animationDelay = (idx * 60) + 'ms';
        card.title = 'Click to inspect Chunk #' + (item.chunk.index + 1);

        var left = document.createElement('div');
        left.style.display = 'flex';
        left.style.flexDirection = 'column';
        left.style.gap = '2px';

        var title = document.createElement('span');
        title.style.fontWeight = '600';
        title.style.fontSize = '12px';
        var parentTag = item.chunk.parentContent ? ' [Parent Context: ~' + Math.round(item.chunk.parentContent.trim().split(/\s+/).length * 1.3) + ' tokens]' : '';
        title.textContent = 'Rank #' + (idx + 1) + ' - Chunk #' + (item.chunk.index + 1) + ' (' + item.chunk.characterCount + ' chars, ~' + item.chunk.estimatedTokenCount + ' tokens)' + parentTag;

        var preview = document.createElement('span');
        preview.style.fontSize = '11px';
        preview.style.color = 'var(--vscode-descriptionForeground)';
        preview.textContent = item.chunk.content.substring(0, 95) + '...';

        left.appendChild(title);
        left.appendChild(preview);

        var right = document.createElement('span');
        right.className = 'badge-pill';
        right.style.background = 'rgba(56,138,52,0.2)';
        right.style.color = '#73c991';
        right.textContent = 'Match: ' + Math.min(99, Math.round(item.score * 10)) + '%';

        card.appendChild(left);
        card.appendChild(right);

        card.addEventListener('click', function() {
          currentChunkIndex = item.chunk.index;
          searchQuery = terms[0] || '';
          inputChunkSearch.value = searchQuery;
          renderCurrentChunk();
        });

        simResultsContainer.appendChild(card);
      });

      var headroomPct = ((totalTopTokens / 4096) * 100).toFixed(1);
      var headroomLabel = (topK[0] && topK[0].chunk.parentContent) ? 'Parent LLM Context: ~' : 'Top-3 Chunks: ~';
      badgeHeadroom.textContent = headroomLabel + totalTopTokens + ' tokens (' + headroomPct + '% of 4K window)';

      var pct4k = Math.min(100, Math.round((totalTopTokens / 4096) * 100));
      var free4k = Math.max(0, 4096 - totalTopTokens);
      var pct8k = Math.min(100, Math.round((totalTopTokens / 8192) * 100));
      var free8k = Math.max(0, 8192 - totalTopTokens);

      if (fillHeadroom4k) {
        fillHeadroom4k.style.width = pct4k + '%';
        if (pct4k > 75) {
          fillHeadroom4k.style.backgroundColor = 'var(--error-color)';
        } else if (pct4k > 40) {
          fillHeadroom4k.style.backgroundColor = 'var(--warning-color)';
        } else {
          fillHeadroom4k.style.backgroundColor = '#73c991';
        }
      }
      if (labelHeadroom4k) {
        labelHeadroom4k.textContent = pct4k + '% (' + free4k.toLocaleString() + ' tokens free)';
      }

      if (fillHeadroom8k) {
        fillHeadroom8k.style.width = pct8k + '%';
        if (pct8k > 75) {
          fillHeadroom8k.style.backgroundColor = 'var(--error-color)';
        } else if (pct8k > 40) {
          fillHeadroom8k.style.backgroundColor = 'var(--warning-color)';
        } else {
          fillHeadroom8k.style.backgroundColor = '#73c991';
        }
      }
      if (labelHeadroom8k) {
        labelHeadroom8k.textContent = pct8k + '% (' + free8k.toLocaleString() + ' tokens free)';
      }
    }

    btnRunSim.addEventListener('click', runRetrievalSimulation);
    inputSimQuery.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') runRetrievalSimulation();
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

    btnCopyWsReport.addEventListener('click', function() {
      if (!lastWorkspaceAnalysis) return;
      var lines = [];
      lines.push('=== RAGLaB Workspace Audit: ' + lastWorkspaceAnalysis.projectName + ' ===');
      lines.push('Path: ' + lastWorkspaceAnalysis.rootPath);
      lines.push('Status: ' + (lastWorkspaceAnalysis.isLikelyRagProject ? 'RAG Stack Detected' : 'Standard Project'));
      lines.push('\\n--- Technologies Detected ---');
      lastWorkspaceAnalysis.technologies.forEach(function(t) {
        lines.push((t.detected ? '[x] ' : '[ ] ') + t.name.padEnd(25) + '(' + t.category + (t.source ? ' via ' + t.source : '') + ')');
      });
      if (lastWorkspaceAnalysis.ragDirectories && lastWorkspaceAnalysis.ragDirectories.length > 0) {
        lines.push('\\n--- RAG Directories ---');
        lastWorkspaceAnalysis.ragDirectories.forEach(function(d) {
          lines.push(d.name + '/ (' + d.purpose + ')');
        });
      }
      vscode.postMessage({ command: 'copy', text: lines.join('\\n'), label: 'Workspace Report' });
      showCopySuccess(btnCopyWsReport, 'Copy Report');
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
        warnDiv.innerHTML = '<strong>Notice:</strong> Document has a high ratio of empty lines (' + Math.round((analysis.emptyLineCount / analysis.lineCount) * 100) + '%). Consider normalizing line breaks before generating embeddings.';
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
          box.textContent = '[' + (w.severity === 'error' ? 'Error' : 'Warning') + '] ' + w.message;
          chunkWarnings.appendChild(box);
        });
      }

      chunkEmptyState.style.display = 'none';
      chunkResultsCard.style.display = 'flex';
      renderMinimap();
      renderCurrentChunk();

      // Reset or trigger simulation with default query
      inputSimQuery.value = 'vector chunking';
      runRetrievalSimulation();
    }

    // Render Tech Grid with Category Filter
    function renderTechGrid() {
      if (!lastWorkspaceAnalysis) return;
      wsTechGrid.innerHTML = '';

      var filtered = lastWorkspaceAnalysis.technologies.filter(function(t) {
        if (activeTechFilter === 'all') return true;
        return t.category.toLowerCase() === activeTechFilter;
      });

      filtered.forEach(function(t) {
        var card = document.createElement('div');
        card.className = 'tech-card' + (t.detected ? ' detected' : '');

        var info = document.createElement('div');
        info.className = 'tech-info';

        var name = document.createElement('span');
        name.className = 'tech-name';
        name.textContent = t.name;

        var cat = document.createElement('span');
        cat.className = 'tech-category';
        cat.textContent = t.category + (t.source ? ' via ' + t.source : '');

        info.appendChild(name);
        info.appendChild(cat);

        var pill = document.createElement('span');
        pill.className = 'status-pill ' + (t.detected ? 'yes' : 'no');
        pill.innerHTML = '<span class="status-dot"></span> ' + (t.detected ? 'Detected' : 'Not found');

        card.appendChild(info);
        card.appendChild(pill);
        wsTechGrid.appendChild(card);
      });
    }

    // Apply Workspace Analysis
    function applyWorkspaceAnalysis(ws) {
      if (!ws) return;
      lastWorkspaceAnalysis = ws;
      wsProjectName.textContent = ws.projectName;
      wsRootPath.textContent = ws.rootPath;

      if (ws.isLikelyRagProject) {
        wsRagStatus.className = 'status-pill yes';
        wsRagStatus.innerHTML = '<span class="status-dot"></span> RAG Stack Detected';
      } else {
        wsRagStatus.className = 'status-pill no';
        wsRagStatus.innerHTML = '<span class="status-dot"></span> Standard Project';
      }

      renderTechGrid();

      wsDirChips.innerHTML = '';
      if (!ws.ragDirectories || ws.ragDirectories.length === 0) {
        wsDirChips.innerHTML = '<span style="font-size: 12px; color: var(--vscode-descriptionForeground);">No standard RAG directory names detected in root.</span>';
      } else {
        ws.ragDirectories.forEach(function(d) {
          var chip = document.createElement('span');
          chip.className = 'dir-chip';
          chip.textContent = d.name + '/';
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
