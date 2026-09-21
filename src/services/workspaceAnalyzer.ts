import * as fs from 'fs/promises';
import * as path from 'path';
import {
    WorkspaceAnalysis,
    DetectedTechnology,
    DetectedDirectory,
    TechnologyCategory
} from '../models/types';
import { EXCLUDED_DIRECTORIES } from '../utils/fileUtils';

export async function analyzeWorkspace(rootPath: string): Promise<WorkspaceAnalysis> {
    const projectName = path.basename(rootPath);
    const technologies: DetectedTechnology[] = [];
    const ragDirectories: DetectedDirectory[] = [];

    // Check files for language
    let isPython = false;
    let isTypeScript = false;

    try {
        const files = await fs.readdir(rootPath);
        
        // Language detection
        if (files.includes('requirements.txt') || files.includes('pyproject.toml') || files.includes('setup.py') || files.includes('Pipfile') || files.some(f => f.endsWith('.py'))) {
            isPython = true;
            technologies.push({ name: 'Python', detected: true, source: 'root', category: 'language' });
        }
        if (files.includes('package.json') || files.includes('tsconfig.json')) {
            isTypeScript = true;
            technologies.push({ name: 'JavaScript/TypeScript', detected: true, source: 'root', category: 'language' });
        }

        // Dependency reading
        let requirementsTxt = '';
        if (files.includes('requirements.txt')) {
            requirementsTxt = await fs.readFile(path.join(rootPath, 'requirements.txt'), 'utf8');
        }

        let packageJson: any = null;
        if (files.includes('package.json')) {
            try {
                const pkgContent = await fs.readFile(path.join(rootPath, 'package.json'), 'utf8');
                packageJson = JSON.parse(pkgContent);
            } catch (e) {
                // Ignore parse errors
            }
        }

        let pyprojectToml = '';
        if (files.includes('pyproject.toml')) {
            pyprojectToml = await fs.readFile(path.join(rootPath, 'pyproject.toml'), 'utf8');
        }

        const checkPythonDep = (name: string) => {
            const lines = requirementsTxt.split('\n');
            const inReq = lines.some(line => line.toLowerCase().startsWith(name) || line.toLowerCase().includes(name));
            const inToml = pyprojectToml.includes(name);
            return inReq || inToml;
        };

        const checkNodeDep = (name: string) => {
            if (!packageJson) return false;
            const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
            return !!deps[name];
        };

        const checkDep = (pythonName: string, nodeName?: string) => {
            return checkPythonDep(pythonName) || (nodeName ? checkNodeDep(nodeName) : checkNodeDep(pythonName));
        };

        // Frameworks
        const fastapi = checkDep('fastapi');
        technologies.push({ name: 'FastAPI', detected: fastapi, source: fastapi ? 'dependency file' : undefined, category: 'framework' });
        const flask = checkDep('flask');
        technologies.push({ name: 'Flask', detected: flask, source: flask ? 'dependency file' : undefined, category: 'framework' });
        const express = checkNodeDep('express');
        technologies.push({ name: 'Express', detected: express, source: express ? 'package.json' : undefined, category: 'framework' });

        // Orchestration
        const langchain = checkDep('langchain');
        technologies.push({ name: 'LangChain', detected: langchain, source: langchain ? 'dependency file' : undefined, category: 'orchestration' });
        const llamaindex = checkPythonDep('llama-index') || checkPythonDep('llama_index');
        technologies.push({ name: 'LlamaIndex', detected: llamaindex, source: llamaindex ? 'dependency file' : undefined, category: 'orchestration' });
        const haystack = checkPythonDep('farm-haystack') || checkPythonDep('haystack-ai');
        technologies.push({ name: 'Haystack', detected: haystack, source: haystack ? 'dependency file' : undefined, category: 'orchestration' });

        // Embeddings
        const sentenceTransformers = checkPythonDep('sentence-transformers');
        technologies.push({ name: 'Sentence Transformers', detected: sentenceTransformers, source: sentenceTransformers ? 'dependency file' : undefined, category: 'embedding' });
        const openaiEmb = checkDep('openai');
        technologies.push({ name: 'OpenAI Embeddings', detected: openaiEmb, source: openaiEmb ? 'dependency file' : undefined, category: 'embedding' });
        const huggingface = checkPythonDep('transformers');
        technologies.push({ name: 'HuggingFace', detected: huggingface, source: huggingface ? 'dependency file' : undefined, category: 'embedding' });

        // Vector DBs
        const pgvector = checkDep('pgvector');
        technologies.push({ name: 'pgvector', detected: pgvector, source: pgvector ? 'dependency file' : undefined, category: 'vectordb' });
        const chroma = checkDep('chromadb');
        technologies.push({ name: 'Chroma', detected: chroma, source: chroma ? 'dependency file' : undefined, category: 'vectordb' });
        const faiss = checkPythonDep('faiss-cpu') || checkPythonDep('faiss-gpu');
        technologies.push({ name: 'FAISS', detected: faiss, source: faiss ? 'dependency file' : undefined, category: 'vectordb' });
        const qdrant = checkDep('qdrant-client');
        technologies.push({ name: 'Qdrant', detected: qdrant, source: qdrant ? 'dependency file' : undefined, category: 'vectordb' });
        const pinecone = checkDep('pinecone-client') || checkDep('pinecone');
        technologies.push({ name: 'Pinecone', detected: pinecone, source: pinecone ? 'dependency file' : undefined, category: 'vectordb' });
        const weaviate = checkDep('weaviate-client');
        technologies.push({ name: 'Weaviate', detected: weaviate, source: weaviate ? 'dependency file' : undefined, category: 'vectordb' });
        const milvus = checkPythonDep('pymilvus');
        technologies.push({ name: 'Milvus', detected: milvus, source: milvus ? 'dependency file' : undefined, category: 'vectordb' });

        // PostgreSQL Check
        let hasPostgres = checkDep('psycopg2') || checkDep('psycopg') || checkDep('asyncpg') || checkNodeDep('pg');
        if (!hasPostgres && files.includes('docker-compose.yml')) {
            const dc = await fs.readFile(path.join(rootPath, 'docker-compose.yml'), 'utf8');
            if (dc.includes('postgres')) hasPostgres = true;
        }
        technologies.push({ name: 'PostgreSQL', detected: hasPostgres, source: hasPostgres ? 'dependency file' : undefined, category: 'other' });

        // Directories
        const ragDirNames = ['documents', 'docs', 'data', 'embeddings', 'vectors', 'retrieval', 'chunks', 'knowledge', 'corpus', 'indexes', 'rag'];
        for (const file of files) {
            if (EXCLUDED_DIRECTORIES && EXCLUDED_DIRECTORIES.includes(file)) continue;
            
            try {
                const stat = await fs.stat(path.join(rootPath, file));
                if (stat.isDirectory()) {
                    if (ragDirNames.includes(file.toLowerCase())) {
                        ragDirectories.push({
                            name: file,
                            path: path.join(rootPath, file),
                            purpose: 'Potential RAG directory'
                        });
                    }
                }
            } catch (e) {
                // Ignore stat errors
            }
        }

    } catch (error) {
        console.error('Error analyzing workspace:', error);
    }

    const hasVectorDb = technologies.some(t => t.category === 'vectordb');
    const hasOrchestration = technologies.some(t => t.category === 'orchestration');
    const hasEmbedding = technologies.some(t => t.category === 'embedding');
    
    const isLikelyRagProject = hasVectorDb || hasOrchestration || (hasEmbedding && ragDirectories.length > 0);

    return {
        projectName,
        rootPath,
        technologies,
        ragDirectories,
        isLikelyRagProject
    };
}
