FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Adicionamos os parâmetros para o Vite liberar acesso total no Docker
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "3000"]