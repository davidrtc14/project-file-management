# backend/Dockerfile

# Imagem base
FROM node:20

# Diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências Node.js
RUN npm install

# Instalar LibreOffice Headless (para conversão DOCX/XLSX para PDF)
# Use debian-based images (node:20 é geralmente baseado em Debian/Ubuntu)
RUN apt-get update && \
    apt-get install -yq libreoffice-writer libreoffice-calc --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Copiar o restante da aplicação
COPY . .

# Expor a porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "dev"]