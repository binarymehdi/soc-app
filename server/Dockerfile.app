FROM python:3.12-slim

EXPOSE 8000
WORKDIR /code

COPY requirements.txt /code/
RUN python -m pip install --no-cache-dir --disable-pip-version-check -r /code/requirements.txt

COPY . /code/
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
