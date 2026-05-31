
# REPAIRFLOW — Frontend Dockerfile
# Serve arquivos estáticos HTML/CSS/JS via nginx


FROM nginx:alpine

# Atualiza os pacotes internos para corrigir vulnerabilidades conhecidas
RUN apk update && apk upgrade

# Remover configuração padrão do nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar config do nginx
COPY nginx.conf /etc/nginx/conf.d/repairflow.conf

# Copiar arquivos do frontend
COPY . /usr/share/nginx/html

# Expor porta 80
EXPOSE 80

# nginx já roda como daemon por padrão
CMD ["nginx", "-g", "daemon off;"]
