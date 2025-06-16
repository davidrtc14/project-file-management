# Imagem base
FROM node:18

RUN apt-get update && apt-get install -y netcat-openbsd

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos package.json e package-lock.json
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta (deve ser a mesma do .env)
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["npm", "run", "dev"]