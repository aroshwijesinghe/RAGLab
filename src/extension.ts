import './services/pdfPolyfill';
import * as vscode from 'vscode';
import { analyzeDocumentCommand } from './commands/analyzeDocument';
import { createChunksCommand } from './commands/createChunks';
import { previewChunksCommand } from './commands/previewChunks';
import { analyzeWorkspaceCommand } from './commands/analyzeWorkspace';
import { openDashboardCommand } from './commands/openDashboard';
import { SidebarProvider } from './views/sidebarProvider';

export function activate(context: vscode.ExtensionContext): void {
  console.log('RAGLaB is now active.');

  const extensionUri = context.extensionUri;

  // Register sidebar provider
  const sidebarProvider = new SidebarProvider(extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SidebarProvider.viewType,
      sidebarProvider
    )
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('ragHelper.openDashboard', () =>
      openDashboardCommand(extensionUri)
    ),
    vscode.commands.registerCommand('ragHelper.analyzeDocument', () =>
      analyzeDocumentCommand(extensionUri)
    ),
    vscode.commands.registerCommand('ragHelper.createChunks', () =>
      createChunksCommand(extensionUri)
    ),
    vscode.commands.registerCommand('ragHelper.previewChunks', () =>
      previewChunksCommand(extensionUri)
    ),
    vscode.commands.registerCommand('ragHelper.analyzeWorkspace', () =>
      analyzeWorkspaceCommand(extensionUri)
    )
  );
}

export function deactivate(): void {
  // Cleanup resources if needed
}
