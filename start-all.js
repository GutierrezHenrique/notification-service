#!/usr/bin/env node

/**
 * Script Node.js para iniciar todos os microserviços e API Gateway
 * Funciona em Windows, macOS e Linux
 * Uso: node start-all.js [dev|prod]
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const MODE = process.argv[2] || 'dev';
const SCRIPT_DIR = __dirname;

// Cores para output (ANSI)
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(icon, color, message) {
  console.log(`${color}${icon}${colors.reset} ${message}`);
}

function info(message) {
  log('ℹ', colors.blue, message);
}

function success(message) {
  log('✓', colors.green, message);
}

function warning(message) {
  log('⚠', colors.yellow, message);
}

function error(message) {
  log('✗', colors.red, message);
}

// Verificar se pnpm está instalado
function checkPnpm() {
  return new Promise((resolve) => {
    exec('pnpm --version', (error) => {
      if (error) {
        error('pnpm não está instalado. Instale com: npm install -g pnpm');
        process.exit(1);
      }
      resolve();
    });
  });
}

// Verificar se porta está em uso
function isPortInUse(port) {
  return new Promise((resolve) => {
    const platform = os.platform();
    let command;
    
    if (platform === 'win32') {
      command = `netstat -ano | findstr :${port}`;
    } else {
      command = `lsof -i :${port} || true`;
    }
    
    exec(command, (error, stdout) => {
      resolve(stdout.trim().length > 0);
    });
  });
}

// Aguardar porta ficar disponível
async function waitForPort(port, timeout = 30000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await isPortInUse(port)) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

// Iniciar um serviço
async function startService(serviceName, serviceDir, port) {
  info(`Iniciando ${serviceName}...`);
  
  const servicePath = path.join(SCRIPT_DIR, serviceDir);
  
  if (!fs.existsSync(servicePath)) {
    error(`${serviceName} não encontrado em ${servicePath}`);
    return null;
  }
  
  // Verificar dependências
  const nodeModulesPath = path.join(servicePath, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    warning(`Instalando dependências de ${serviceName}...`);
    await runCommand('pnpm', ['install'], servicePath);
  }
  
  // Gerar Prisma Client se necessário
  const prismaPath = path.join(servicePath, 'prisma');
  if (fs.existsSync(prismaPath)) {
    info(`Gerando Prisma Client para ${serviceName}...`);
    await runCommand('pnpm', ['prisma:generate'], servicePath).catch(() => {
      // Ignorar erros
    });
  }
  
  // Iniciar serviço
  const logFile = path.join(os.tmpdir(), `${serviceName}.log`);
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });
  
  let command, args;
  if (MODE === 'prod') {
    info(`Construindo ${serviceName}...`);
    await runCommand('pnpm', ['build'], servicePath).catch(() => {
      // Ignorar erros de build
    });
    command = 'pnpm';
    args = ['start:prod'];
  } else {
    command = 'pnpm';
    args = ['start:dev'];
  }
  
  const proc = spawn(command, args, {
    cwd: servicePath,
    stdio: ['ignore', logStream, logStream],
    shell: true,
  });
  
  proc.on('error', (err) => {
    error(`Erro ao iniciar ${serviceName}: ${err.message}`);
  });
  
  // Aguardar serviço iniciar
  info(`Aguardando ${serviceName} iniciar na porta ${port}...`);
  const started = await waitForPort(port, 30000);
  
  if (started) {
    success(`${serviceName} está rodando na porta ${port}`);
    return { process: proc, logFile };
  } else {
    error(`${serviceName} não iniciou na porta ${port}`);
    proc.kill();
    return null;
  }
}

// Executar comando
function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true,
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

// Verificar Docker
async function checkDocker() {
  return new Promise((resolve) => {
    exec('docker info', (error) => {
      if (error) {
        warning('Docker não está rodando ou não está instalado');
        resolve(false);
      } else {
        info('Verificando bancos de dados...');
        exec('docker ps --format "{{.Names}}"', (err, stdout) => {
          const containers = stdout.split('\n').filter(Boolean);
          const needed = ['auth-db', 'gallery-db', 'notification-db', 'redis'];
          const missing = needed.filter((name) => !containers.includes(name));
          
          if (missing.length > 0) {
            info('Iniciando bancos de dados...');
            exec(
              'docker-compose -f docker-compose.microservices.yml up -d auth-db gallery-db notification-db redis',
              { cwd: SCRIPT_DIR },
              () => {
                info('Aguardando bancos de dados ficarem prontos...');
                setTimeout(resolve, 5000);
              },
            );
          } else {
            resolve(true);
          }
        });
      }
    });
  });
}

// Limpar processos
function cleanup(processes) {
  info('\nParando todos os serviços...');
  processes.forEach(({ process: proc }) => {
    if (proc && !proc.killed) {
      proc.kill('SIGTERM');
    }
  });
  
  setTimeout(() => {
    processes.forEach(({ process: proc }) => {
      if (proc && !proc.killed) {
        proc.kill('SIGKILL');
      }
    });
    success('Todos os serviços foram parados.');
    process.exit(0);
  }, 2000);
}

// Main
async function main() {
  console.log('');
  info('🚀 Iniciando todos os serviços...');
  console.log('');
  
  await checkPnpm();
  await checkDocker();
  
  const processes = [];
  
  // Capturar Ctrl+C
  process.on('SIGINT', () => cleanup(processes));
  process.on('SIGTERM', () => cleanup(processes));
  
  // Iniciar serviços na ordem
  const services = [
    { name: 'auth-service', dir: 'auth-service', port: 3001 },
    { name: 'gallery-service', dir: 'gallery-service', port: 3002 },
    { name: 'notification-service', dir: 'notification-service', port: 3003 },
    { name: 'api-gateway', dir: 'api-gateway', port: 3000 },
  ];
  
  for (const service of services) {
    const result = await startService(service.name, service.dir, service.port);
    if (result) {
      processes.push(result);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  
  console.log('');
  success('✅ Todos os serviços foram iniciados!');
  console.log('');
  info('📊 Status dos serviços:');
  console.log('  - Auth Service:        http://localhost:3001');
  console.log('  - Gallery Service:     http://localhost:3002');
  console.log('  - Notification Service: http://localhost:3003');
  console.log('  - API Gateway:         http://localhost:3000');
  console.log('');
  info('📝 Logs disponíveis em:');
  processes.forEach(({ logFile }) => {
    console.log(`  - ${logFile}`);
  });
  console.log('');
  warning('Pressione Ctrl+C para parar todos os serviços');
  console.log('');
  
  // Manter processo vivo
  process.stdin.resume();
}

main().catch((error) => {
  error(`Erro: ${error.message}`);
  process.exit(1);
});
