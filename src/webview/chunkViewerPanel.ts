import * as vscode from 'vscode';
import { ChunkResult, ChunkStatistics } from '../models/types';
import { getChunkViewerHtml } from './templates/chunkViewer';

export class ChunkViewerPanel {
  public static currentPanel: ChunkViewerPanel | undefined;
  private static readonly viewType = 'ragHelper.chunkViewer';
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(
    extensionUri: vscode.Uri,
    chunkResult: ChunkResult,
    statistics: ChunkStatistics
  ): void {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (ChunkViewerPanel.currentPanel) {
      ChunkViewerPanel.currentPanel._update(chunkResult, statistics);
      ChunkViewerPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      ChunkViewerPanel.viewType,
      'RAG Chunk Viewer',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [extensionUri],
      }
    );

    ChunkViewerPanel.currentPanel = new ChunkViewerPanel(panel, chunkResult, statistics);
  }

  private constructor(
    panel: vscode.WebviewPanel,
    chunkResult: ChunkResult,
    statistics: ChunkStatistics
  ) {
    this._panel = panel;
    this._update(chunkResult, statistics);
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    
    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'copy':
            await vscode.env.clipboard.writeText(message.text);
            vscode.window.showInformationMessage('Copied to clipboard!');
            break;
          case 'showInfo':
            vscode.window.showInformationMessage(message.text);
            break;
        }
      },
      null,
      this._disposables
    );
  }

  private _update(chunkResult: ChunkResult, statistics: ChunkStatistics): void {
    const webview = this._panel.webview;
    const nonce = getNonce();
    this._panel.title = 'RAG Chunk Viewer';
    this._panel.webview.html = getChunkViewerHtml(nonce, webview.cspSource, chunkResult, statistics);
  }

  public dispose(): void {
    ChunkViewerPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const d = this._disposables.pop();
      if (d) d.dispose();
    }
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
