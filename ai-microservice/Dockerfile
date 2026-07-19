# JalanGuard AI Detection Service — Cloud Run image.
#
# Build/deploy: from ai-microservice/, `gcloud run deploy --source .`
# Cloud Run injects PORT at runtime (default 8080); the app must bind to it.
FROM python:3.11-slim

WORKDIR /app

# System libs required by Pillow/OpenCV-adjacent image decoding used by ultralytics.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# CPU-only torch + torchvision, installed together from the same index so pip
# resolves a matched pair — this host has no GPU, and the default PyPI
# resolution for `ultralytics` would otherwise pull a multi-GB CUDA build.
# Installing only `torch` here and letting `ultralytics` pull `torchvision`
# from the default index afterward causes a torch/torchvision ABI mismatch
# ("operator torchvision::nms does not exist") — both must come from the
# same CPU index in the same command.
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
COPY main.py best.pt ./

ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
