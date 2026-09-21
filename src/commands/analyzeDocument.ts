import * as vscode from 'vscode';
import { getExtensionConfig, promptForFile, isSupportedFile } from '../utils/fileUtils';
import { analyzeDocument } from '../services/documentAnalyzer';
import { formatNumber } from '../utils/textUtils';
import { DashboardPanel } from '../webview/dashboardPanel';

let outputChannel: vscode.OutputChannel | undefined;

export async function analyzeDocumentCommand(extensionUri?: vscode.Uri): Promise<void> {
  try {
    const config = getExtensionConfig();
    let filePath: string | undefined;

    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && isSupportedFile(activeEditor.document.uri.fsPath)) {
      filePath = activeEditor.document.uri.fsPath;
    } else {
      filePath = await promptForFile();
    }

    if (!filePath) {
      return;
    }

    if (!isSupportedFile(filePath)) {
      vscode.window.showErrorMessage('Selected file type is not supported. Supported: .txt, .md, .json, .csv');
      return;
    }

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'RAGLaB: Analyzing document...',
        cancellable: false
      },
      async () => {
        if (!filePath) return;
        const analysis = await analyzeDocument(filePath, config.maxFileSize);

        // Always log clean output for developers who check terminal/output
        if (!outputChannel) {
          outputChannel = vscode.window.createOutputChannel('RAGLaB');
        }

        outputChannel.clear();
        outputChannel.appendLine('════════════════════════════════════════════════════');
        outputChannel.appendLine('  RAGLaB: Document Analysis');
        outputChannel.appendLine('════════════════════════════════════════════════════');
        outputChannel.appendLine('');
        outputChannel.appendLine(`  File:               ${analysis.fileName}`);
        outputChannel.appendLine(`  Type:               ${analysis.fileType}`);
        outputChannel.appendLine(`  Size:               ${analysis.fileSizeFormatted}`);
        outputChannel.appendLine('');
        outputChannel.appendLine(`  Characters:         ${formatNumber(analysis.characterCount)}`);
        outputChannel.appendLine(`  Words:              ${formatNumber(analysis.wordCount)}`);
        outputChannel.appendLine(`  Lines:              ${formatNumber(analysis.lineCount)}`);
        outputChannel.appendLine(`  Empty Lines:        ${formatNumber(analysis.emptyLineCount)}`);
        outputChannel.appendLine('');
        outputChannel.appendLine(`  Estimated Tokens:   ~${formatNumber(analysis.estimatedTokenCount)}`);
        outputChannel.appendLine(`  Avg Words/Line:     ${analysis.averageWordsPerLine.toFixed(2)}`);
        outputChannel.appendLine('');
        outputChannel.appendLine('  * Token count is an approximation (words × 1.3).');
        outputChannel.appendLine('    Actual counts vary by tokenizer.');
        outputChannel.appendLine('════════════════════════════════════════════════════');

        // Open the interactive GUI Studio with this document loaded
        if (extensionUri) {
          DashboardPanel.createOrShow(extensionUri, {
            activeTab: 'document',
            documentAnalysis: analysis,
          });
        } else {
          outputChannel.show();
        }

        if (config.showNotifications) {
          vscode.window.showInformationMessage(`RAGLaB: Analyzed ${analysis.fileName}`);
        }
      }
    );
  } catch (error: any) {
    vscode.window.showErrorMessage(`RAGLaB Analysis failed: ${error.message || String(error)}`);
  }
}
