FROM nvidia/cuda:12.2.0-devel-ubuntu22.04

# Install tools you need
RUN apt-get update && apt-get install -y \
    git vim build-essential python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Install Python libs
RUN pip install torch torchvision torchaudio jupyterlab

# Set default work directory
WORKDIR /workspace
