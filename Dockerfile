FROM archlinux:latest

WORKDIR /app

RUN echo 'Server = https://mirrors.bfsu.edu.cn/archlinux/$repo/os/$arch' > /etc/pacman.d/mirrorlist
RUN pacman -Sy --noconfirm yarn

COPY ./ ./

RUN yarn

VOLUME [ "/work" ]
CMD [ "yarn", "start" ]
