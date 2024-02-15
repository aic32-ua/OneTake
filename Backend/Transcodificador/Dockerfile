FROM node:14

WORKDIR /app

RUN apt-get update && apt-get install -y ffmpeg

RUN npm install
RUN npm install amqplib

COPY . .

CMD ["node", "transcoder.js"]