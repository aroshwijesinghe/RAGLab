import * as vscode from 'vscode';
import { getExtensionConfig } from '../utils/fileUtils';
import { createChunkResult } from '../services/chunkingService';
import { calculateChunkStatistics } from '../services/statisticsService';
import { DashboardPanel } from '../webview/dashboardPanel';
import { ChunkViewerPanel } from '../webview/chunkViewerPanel';

export async function previewChunksCommand(extensionUri: vscode.Uri): Promise<void> {
  try {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      vscode.window.showErrorMessage('RAGLaB: No active text editor found.');
      return;
    }

    const config = getExtensionConfig();
    const content = activeEditor.document.getText();
    const fileName = activeEditor.document.fileName.split('/').pop()?.split('\\').pop() || 'unknown';

    const chunkConfig = {
      chunkSize: config.defaultChunkSize,
      overlap: config.defaultChunkOverlap
    };

    const chunkResult = createChunkResult(fileName, content, chunkConfig);
    const statistics = calculateChunkStatistics(chunkResult.chunks);

    // Open directly in the interactive RAGLaB Studio
    DashboardPanel.createOrShow(extensionUri, {
      activeTab: 'chunking',
      chunkResult,
      chunkStatistics: statistics,
    });

    ChunkViewerPanel.createOrShow(extensionUri, chunkResult, statistics);

    if (config.showNotifications) {
      vscode.window.showInformationMessage(`RAGLaB: Generated preview with ${chunkResult.chunks.length} chunks.`);
    }
  } catch (error: any) {
    vscode.window.showErrorMessage(`RAGLaB: Failed to preview chunks: ${error.message || String(error)}`);
  }
}
