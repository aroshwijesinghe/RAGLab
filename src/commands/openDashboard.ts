import * as vscode from 'vscode';
import { DashboardPanel } from '../webview/dashboardPanel';

export async function openDashboardCommand(extensionUri: vscode.Uri): Promise<void> {
  try {
    DashboardPanel.createOrShow(extensionUri);
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to open dashboard: ${error.message || String(error)}`);
  }
}
