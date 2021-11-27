FROM archlinux:latest

WORKDIR /app

RUN pacman -Syu --noconfirm yarn

COPY ./ ./

RUN yarn

VOLUME [ "/work" ]
CMD [ "yarn", "start" ]
