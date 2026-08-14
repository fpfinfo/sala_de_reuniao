import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import https from 'https';

const API_BASE_URL = 'https://cm596nkf.us-east.insforge.app';
const API_KEY = 'ik_73ef69e8a6f49f121f007109f8bbd174';

const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', '.gemini', 'brain']);
const IGNORE_FILES = new Set(['.DS_Store', 'Thumbs.db']);

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    if (IGNORE_DIRS.has(file) || IGNORE_FILES.has(file)) continue;
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }

  return arrayOfFiles;
}

function computeSha1(buffer) {
  return crypto.createHash('sha1').update(buffer).digest('hex');
}

function request(urlPath, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, API_BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        ...(options.headers || {}),
      },
      rejectUnauthorized: false,
    };

    const req = https.request(url, reqOptions, (res) => {
      let data = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        const text = buffer.toString('utf-8');
        try {
          const json = JSON.parse(text);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(json)}`));
          }
        } catch {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(text);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${text}`));
          }
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function deploy() {
  console.log('🚀 Iniciando processo de Deploy no InsForge...');
  const rootDir = process.cwd();
  const allFilePaths = getAllFiles(rootDir);

  console.log(`📦 Coletando ${allFilePaths.length} arquivos do projeto...`);

  const manifest = [];
  const fileBuffers = new Map();

  for (const filePath of allFilePaths) {
    const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
    const buffer = fs.readFileSync(filePath);
    const sha1 = computeSha1(buffer);
    const size = buffer.length;

    manifest.push({
      path: relPath,
      size,
      sha1,
    });
    fileBuffers.set(relPath, buffer);
  }

  console.log('📡 Registrando manifesto de deploy no InsForge...');
  const files = manifest.map((m) => ({
    file: m.path,
    filePath: m.path,
    path: m.path,
    size: m.size,
    sha: m.sha1,
    sha1: m.sha1,
  }));

  const directPayload = {
    files,
    manifest,
    projectSettings: {
      buildCommand: 'npm run build',
      outputDirectory: 'dist',
    },
    meta: {
      appName: 'gestao-salas-seplan',
      source: 'antigravity',
    },
  };

  const directRes = await request('/api/deployments/direct', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, JSON.stringify(directPayload));

  const deploymentId = directRes.id || directRes.deploymentId;
  const filesToUpload = directRes.files || [];

  console.log(`📤 Enviando ${filesToUpload.length} arquivos para o InsForge (ID: ${deploymentId})...`);

  for (let i = 0; i < filesToUpload.length; i++) {
    const file = filesToUpload[i];
    const fileId = file.fileId || file.id;
    const filePath = file.path;
    const buffer = fileBuffers.get(filePath);

    if (!buffer) {
      console.warn(`Arquivo não encontrado no cache local: ${filePath}`);
      continue;
    }

    process.stdout.write(`  [${i + 1}/${filesToUpload.length}] Enviando ${filePath}...\r`);

    await request(`/api/deployments/${deploymentId}/files/${fileId}/content`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': buffer.length,
      },
    }, buffer);
  }

  console.log('\n⚡ Todos os arquivos enviados. Iniciando build de produção...');
  await request(`/api/deployments/${deploymentId}/start`, {
    method: 'POST',
  });

  console.log('⏳ Aguardando conclusão do build no InsForge...');
  let attempts = 0;
  while (attempts < 60) {
    await new Promise((r) => setTimeout(r, 4000));
    attempts++;

    try {
      const statusRes = await request(`/api/deployments/${deploymentId}`);
      const status = statusRes.status || statusRes.state;
      console.log(`  Status atual: ${status} (tentativa ${attempts})`);

      if (status === 'READY') {
        const liveUrl = statusRes.url || `https://${statusRes.domain || statusRes.slug}.insforge.site`;
        console.log('\n🎉 ==============================================');
        console.log('✅ DEPLOY CONCLUÍDO COM SUCESSO NO INSFORGE!');
        console.log(`🌐 URL Pública: ${liveUrl}`);
        console.log('==============================================\n');
        return;
      }

      if (status === 'ERROR' || status === 'CANCELED') {
        console.error(`\n❌ O deploy falhou com status: ${status}`);
        console.error(JSON.stringify(statusRes, null, 2));
        process.exit(1);
      }
    } catch (err) {
      console.warn('  Aguardando resposta do servidor...', err.message);
    }
  }

  console.log('⚠️ Timeout aguardando o status final. Verifique no painel do InsForge.');
}

deploy().catch((err) => {
  console.error('❌ Erro durante o deploy:', err);
  process.exit(1);
});
