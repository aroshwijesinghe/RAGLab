import * as vscode from 'vscode';

export class SidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'ragHelper.sidebar';
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };
    webviewView.webview.html = this._getHtmlContent(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'openDashboard':
          await vscode.commands.executeCommand('ragHelper.openDashboard');
          break;
        case 'analyzeDocument':
          await vscode.commands.executeCommand('ragHelper.analyzeDocument');
          break;
        case 'createChunks':
          await vscode.commands.executeCommand('ragHelper.createChunks');
          break;
        case 'previewChunks':
          await vscode.commands.executeCommand('ragHelper.previewChunks');
          break;
        case 'analyzeWorkspace':
          await vscode.commands.executeCommand('ragHelper.analyzeWorkspace');
          break;
        case 'openGuidelines':
          await vscode.commands.executeCommand('ragHelper.openDashboard');
          break;
      }
    });
  }

  private _getHtmlContent(webview: vscode.Webview): string {
    const nonce = getNonce();
    const logoUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'resources', 'logo.png')
    );

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; style-src ${webview.cspSource} 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RAGLaB Studio</title>
  <style nonce="${nonce}">
    :root {
      --border-color: var(--vscode-panel-border, rgba(128, 128, 128, 0.2));
      --accent-color: var(--vscode-button-background, #0078d4);
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-editor-foreground);
      background-color: var(--vscode-sideBar-background, var(--vscode-editor-background));
      padding: 14px 12px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      font-size: 12px;
      animation: fadeIn 0.25s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .hero-card {
      background: var(--vscode-editor-background);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .hero-card:hover {
      border-color: var(--vscode-focusBorder, rgba(0, 120, 212, 0.5));
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }
    .brand-header {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-logo {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      object-fit: cover;
      flex-shrink: 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .brand-title {
      font-weight: 700;
      font-size: 14px;
      letter-spacing: -0.2px;
      color: var(--vscode-foreground);
    }
    .brand-subtitle {
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-top: 1px;
    }
    .hero-desc {
      color: var(--vscode-descriptionForeground);
      font-size: 11.5px;
      line-height: 1.45;
    }
    .btn-primary {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      transition: background-color 0.15s, transform 0.1s, box-shadow 0.15s;
    }
    .btn-primary:hover {
      background-color: var(--vscode-button-hoverBackground);
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    }
    .btn-primary:active {
      transform: translateY(0);
      box-shadow: none;
    }
    .section-title {
      font-size: 10.5px;
      font-weight: 700;
      color: var(--vscode-sideBarTitle-foreground, var(--vscode-descriptionForeground));
      text-transform: uppercase;
      letter-spacing: 0.7px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border-color);
    }
    .button-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .action-btn {
      background-color: rgba(128, 128, 128, 0.07);
      color: var(--vscode-editor-foreground);
      border: 1px solid var(--border-color);
      border-left: 2.5px solid transparent;
      padding: 8px 11px;
      text-align: left;
      cursor: pointer;
      border-radius: 5px;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .action-btn:hover {
      background-color: rgba(128, 128, 128, 0.15);
      border-color: var(--vscode-focusBorder, var(--border-color));
      border-left-color: var(--accent-color);
      transform: translateX(2px);
    }
    .action-btn:active {
      transform: translateX(0);
    }
    .btn-arrow {
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
      opacity: 0.7;
      transition: transform 0.15s, opacity 0.15s;
    }
    .action-btn:hover .btn-arrow {
      opacity: 1;
      transform: translateX(2px);
    }
    .quick-tip {
      background: rgba(117, 190, 255, 0.08);
      border-left: 3px solid #75beff;
      padding: 9px 11px;
      border-radius: 4px;
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      line-height: 1.45;
    }
    .quick-tip strong {
      color: var(--vscode-editor-foreground);
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 10.5px;
      color: var(--vscode-descriptionForeground);
      margin-top: 2px;
    }
    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #73c991;
      box-shadow: 0 0 4px #73c991;
      animation: pulseDot 2s infinite ease-in-out;
    }
    @keyframes pulseDot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }
  </style>
</head>
<body>
  <div class="hero-card">
    <div class="brand-header">
      <img src="${logoUri}" alt="RAGLaB" class="brand-logo" />
      <div>
        <div class="brand-title">RAGLaB Studio</div>
        <div class="brand-subtitle">Pipeline Workbench</div>
      </div>
    </div>
    <div class="hero-desc">Interactive visual workbench for document profiling, intelligent chunk partitioning, and RAG ecosystem analysis.</div>
    <button class="btn-primary" id="btn-open-studio">Launch Visual Workbench</button>
  </div>

  <div class="section">
    <div class="section-title">Document Operations</div>
    <div class="button-group">
      <button class="action-btn" id="btn-analyze-doc">
        <span>Analyze Document Structure</span>
        <span class="btn-arrow">&rarr;</span>
      </button>
      <button class="action-btn" id="btn-chunk-doc">
        <span>Partition &amp; Chunk Document</span>
        <span class="btn-arrow">&rarr;</span>
      </button>
      <button class="action-btn" id="btn-preview-chunks">
        <span>Preview Active Document</span>
        <span class="btn-arrow">&rarr;</span>
      </button>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">Workspace Intelligence</div>
    <div class="button-group">
      <button class="action-btn" id="btn-scan-ws">
        <span>Scan RAG Tech Stack</span>
        <span class="btn-arrow">&rarr;</span>
      </button>
    </div>
  </div>

  <div class="quick-tip">
    <strong>Engineering Guideline:</strong> Maintaining a 10% to 20% overlap across consecutive chunks ensures critical cross-boundary sentences are preserved for vector retrieval.
  </div>

  <div class="status-badge">
    <span class="status-dot"></span>
    <span>RAGLaB Studio Active</span>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    function post(command) {
      vscode.postMessage({ command });
    }
    document.getElementById('btn-open-studio').addEventListener('click', () => post('openDashboard'));
    document.getElementById('btn-analyze-doc').addEventListener('click', () => post('analyzeDocument'));
    document.getElementById('btn-chunk-doc').addEventListener('click', () => post('createChunks'));
    document.getElementById('btn-preview-chunks').addEventListener('click', () => post('previewChunks'));
    document.getElementById('btn-scan-ws').addEventListener('click', () => post('analyzeWorkspace'));
  </script>
</body>
</html>`;
  }
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
