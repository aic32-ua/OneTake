FROM node:18.17.0

WORKDIR /app
COPY . .

RUN apt-get update && apt-get install -y ffmpeg

RUN npm install