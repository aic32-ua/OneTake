FROM node:18.17.0

WORKDIR /app

RUN apt-get update && apt-get install -y ffmpeg

RUN npm init --yes
RUN npm install
RUN npm install amqplib

COPY . .

CMD ["node", "transcoder.js"]