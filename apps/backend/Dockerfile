FROM node:18-alpine

WORKDIR /app

# Установка PostgreSQL клиента
RUN apk add --no-cache postgresql-client

# Установка зависимостей
COPY package*.json ./
RUN npm install

# Копирование исходного кода
COPY . .

# Сборка TypeScript
RUN npm run build

# Создание символической ссылки для .env
RUN ln -sf /app/.env /app/dist/.env

# Установка wait-for-it.sh
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Запуск приложения
CMD ["/wait-for-it.sh", "postgres", "5432", "--", "node", "--experimental-modules", "dist/api/index.js"]
