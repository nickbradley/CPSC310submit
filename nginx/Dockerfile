FROM nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY cpsc310-2016Fall.crt /etc/ssl/certs/cpsc310-2016Fall.crt
COPY cpsc310-2016Fall.key /etc/ssl/certs/cpsc310-2016Fall.key

# forward request and error logs to docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log
RUN ln -sf /dev/stderr /var/log/nginx/error.log

#EXPOSE 443
