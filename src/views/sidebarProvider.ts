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

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RAGLaB Studio</title>
  <style nonce="${nonce}">
    :root {
      --border-color: var(--vscode-panel-border, rgba(128, 128, 128, 0.2));
    }
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-editor-foreground);
      background-color: var(--vscode-sideBar-background, var(--vscode-editor-background));
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      font-size: 12px;
    }
    .hero-card {
      background: var(--vscode-editor-background);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .hero-title {
      font-weight: 700;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .hero-desc {
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
      line-height: 1.4;
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
      gap: 6px;
      width: 100%;
      transition: background-color 0.15s;
    }
    .btn-primary:hover {
      background-color: var(--vscode-button-hoverBackground);
    }
    .section-title {
      font-size: 11px;
      font-weight: 600;
      color: var(--vscode-sideBarTitle-foreground, var(--vscode-descriptionForeground));
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .button-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .action-btn {
      background-color: rgba(128, 128, 128, 0.08);
      color: var(--vscode-editor-foreground);
      border: 1px solid var(--border-color);
      padding: 7px 10px;
      text-align: left;
      cursor: pointer;
      border-radius: 4px;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.15s;
    }
    .action-btn:hover {
      background-color: rgba(128, 128, 128, 0.16);
      border-color: var(--vscode-focusBorder, var(--border-color));
    }
    .quick-tip {
      background: rgba(117, 190, 255, 0.08);
      border-left: 3px solid #75beff;
      padding: 8px 10px;
      border-radius: 3px;
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="hero-card">
    <div class="hero-title">🧪 RAGLaB Studio</div>
    <div class="hero-desc">Interactive workbench for document inspection, smart chunking, and RAG technology analysis.</div>
    <button class="btn-primary" id="btn-open-studio">🚀 Open Full Studio</button>
  </div>

  <div class="section">
    <div class="section-title">Documents</div>
    <div class="button-group">
      <button class="action-btn" id="btn-analyze-doc">📄 Analyze Document</button>
      <button class="action-btn" id="btn-chunk-doc">🔪 Create Chunks</button>
      <button class="action-btn" id="btn-preview-chunks">⚡ Quick Preview Active File</button>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">Workspace</div>
    <div class="button-group">
      <button class="action-btn" id="btn-scan-ws">🔍 Scan RAG Technologies</button>
    </div>
  </div>

  <div class="quick-tip">
    💡 <strong>Pro-Tip:</strong> Use 10-20% chunk overlap to keep sentence boundaries intact across chunk cuts.
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
