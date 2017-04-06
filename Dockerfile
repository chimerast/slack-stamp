FROM mhart/alpine-node:6

MAINTAINER Hideyuki TAKEUCHI <chimerast@gmail.com>

WORKDIR /app

ADD . .

RUN ["npm", "install"]

ENV PORT 80

EXPOSE 80

CMD ["node", "bot.js"]
