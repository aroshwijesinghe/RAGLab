/**
 * File system utilities for RAGLaB.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { SupportedFileType, SUPPORTED_EXTENSIONS, ExtensionConfig } from '../models/types';

/**
 * Check if a file extension is supported.
 */
export function isSupportedFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(ext);
}

/**
 * Get the file extension as a SupportedFileType.
 * @throws if the extension is not supported.
 */
export function getFileType(filePath: string): SupportedFileType {
  const ext = path.extname(filePath).toLowerCase() as SupportedFileType;
  if (!(SUPPORTED_EXTENSIONS as readonly string[]).includes(ext)) {
    throw new Error(`Unsupported file type: ${ext}. Supported types: ${SUPPORTED_EXTENSIONS.join(', ')}`);
  }
  return ext;
}

export interface DocumentContentResult {
  content: string;
}

/**
 * Read document content from disk as UTF-8 text.
 * Validates file size against the configured maximum.
 */
export async function readDocumentContent(filePath: string, maxSizeBytes: number): Promise<DocumentContentResult> {
  const stats = await fs.promises.stat(filePath);
  if (stats.size > maxSizeBytes) {
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    const maxMB = (maxSizeBytes / (1024 * 1024)).toFixed(2);
    throw new Error(
      `File is too large (${sizeMB} MB). Maximum allowed size is ${maxMB} MB. ` +
      `You can change this in Settings -> RAGLaB -> Max File Size.`
    );
  }

  const content = await fs.promises.readFile(filePath, 'utf-8');
  return { content };
}

/**
 * Read a text or document file and return its extracted text content.
 * Validates file size against the configured maximum.
 */
export async function readTextFile(filePath: string, maxSizeBytes: number): Promise<string> {
  const result = await readDocumentContent(filePath, maxSizeBytes);
  return result.content;
}

/**
 * Get the file size in bytes.
 */
export async function getFileSize(filePath: string): Promise<number> {
  const stats = await fs.promises.stat(filePath);
  return stats.size;
}

/**
 * Get the extension configuration from VS Code settings.
 */
export function getExtensionConfig(): ExtensionConfig {
  const config = vscode.workspace.getConfiguration('ragHelper');
  return {
    defaultChunkSize: config.get<number>('defaultChunkSize', 500),
    defaultChunkOverlap: config.get<number>('defaultChunkOverlap', 50),
    showNotifications: config.get<boolean>('showNotifications', true),
    maxFileSize: config.get<number>('maxFileSize', 5242880),
  };
}

/**
 * Prompt the user to select a supported file.
 */
export async function promptForFile(): Promise<string | undefined> {
  const filters: Record<string, string[]> = {
    'Supported Text Documents': ['md', 'txt', 'json', 'csv'],
    'Markdown Files': ['md'],
    'Text Files': ['txt'],
    'JSON Files': ['json'],
    'CSV Files': ['csv'],
    'All Files': ['*'],
  };

  const uris = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    filters,
    title: 'Select a document to analyze',
  });

  if (!uris || uris.length === 0) return undefined;
  return uris[0].fsPath;
}

/** Directories to exclude from workspace scanning */
export const EXCLUDED_DIRECTORIES: readonly string[] = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'out',
  '.vscode-test',
  '__pycache__',
  '.mypy_cache',
  '.pytest_cache',
  'venv',
  '.venv',
  'env',
  '.env',
  '.tox',
  'coverage',
  '.nyc_output',
  '.next',
  '.nuxt',
  'vendor',
] as const;
