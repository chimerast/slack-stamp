FROM mhart/alpine-node:base-6

MAINTAINER Hideyuki TAKEUCHI <chimerast@gmail.com>

WORKDIR /app

ADD . .

ENV PORT 80

EXPOSE 80

CMD ["node", "bot.js"]
