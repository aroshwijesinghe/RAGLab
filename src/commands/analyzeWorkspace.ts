import * as vscode from 'vscode';
import { analyzeWorkspace } from '../services/workspaceAnalyzer';
import { DashboardPanel } from '../webview/dashboardPanel';

let outputChannel: vscode.OutputChannel | undefined;

export async function analyzeWorkspaceCommand(extensionUri?: vscode.Uri): Promise<void> {
  try {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('RAGLaB: No workspace folder is open.');
      return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'RAGLaB: Scanning workspace for RAG stack...',
        cancellable: false
      },
      async () => {
        const analysis = await analyzeWorkspace(rootPath);

        if (!outputChannel) {
          outputChannel = vscode.window.createOutputChannel('RAGLaB');
        }

        outputChannel.clear();
        outputChannel.appendLine('════════════════════════════════════════════════════');
        outputChannel.appendLine('  RAGLaB: Workspace Analysis');
        outputChannel.appendLine('════════════════════════════════════════════════════');
        outputChannel.appendLine('');
        outputChannel.appendLine(`  Project:  ${analysis.projectName}`);
        outputChannel.appendLine(`  Root:     ${analysis.rootPath}`);
        outputChannel.appendLine('');
        outputChannel.appendLine('  Detected Technologies:');
        
        const detected = analysis.technologies.filter(t => t.detected);
        const notDetected = analysis.technologies.filter(t => !t.detected);

        if (detected.length === 0) {
          outputChannel.appendLine('  (None)');
        } else {
          detected.forEach(t => {
            outputChannel.appendLine(`  ✓ ${t.name.padEnd(25)} (${t.source || 'detected'})`);
          });
        }

        outputChannel.appendLine('');
        outputChannel.appendLine('  Not Detected:');
        if (notDetected.length === 0) {
          outputChannel.appendLine('  (None)');
        } else {
          notDetected.forEach(t => {
            outputChannel.appendLine(`  ○ ${t.name}`);
          });
        }

        outputChannel.appendLine('');
        outputChannel.appendLine('  RAG Directories:');
        if (analysis.ragDirectories.length === 0) {
          outputChannel.appendLine('  (None)');
        } else {
          analysis.ragDirectories.forEach(d => {
            outputChannel.appendLine(`  ✓ ${d.name}/`);
          });
        }

        outputChannel.appendLine('');
        const assessment = analysis.isLikelyRagProject 
          ? '🟢 This project contains components of a RAG pipeline.' 
          : '⚪ This does not appear to have an active RAG stack.';
        outputChannel.appendLine(`  Assessment: ${assessment}`);
        outputChannel.appendLine('════════════════════════════════════════════════════');

        // Open RAGLaB Studio Webview directly on the workspace tab
        if (extensionUri) {
          DashboardPanel.createOrShow(extensionUri, {
            activeTab: 'workspace',
            workspaceAnalysis: analysis,
          });
        } else {
          outputChannel.show();
        }
      }
    );
  } catch (error: any) {
    vscode.window.showErrorMessage(`RAGLaB workspace analysis failed: ${error.message || String(error)}`);
  }
}
