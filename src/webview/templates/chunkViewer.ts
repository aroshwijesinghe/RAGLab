import { ChunkResult, ChunkStatistics } from '../../models/types';
import { formatNumber, escapeHtml } from '../../utils/textUtils';

export function getChunkViewerHtml(
  nonce: string,
  cspSource: string,
  chunkResult: ChunkResult,
  statistics: ChunkStatistics
): string {
    const chunkDataString = JSON.stringify(chunkResult.chunks);

    let warningsHtml = '';
    if (chunkResult.warnings && chunkResult.warnings.length > 0) {
        const warningItems = chunkResult.warnings.map(w => {
            const tag = w.severity === 'error' ? '[Error]' : (w.severity === 'warning' ? '[Warning]' : '[Notice]');
            return `<div class="warning-item ${w.severity}"><span style="font-weight:600; margin-right:4px;">${tag}</span> ${escapeHtml(w.message)} ${w.chunkIndex !== undefined ? `(Chunk ${w.chunkIndex})` : ''}</div>`;
        }).join('');
        warningsHtml = `<div class="warnings-section">${warningItems}</div>`;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RAG Chunk Viewer</title>
    <style nonce="${nonce}">
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            margin: 0;
            display: flex;
            flex-direction: column;
            height: 100vh;
            box-sizing: border-box;
        }
        .header {
            margin-bottom: 20px;
        }
        h1 {
            font-size: 22px;
            margin-bottom: 8px;
            margin-top: 0;
        }
        .meta-info {
            color: var(--vscode-descriptionForeground);
            font-size: 13px;
        }
        .warnings-section {
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .warning-item {
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 13px;
            border-left: 4px solid;
        }
        .warning-item.error {
            background-color: rgba(244, 135, 113, 0.1);
            border-color: #f48771;
        }
        .warning-item.warning {
            background-color: rgba(204, 167, 0, 0.1);
            border-color: #cca700;
        }
        .warning-item.info {
            background-color: rgba(117, 190, 255, 0.1);
            border-color: #75beff;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
            margin-bottom: 20px;
            background: rgba(0,0,0,0.1);
            padding: 16px;
            border-radius: 6px;
            border: 1px solid var(--vscode-panel-border);
        }
        .stat-box {
            display: flex;
            flex-direction: column;
            font-size: 13px;
        }
        .stat-label {
            color: var(--vscode-descriptionForeground);
            margin-bottom: 4px;
            font-size: 12px;
        }
        .stat-value {
            font-weight: bold;
        }
        .toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            flex-wrap: wrap;
            gap: 12px;
        }
        .nav-controls {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .search-controls {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        input[type="text"], input[type="number"] {
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            padding: 4px 8px;
            border-radius: 2px;
            font-size: 13px;
        }
        input[type="number"] {
            width: 60px;
            text-align: center;
        }
        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 6px 12px;
            border-radius: 2px;
            cursor: pointer;
            font-size: 13px;
        }
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .chunk-container {
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            overflow: hidden;
        }
        .chunk-header {
            background: rgba(0,0,0,0.1);
            padding: 8px 12px;
            border-bottom: 1px solid var(--vscode-panel-border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
        }
        .chunk-badges {
            display: flex;
            gap: 8px;
        }
        .badge {
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 11px;
        }
        .chunk-content {
            padding: 16px;
            overflow-y: auto;
            flex-grow: 1;
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: var(--vscode-editor-font-size, 14px);
            white-space: pre-wrap;
            word-break: break-word;
            margin: 0;
            background: var(--vscode-editor-background);
        }
        mark {
            background-color: rgba(255, 255, 0, 0.4);
            color: inherit;
        }
        .global-actions {
            margin-top: 16px;
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>RAG Chunk Viewer</h1>
        <div class="meta-info">
            File: ${escapeHtml(chunkResult.fileName)} | Chunks: ${formatNumber(statistics.totalChunks)} | Size: ${formatNumber(chunkResult.config.chunkSize)} | Overlap: ${formatNumber(chunkResult.config.overlap)}
        </div>
    </div>

    ${warningsHtml}

    <div class="stats-grid">
        <div class="stat-box">
            <span class="stat-label">Total Chunks</span>
            <span class="stat-value">${formatNumber(statistics.totalChunks)}</span>
        </div>
        <div class="stat-box">
            <span class="stat-label">Characters (Avg / Min / Max)</span>
            <span class="stat-value">${formatNumber(Math.round(statistics.averageCharacters))} / ${formatNumber(statistics.minCharacters)} / ${formatNumber(statistics.maxCharacters)}</span>
        </div>
        <div class="stat-box">
            <span class="stat-label">Words (Avg / Min / Max)</span>
            <span class="stat-value">${formatNumber(Math.round(statistics.averageWords))} / ${formatNumber(statistics.minWords)} / ${formatNumber(statistics.maxWords)}</span>
        </div>
        <div class="stat-box">
            <span class="stat-label">Tokens Est. (Avg / Min / Max)</span>
            <span class="stat-value">${formatNumber(Math.round(statistics.averageEstimatedTokens))} / ${formatNumber(statistics.minEstimatedTokens)} / ${formatNumber(statistics.maxEstimatedTokens)}</span>
        </div>
    </div>

    <div class="toolbar">
        <div class="nav-controls">
            <button id="btn-prev" disabled>Previous</button>
            <span>Chunk <input type="number" id="input-jump" value="1" min="1" max="${statistics.totalChunks}"> of ${statistics.totalChunks}</span>
            <button id="btn-next">Next</button>
        </div>
        <div class="search-controls">
            <input type="text" id="input-search" placeholder="Search in chunks...">
            <span id="search-results-info" style="font-size: 12px; color: var(--vscode-descriptionForeground);"></span>
        </div>
    </div>

    <div class="chunk-container">
        <div class="chunk-header">
            <span id="current-chunk-index">Chunk #1</span>
            <div class="chunk-badges">
                <span class="badge" id="badge-chars">0 chars</span>
                <span class="badge" id="badge-words">0 words</span>
                <span class="badge" id="badge-tokens">0 tokens</span>
            </div>
            <button id="btn-copy-current">Copy Chunk</button>
        </div>
        <pre class="chunk-content" id="chunk-content-display"></pre>
    </div>

    <div class="global-actions">
        <button id="btn-copy-all">Copy All Chunks</button>
        <button id="btn-export-json">Export as JSON</button>
    </div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        const chunks = ${chunkDataString};
        let currentIndex = 0;
        let searchQuery = '';

        const btnPrev = document.getElementById('btn-prev');
        const btnNext = document.getElementById('btn-next');
        const inputJump = document.getElementById('input-jump');
        const inputSearch = document.getElementById('input-search');
        const searchResultsInfo = document.getElementById('search-results-info');
        
        const chunkIndexDisplay = document.getElementById('current-chunk-index');
        const badgeChars = document.getElementById('badge-chars');
        const badgeWords = document.getElementById('badge-words');
        const badgeTokens = document.getElementById('badge-tokens');
        const chunkContentDisplay = document.getElementById('chunk-content-display');

        function escapeHtmlInner(unsafe) {
            return (unsafe || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        }

        function highlightText(text, query) {
            if (!query) return escapeHtmlInner(text);
            var escapedText = escapeHtmlInner(text);
            var escapedQuery = escapeHtmlInner(query);
            var regex = new RegExp(escapedQuery.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'), 'gi');
            return escapedText.replace(regex, function(match) { return '<mark>' + match + '</mark>'; });
        }

        function updateDisplay() {
            if (!chunks || chunks.length === 0) return;
            
            var chunk = chunks[currentIndex];
            chunkIndexDisplay.textContent = 'Chunk #' + (chunk.index + 1);
            badgeChars.textContent = chunk.characterCount.toLocaleString() + ' chars';
            badgeWords.textContent = chunk.wordCount.toLocaleString() + ' words';
            badgeTokens.textContent = chunk.estimatedTokenCount.toLocaleString() + ' tokens';
            
            chunkContentDisplay.innerHTML = highlightText(chunk.content, searchQuery);
            
            inputJump.value = currentIndex + 1;
            btnPrev.disabled = currentIndex === 0;
            btnNext.disabled = currentIndex === chunks.length - 1;
        }

        function updateSearch() {
            searchQuery = inputSearch.value;
            if (searchQuery) {
                var matches = chunks.filter(function(c) { return c.content.toLowerCase().includes(searchQuery.toLowerCase()); });
                searchResultsInfo.textContent = matches.length + ' chunks match';
                if (matches.length > 0 && !chunks[currentIndex].content.toLowerCase().includes(searchQuery.toLowerCase())) {
                    currentIndex = matches[0].index;
                }
            } else {
                searchResultsInfo.textContent = '';
            }
            updateDisplay();
        }

        btnPrev.addEventListener('click', function() {
            if (currentIndex > 0) {
                currentIndex--;
                updateDisplay();
            }
        });

        btnNext.addEventListener('click', function() {
            if (currentIndex < chunks.length - 1) {
                currentIndex++;
                updateDisplay();
            }
        });

        inputJump.addEventListener('change', function(e) {
            var val = parseInt(e.target.value) - 1;
            if (val >= 0 && val < chunks.length) {
                currentIndex = val;
                updateDisplay();
            } else {
                e.target.value = currentIndex + 1;
            }
        });

        inputSearch.addEventListener('input', function() {
            updateSearch();
        });

        document.getElementById('btn-copy-current').addEventListener('click', function() {
            var chunk = chunks[currentIndex];
            vscode.postMessage({ command: 'copy', text: chunk.content });
        });

        document.getElementById('btn-copy-all').addEventListener('click', function() {
            var allText = chunks.map(function(c) { return '--- Chunk ' + (c.index + 1) + ' ---\\n' + c.content; }).join('\\n\\n');
            vscode.postMessage({ command: 'copy', text: allText });
        });

        document.getElementById('btn-export-json').addEventListener('click', function() {
            vscode.postMessage({ command: 'copy', text: JSON.stringify(chunks, null, 2) });
            vscode.postMessage({ command: 'showInfo', text: 'JSON copied to clipboard!' });
        });

        document.addEventListener('keydown', function(e) {
            if (e.target.tagName === 'INPUT') return;
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                currentIndex--;
                updateDisplay();
            } else if (e.key === 'ArrowRight' && currentIndex < chunks.length - 1) {
                currentIndex++;
                updateDisplay();
            }
        });

        // Initialize
        updateDisplay();
    </script>
</body>
</html>`;
}
