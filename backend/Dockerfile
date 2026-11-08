# MailMind AI — Backend image
FROM python:3.12-slim AS development

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Train the classifier at build time so a fresh image always ships a real model.
# (Fails the build if the dataset is missing or training errors.)
RUN python -m ml.train

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]


FROM development AS production

ENV APP_ENV=production \
    APP_DEBUG=false \
    PYTHONUNBUFFERED=1

CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers"]
