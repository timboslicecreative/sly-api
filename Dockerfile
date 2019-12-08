FROM node:10-alpine

WORKDIR /usr/src/
COPY ./package*.json ./
RUN npm install

EXPOSE 3000
CMD [ "npm", "start" ]