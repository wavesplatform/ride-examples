FROM node:slim

RUN npm install -g node-static

WORKDIR /static
COPY index.html .
COPY favicon.ico .

EXPOSE 80
CMD static --host-address 0.0.0.0 -p 80 --gzip

