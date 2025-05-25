# Imagem base
FROM node:20

# Diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante da aplicação
COPY . .

# Expor a porta do Vite (por padrão é 5173)
EXPOSE 5173

# Rodar o dev server do Vite
CMD ["npm", "run", "dev", "--", "--host"]
