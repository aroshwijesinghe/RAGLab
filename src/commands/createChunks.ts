import * as vscode from 'vscode';
import * as fs from 'fs';
import { getExtensionConfig, promptForFile, isSupportedFile } from '../utils/fileUtils';
import { createChunkResult } from '../services/chunkingService';
import { calculateChunkStatistics } from '../services/statisticsService';
import { DashboardPanel } from '../webview/dashboardPanel';
import { ChunkViewerPanel } from '../webview/chunkViewerPanel';

export async function createChunksCommand(extensionUri: vscode.Uri): Promise<void> {
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

    const sizeInput = await vscode.window.showInputBox({
      prompt: 'Chunk size in characters',
      value: String(config.defaultChunkSize),
      validateInput: (value) => {
        const num = parseInt(value, 10);
        if (isNaN(num) || num <= 0) return 'Chunk size must be a positive number.';
        if (num < 10) return 'Chunk size must be at least 10.';
        return null;
      },
    });

    if (!sizeInput) return;

    const overlapInput = await vscode.window.showInputBox({
      prompt: 'Chunk overlap in characters',
      value: String(config.defaultChunkOverlap),
      validateInput: (value) => {
        const num = parseInt(value, 10);
        if (isNaN(num) || num < 0) return 'Chunk overlap must be a non-negative number.';
        if (num >= parseInt(sizeInput, 10)) return 'Overlap must be less than chunk size.';
        return null;
      },
    });

    if (!overlapInput) return;

    const chunkSize = parseInt(sizeInput, 10);
    const overlap = parseInt(overlapInput, 10);

    const content = await fs.promises.readFile(filePath, 'utf8');
    const fileName = vscode.Uri.file(filePath).path.split('/').pop() || 'unknown';

    const chunkConfig = { chunkSize, overlap };
    const chunkResult = createChunkResult(fileName, content, chunkConfig);
    const statistics = calculateChunkStatistics(chunkResult.chunks);

    // Open directly in the interactive RAGLaB Studio
    DashboardPanel.createOrShow(extensionUri, {
      activeTab: 'chunking',
      chunkResult,
      chunkStatistics: statistics,
    });

    // Also support focused standalone viewer if opened separately
    ChunkViewerPanel.createOrShow(extensionUri, chunkResult, statistics);

    if (config.showNotifications) {
      vscode.window.showInformationMessage(`RAGLaB: Generated ${chunkResult.chunks.length} chunks for ${fileName}`);
    }
  } catch (error: any) {
    vscode.window.showErrorMessage(`RAGLaB failed to create chunks: ${error.message || String(error)}`);
  }
}
