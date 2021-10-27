FROM node:14

WORKDIR /usr/src/app

COPY package*.json .
RUN npm install

# we're layering this separately from the package*.json
# and npm install to avoid re-installing deps every time a
# file changes in our source code
COPY . .

EXPOSE 8080

CMD [ "node", "src/index.js"]