/**
 * Core types for the RAGLaB extension.
 */

/** Supported document file types */
export type SupportedFileType = '.txt' | '.md' | '.json' | '.csv' | '.pdf';

/** List of all supported file extensions */
export const SUPPORTED_EXTENSIONS: readonly SupportedFileType[] = ['.txt', '.md', '.json', '.csv', '.pdf'] as const;

/** Maximum file size labels for display */
export const FILE_SIZE_LABELS: Record<string, string> = {
  bytes: 'B',
  kilobytes: 'KB',
  megabytes: 'MB',
};

/** Result of analyzing a document */
export interface DocumentAnalysis {
  /** Original file name */
  fileName: string;
  /** File path */
  filePath: string;
  /** File extension */
  fileType: SupportedFileType;
  /** File size in bytes */
  fileSizeBytes: number;
  /** Formatted file size string */
  fileSizeFormatted: string;
  /** Total character count */
  characterCount: number;
  /** Total word count */
  wordCount: number;
  /** Total line count */
  lineCount: number;
  /** Estimated token count (approximation) */
  estimatedTokenCount: number;
  /** Average words per line */
  averageWordsPerLine: number;
  /** Number of empty lines */
  emptyLineCount: number;
  /** Raw text content */
  content: string;
  /** Total page count (for PDF documents) */
  pageCount?: number;
}

/** Supported chunking strategies */
export type ChunkStrategy = 'boundary' | 'markdown' | 'parent_document';

/** Configuration for text chunking */
export interface ChunkConfig {
  /** Target chunk size in characters */
  chunkSize: number;
  /** Number of characters to overlap between chunks */
  overlap: number;
  /** Selected chunking strategy (defaults to 'boundary') */
  strategy?: ChunkStrategy;
  /** Parent chunk target size in characters (for parent_document strategy) */
  parentChunkSize?: number;
}

/** A single text chunk */
export interface TextChunk {
  /** Chunk index (0-based) */
  index: number;
  /** The chunk text content */
  content: string;
  /** Character count of this chunk */
  characterCount: number;
  /** Word count of this chunk */
  wordCount: number;
  /** Estimated token count */
  estimatedTokenCount: number;
  /** Start position in original document (character offset) */
  startOffset: number;
  /** End position in original document (character offset) */
  endOffset: number;
  /** Chunking strategy used */
  strategy?: ChunkStrategy;
  /** Hierarchical breadcrumb path (e.g. Document > Section > Subsection) */
  breadcrumb?: string;
  /** Parent chunk index if this is a child chunk */
  parentId?: number;
  /** Full parent chunk content for LLM prompt context */
  parentContent?: string;
  /** Whether this chunk was kept intact as an atomic structural unit */
  isAtomic?: boolean;
  /** Type of atomic block if isAtomic is true */
  atomicType?: 'table' | 'code' | 'heading' | 'none';
}

/** Result of chunking a document */
export interface ChunkResult {
  /** Source document info */
  fileName: string;
  /** Chunking configuration used */
  config: ChunkConfig;
  /** Generated chunks (or child search units in parent_document strategy) */
  chunks: TextChunk[];
  /** Parent context chunks (when parent_document strategy is used) */
  parentChunks?: TextChunk[];
  /** Warnings generated during chunking */
  warnings: ChunkWarning[];
}

/** Warning severity levels */
export type WarningSeverity = 'info' | 'warning' | 'error';

/** A warning about chunking quality */
export interface ChunkWarning {
  /** Warning severity */
  severity: WarningSeverity;
  /** Warning message */
  message: string;
  /** Optional chunk index this warning relates to */
  chunkIndex?: number;
}

/** Statistics for a set of chunks */
export interface ChunkStatistics {
  /** Total number of chunks */
  totalChunks: number;
  /** Average character count per chunk */
  averageCharacters: number;
  /** Minimum character count */
  minCharacters: number;
  /** Maximum character count */
  maxCharacters: number;
  /** Average estimated tokens per chunk */
  averageEstimatedTokens: number;
  /** Minimum estimated tokens */
  minEstimatedTokens: number;
  /** Maximum estimated tokens */
  maxEstimatedTokens: number;
  /** Average word count per chunk */
  averageWords: number;
  /** Minimum word count */
  minWords: number;
  /** Maximum word count */
  maxWords: number;
}

/** Detected technology in workspace analysis */
export interface DetectedTechnology {
  /** Technology name */
  name: string;
  /** Whether it was detected */
  detected: boolean;
  /** Where it was detected (file path) */
  source?: string;
  /** Category of the technology */
  category: TechnologyCategory;
}

/** Categories of RAG-related technologies */
export type TechnologyCategory =
  | 'language'
  | 'framework'
  | 'embedding'
  | 'vectordb'
  | 'orchestration'
  | 'other';

/** A detected RAG-related directory */
export interface DetectedDirectory {
  /** Directory name */
  name: string;
  /** Full path */
  path: string;
  /** Purpose description */
  purpose: string;
}

/** Result of workspace analysis */
export interface WorkspaceAnalysis {
  /** Workspace/project name */
  projectName: string;
  /** Workspace root path */
  rootPath: string;
  /** Detected technologies */
  technologies: DetectedTechnology[];
  /** Detected RAG-related directories */
  ragDirectories: DetectedDirectory[];
  /** Whether this appears to be a RAG project */
  isLikelyRagProject: boolean;
}

/** Extension configuration from VS Code settings */
export interface ExtensionConfig {
  defaultChunkSize: number;
  defaultChunkOverlap: number;
  showNotifications: boolean;
  maxFileSize: number;
}
