# Imagem base
FROM node:18

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos package.json e package-lock.json
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta (deve ser a mesma do .env)


# Comando para iniciar o servidor
CMD []
