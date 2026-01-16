#!/bin/bash

# Script para fazer push de todos os repositórios
# Ajuste o GITHUB_USER ou GITHUB_ORG com seu usuário/organização do GitHub

GITHUB_USER="seu-usuario-github"  # Altere para seu usuário/organização
GITHUB_BASE_URL="https://github.com"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Configurando e fazendo push dos repositórios...${NC}\n"

# Array com os serviços
services=("api-gateway" "auth-service" "backend" "gallery-service" "notification-service")

for service in "${services[@]}"; do
    echo -e "${YELLOW}=== Processando $service ===${NC}"
    
    cd "$service" || exit 1
    
    # Verifica se já existe remote origin
    if git remote | grep -q "^origin$"; then
        echo -e "${GREEN}Remote origin já existe para $service${NC}"
        REMOTE_URL=$(git remote get-url origin)
        echo "URL atual: $REMOTE_URL"
    else
        # Cria o remote se não existir
        REPO_URL="$GITHUB_BASE_URL/$GITHUB_USER/$service.git"
        echo -e "${YELLOW}Adicionando remote origin: $REPO_URL${NC}"
        echo -e "${RED}ATENÇÃO: Certifique-se de que o repositório $service existe no GitHub!${NC}"
        git remote add origin "$REPO_URL" 2>/dev/null || {
            echo -e "${RED}Erro ao adicionar remote. Verifique se o repositório existe.${NC}"
            cd ..
            continue
        }
    fi
    
    # Verifica se há commits para fazer push
    if git log origin/main..HEAD 2>/dev/null | grep -q . || ! git rev-parse --verify origin/main >/dev/null 2>&1; then
        echo -e "${GREEN}Fazendo push de $service...${NC}"
        git push -u origin main || {
            echo -e "${RED}Erro ao fazer push de $service${NC}"
            echo -e "${YELLOW}Tentando criar branch main...${NC}"
            git branch -M main
            git push -u origin main || {
                echo -e "${RED}Falha ao fazer push de $service${NC}"
            }
        }
    else
        echo -e "${GREEN}$service já está atualizado${NC}"
    fi
    
    cd ..
    echo ""
done

echo -e "${GREEN}Concluído!${NC}"
