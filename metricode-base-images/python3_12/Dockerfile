FROM python:3.12-slim

WORKDIR /app

COPY metrics_uploader-1.0.0.tar.gz /app/

RUN pip install /app/metrics_uploader-1.0.0.tar.gz

COPY run.sh /app/run.sh
RUN chmod +x /app/run.sh

CMD ["/bin/bash", "/app/run.sh"]