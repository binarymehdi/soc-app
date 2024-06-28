FROM python:3.12-slim

EXPOSE 8000
WORKDIR /

COPY requirements.txt /
RUN python -m pip install \
    --no-cache \
    --disable-pip-version-check \
    -r /requirements.txt

COPY main.py /
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]