#!/bin/bash

# Script para configurar remotes e fazer push de todos os repositórios

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Configuração de Repositórios Git ===${NC}\n"

# Tenta descobrir o nome de usuário do GitHub
GITHUB_USER=""
if command -v gh &> /dev/null; then
    GITHUB_USER=$(gh api user --jq .login 2>/dev/null)
    if [ -n "$GITHUB_USER" ]; then
        echo -e "${GREEN}Usuário GitHub detectado: $GITHUB_USER${NC}\n"
    fi
fi

# Se não conseguiu descobrir, pergunta ao usuário
if [ -z "$GITHUB_USER" ]; then
    echo -e "${YELLOW}Nome de usuário/organização do GitHub não detectado.${NC}"
    read -p "Digite seu usuário/organização do GitHub: " GITHUB_USER
    if [ -z "$GITHUB_USER" ]; then
        echo -e "${RED}Erro: Nome de usuário é obrigatório${NC}"
        exit 1
    fi
fi

GITHUB_BASE_URL="https://github.com"
USE_SSH=false

# Pergunta se quer usar SSH
read -p "Usar SSH para os repositórios? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    GITHUB_BASE_URL="git@github.com:"
    USE_SSH=true
fi

echo -e "\n${BLUE}Configurando repositórios...${NC}\n"

services=("api-gateway" "auth-service" "backend" "gallery-service" "notification-service")

for service in "${services[@]}"; do
    echo -e "${YELLOW}=== $service ===${NC}"
    
    cd "$service" || {
        echo -e "${RED}Erro: Diretório $service não encontrado${NC}"
        continue
    }
    
    # Verifica se já existe remote
    if git remote | grep -q "^origin$"; then
        CURRENT_URL=$(git remote get-url origin)
        echo -e "${GREEN}Remote já existe: $CURRENT_URL${NC}"
        
        # Pergunta se quer atualizar
        read -p "Atualizar remote? (s/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            if [ "$USE_SSH" = true ]; then
                NEW_URL="git@github.com:$GITHUB_USER/$service.git"
            else
                NEW_URL="https://github.com/$GITHUB_USER/$service.git"
            fi
            git remote set-url origin "$NEW_URL"
            echo -e "${GREEN}Remote atualizado para: $NEW_URL${NC}"
        fi
    else
        # Cria novo remote
        if [ "$USE_SSH" = true ]; then
            REPO_URL="git@github.com:$GITHUB_USER/$service.git"
        else
            REPO_URL="https://github.com/$GITHUB_USER/$service.git"
        fi
        
        echo -e "${YELLOW}Adicionando remote: $REPO_URL${NC}"
        echo -e "${RED}⚠️  Certifique-se de que o repositório existe no GitHub!${NC}"
        git remote add origin "$REPO_URL"
    fi
    
    # Verifica branch atual
    CURRENT_BRANCH=$(git branch --show-current)
    echo -e "${BLUE}Branch atual: $CURRENT_BRANCH${NC}"
    
    # Garante que está na branch main
    if [ "$CURRENT_BRANCH" != "main" ]; then
        git checkout -b main 2>/dev/null || git checkout main 2>/dev/null
    fi
    
    # Faz push
    echo -e "${YELLOW}Fazendo push...${NC}"
    if git push -u origin main 2>&1; then
        echo -e "${GREEN}✓ Push de $service concluído com sucesso!${NC}"
    else
        echo -e "${RED}✗ Erro ao fazer push de $service${NC}"
        echo -e "${YELLOW}Verifique se:${NC}"
        echo -e "  1. O repositório existe no GitHub"
        echo -e "  2. Você tem permissão para fazer push"
        echo -e "  3. Suas credenciais estão configuradas"
    fi
    
    cd ..
    echo ""
done

echo -e "${GREEN}=== Concluído ===${NC}"
