import * as vscode from 'vscode';
import * as path from 'path';
import { getDashboardHtml, DashboardInitialState } from './templates/dashboard';
import { promptForFile, isSupportedFile, getExtensionConfig } from '../utils/fileUtils';
import { analyzeDocument } from '../services/documentAnalyzer';
import { createChunkResult } from '../services/chunkingService';
import { calculateChunkStatistics } from '../services/statisticsService';
import { analyzeWorkspace } from '../services/workspaceAnalyzer';
import { countWords, countLines, countEmptyLines, estimateTokenCount, averageWordsPerLine, formatFileSize } from '../utils/textUtils';
import { DocumentAnalysis, ChunkStrategy } from '../models/types';

export class DashboardPanel {
  public static currentPanel: DashboardPanel | undefined;
  private static readonly viewType = 'ragHelper.dashboard';
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(
    extensionUri: vscode.Uri,
    initialState?: DashboardInitialState
  ): DashboardPanel {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (DashboardPanel.currentPanel) {
      DashboardPanel.currentPanel._panel.reveal(column);
      if (initialState) {
        DashboardPanel.currentPanel.sendInitialState(initialState);
      }
      return DashboardPanel.currentPanel;
    }

    const panel = vscode.window.createWebviewPanel(
      DashboardPanel.viewType,
      'RAGLaB Studio',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [extensionUri],
      }
    );

    DashboardPanel.currentPanel = new DashboardPanel(panel, extensionUri, initialState);
    return DashboardPanel.currentPanel;
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    initialState?: DashboardInitialState
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    const config = getExtensionConfig();
    const mergedState: DashboardInitialState = {
      defaultChunkSize: config.defaultChunkSize,
      defaultChunkOverlap: config.defaultChunkOverlap,
      ...initialState,
    };

    this._update(mergedState);
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        await this._handleMessage(message);
      },
      null,
      this._disposables
    );
  }

  public sendInitialState(state: DashboardInitialState): void {
    if (state.activeTab) {
      this._panel.webview.postMessage({ type: 'switchTab', tab: state.activeTab });
    }
    if (state.documentAnalysis) {
      this._panel.webview.postMessage({ type: 'documentAnalyzed', payload: state.documentAnalysis });
    }
    if (state.chunkResult && state.chunkStatistics) {
      this._panel.webview.postMessage({
        type: 'chunkingCompleted',
        payload: { chunkResult: state.chunkResult, statistics: state.chunkStatistics },
      });
    }
    if (state.workspaceAnalysis) {
      this._panel.webview.postMessage({
        type: 'workspaceScanned',
        payload: state.workspaceAnalysis,
      });
    }
  }

  private async _handleMessage(message: any): Promise<void> {
    const config = getExtensionConfig();

    switch (message.command) {
      case 'requestSelectFile': {
        const filePath = await promptForFile();
        if (!filePath) return;
        if (!isSupportedFile(filePath)) {
          vscode.window.showErrorMessage('Selected file type is not supported. Supported text formats: Markdown (.md), Plain Text (.txt), JSON (.json), and CSV (.csv).');
          return;
        }
        try {
          const analysis = await analyzeDocument(filePath, config.maxFileSize);
          this._panel.webview.postMessage({ type: 'documentAnalyzed', payload: analysis });
          if (config.showNotifications) {
            vscode.window.showInformationMessage(`Loaded ${analysis.fileName} into RAGLaB Studio.`);
          }
        } catch (err: any) {
          vscode.window.showErrorMessage(`Failed to analyze ${path.basename(filePath)}: ${err.message || String(err)}`);
        }
        break;
      }

      case 'requestLoadActiveEditor': {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
          vscode.window.showWarningMessage('No active editor document open in VS Code.');
          return;
        }
        const filePath = activeEditor.document.uri.fsPath;
        if (filePath && isSupportedFile(filePath)) {
          try {
            const analysis = await analyzeDocument(filePath, config.maxFileSize);
            this._panel.webview.postMessage({ type: 'documentAnalyzed', payload: analysis });
            if (config.showNotifications) {
              vscode.window.showInformationMessage(`Loaded ${analysis.fileName} from editor.`);
            }
          } catch (err: any) {
            vscode.window.showErrorMessage(`Error reading editor document: ${err.message || String(err)}`);
          }
        } else {
          // If untitled or unsupported file, take the text directly
          const text = activeEditor.document.getText();
          const fileName = path.basename(activeEditor.document.uri.fsPath || 'untitled.txt');
          const analysis: DocumentAnalysis = {
            fileName,
            filePath: activeEditor.document.uri.fsPath || 'untitled.txt',
            fileType: '.txt',
            fileSizeBytes: Buffer.byteLength(text, 'utf8'),
            fileSizeFormatted: formatFileSize(Buffer.byteLength(text, 'utf8')),
            characterCount: text.length,
            wordCount: countWords(text),
            lineCount: countLines(text),
            estimatedTokenCount: estimateTokenCount(text),
            averageWordsPerLine: averageWordsPerLine(text),
            emptyLineCount: countEmptyLines(text),
            content: text,
          };
          this._panel.webview.postMessage({ type: 'documentAnalyzed', payload: analysis });
        }
        break;
      }

      case 'requestAnalyzeText': {
        const text: string = message.text || '';
        const fileName: string = message.fileName || 'scratchpad.txt';
        const bytes = Buffer.byteLength(text, 'utf8');
        const analysis: DocumentAnalysis = {
          fileName,
          filePath: fileName,
          fileType: '.txt',
          fileSizeBytes: bytes,
          fileSizeFormatted: formatFileSize(bytes),
          characterCount: text.length,
          wordCount: countWords(text),
          lineCount: countLines(text),
          estimatedTokenCount: estimateTokenCount(text),
          averageWordsPerLine: averageWordsPerLine(text),
          emptyLineCount: countEmptyLines(text),
          content: text,
        };
        this._panel.webview.postMessage({ type: 'documentAnalyzed', payload: analysis });
        break;
      }

      case 'requestAnalyzeDroppedFile': {
        const fileName: string = message.fileName || 'document.txt';
        const text: string = message.text || '';
        const ext = path.extname(fileName).toLowerCase();

        if (!isSupportedFile(fileName)) {
          vscode.window.showErrorMessage(
            `Unsupported format: "${fileName}". Please provide text-based documents: Markdown (.md), Plain Text (.txt), JSON (.json), or CSV (.csv).`
          );
          return;
        }

        const bytes = Buffer.byteLength(text, 'utf8');
        const analysis: DocumentAnalysis = {
          fileName,
          filePath: fileName,
          fileType: ext as any,
          fileSizeBytes: bytes,
          fileSizeFormatted: formatFileSize(bytes),
          characterCount: text.length,
          wordCount: countWords(text),
          lineCount: countLines(text),
          estimatedTokenCount: estimateTokenCount(text),
          averageWordsPerLine: averageWordsPerLine(text),
          emptyLineCount: countEmptyLines(text),
          content: text,
        };
        this._panel.webview.postMessage({ type: 'documentAnalyzed', payload: analysis });
        if (config.showNotifications) {
          vscode.window.showInformationMessage(`Loaded dropped text document ${fileName} into RAGLaB Studio.`);
        }
        break;
      }

      case 'requestChunking': {
        const text: string = message.text || '';
        const fileName: string = message.fileName || 'document.txt';
        const chunkSize: number = message.chunkSize || config.defaultChunkSize;
        const overlap: number = message.overlap ?? config.defaultChunkOverlap;
        const strategy: ChunkStrategy = message.strategy || 'boundary';
        const parentChunkSize: number | undefined = message.parentChunkSize;

        const chunkResult = createChunkResult(fileName, text, {
          chunkSize,
          overlap,
          strategy,
          parentChunkSize,
        });
        const statistics = calculateChunkStatistics(chunkResult.chunks);

        this._panel.webview.postMessage({
          type: 'chunkingCompleted',
          payload: { chunkResult, statistics },
        });
        break;
      }

      case 'requestWorkspaceScan': {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
          vscode.window.showWarningMessage('No workspace folder open in VS Code.');
          return;
        }
        try {
          const rootPath = workspaceFolders[0].uri.fsPath;
          const analysis = await analyzeWorkspace(rootPath);
          this._panel.webview.postMessage({
            type: 'workspaceScanned',
            payload: analysis,
          });
          if (config.showNotifications) {
            vscode.window.showInformationMessage(`RAG Workspace scan complete for ${analysis.projectName}.`);
          }
        } catch (err: any) {
          vscode.window.showErrorMessage(`Workspace scan failed: ${err.message || String(err)}`);
        }
        break;
      }

      case 'copy': {
        const textToCopy = message.text || '';
        const label = message.label || 'Text';
        await vscode.env.clipboard.writeText(textToCopy);
        vscode.window.showInformationMessage(`Copied ${label} to clipboard!`);
        break;
      }

      case 'requestSaveChunksFile': {
        const chunksJson: string = message.jsonContent || '';
        const suggestedName = (message.fileName ? message.fileName.replace(/\.[^.]+$/, '') : 'document') + '.chunks.json';
        const saveUri = await vscode.window.showSaveDialog({
          defaultUri: vscode.Uri.file(suggestedName),
          filters: { 'JSON Files': ['json'], 'All Files': ['*'] },
          title: 'Save Chunks Dataset to JSON File'
        });
        if (saveUri) {
          await vscode.workspace.fs.writeFile(saveUri, Buffer.from(chunksJson, 'utf8'));
          vscode.window.showInformationMessage(`RAGLaB: Successfully saved chunks to ${path.basename(saveUri.fsPath)}!`);
        }
        break;
      }

      case 'openGuidelines': {
        const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (rootPath) {
          const guideUri = vscode.Uri.file(path.join(rootPath, 'GUIDELINES.md'));
          try {
            await vscode.commands.executeCommand('markdown.showPreview', guideUri);
          } catch {
            await vscode.window.showTextDocument(guideUri);
          }
        }
        break;
      }

      // Legacy command redirects from older buttons if any
      case 'analyzeDocument':
        await vscode.commands.executeCommand('ragHelper.analyzeDocument');
        break;
      case 'createChunks':
        await vscode.commands.executeCommand('ragHelper.createChunks');
        break;
      case 'analyzeWorkspace':
        await vscode.commands.executeCommand('ragHelper.analyzeWorkspace');
        break;
    }
  }

  private _update(initialState?: DashboardInitialState): void {
    const webview = this._panel.webview;
    const nonce = getNonce();
    const logoUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources', 'logo.png')).toString();
    this._panel.title = 'RAGLaB Studio';
    this._panel.webview.html = getDashboardHtml(nonce, webview.cspSource, initialState, logoUri);
  }

  public dispose(): void {
    DashboardPanel.currentPanel = undefined;
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
