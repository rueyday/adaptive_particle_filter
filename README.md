# 🚀 Portable Ubuntu Workspace with Docker + GPU

This project provides a **portable Ubuntu workspace** that includes your development environment (tools, ML/ROS2, dependencies) inside a Docker image while keeping your code and data outside the container.  
With this setup, you can carry your workspace across machines and always get an identical environment.

---

## 🔧 Build the Image

Make sure you have [Docker](https://docs.docker.com/get-docker/) and [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html) installed.  

Then build your workspace image:

```bash
docker build -t my-ubuntu-workspace .

docker run --gpus all -it \
  -v ~/my-workspace:/workspace \
  my-ubuntu-workspace

docker save my-ubuntu-workspace > workspace.tar

docker load < workspace.tar
docker run --gpus all -it -v ~/my-workspace:/workspace my-ubuntu-workspace
