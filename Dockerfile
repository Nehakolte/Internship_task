
FROM ubuntu:22.04

RUN apt update && \
    apt install -y nginx git curl zip && \
    rm -rf /var/lib/apt/lists/*

RUN echo "daemon off;" >> /etc/nginx/nginx.conf

WORKDIR /var/www/html/

RUN git clone https://github.com/gabrielecirulli/2048.git && \
    mv 2048/* . && \
    rm -rf 2048

EXPOSE 80

CMD ["/usr/sbin/nginx", "-c", "/etc/nginx/nginx.conf"]
