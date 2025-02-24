FROM node:20

WORKDIR /src/frontend

COPY package*.json ./

RUN npm install -g @ionic/cli @angular/cli @angular-devkit/build-angular && npm install

EXPOSE 8100