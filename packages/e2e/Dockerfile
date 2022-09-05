FROM cypress/browsers:node16.14.2-slim-chrome103-ff102
USER node
WORKDIR /home/node
ENV CI=true
ENTRYPOINT ["npm", "run", "test:ci"]
CMD ["--", "--browser", "chrome"]

COPY package.json .
RUN npm install
COPY cypress.config.js .
COPY cypress cypress/
