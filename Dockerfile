FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --production
RUN npm install @babel/core @babel/node @babel/preset-env
COPY . .
EXPOSE 8080
CMD ["npx", "babel-node", "src/server.js"]
