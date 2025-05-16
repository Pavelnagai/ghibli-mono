FROM node:20-alpine

WORKDIR /app

# Install netcat
RUN apk add --no-cache netcat-openbsd

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

COPY . .

RUN npm run build

# Add execute permissions to dist/index.js
RUN chmod +x dist/index.js

EXPOSE 8080

# Add wait-for-it script
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

CMD ["/wait-for-it.sh", "node", "dist/index.js"] 