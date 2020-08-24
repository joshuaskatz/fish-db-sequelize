FROM node

WORKDIR /fishing-database-sequelize

COPY ./package.json .

RUN npm install --production

COPY . .

ENV NODE_ENV production

EXPOSE 4000

CMD ["node", "dist/index.js"]