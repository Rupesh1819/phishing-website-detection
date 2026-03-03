# ── Stage 1: builder ──────────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /install
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install/pkgs -r requirements.txt

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM python:3.11-slim

LABEL maintainer="Code B Internship – Week 7"
LABEL description="Phishing URL Detection – Flask API + Web UI"

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install/pkgs /usr/local

# Copy application files
COPY app/           ./app/
COPY saved_model/   ./saved_model/
COPY requirements.txt .

# Non-root user for security
RUN adduser --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

ENV FLASK_ENV=production
ENV PORT=5000

EXPOSE 5000

# Use gunicorn for production; fall back to Flask dev server if not found
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", \
     "--timeout", "120", "--access-logfile", "-", "app.app:app"]
