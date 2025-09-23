#!/bin/bash

# Kill any existing VNC sessions
su - ubuntu -c "vncserver -kill :1 &> /dev/null || true"

# Start VNC server
echo "Starting VNC server..."
su - ubuntu -c "vncserver :1 -geometry 1920x1080 -depth 24"

# Wait a moment for VNC to start
sleep 3

# Start noVNC
echo "Starting noVNC..."
cd /usr/share/novnc
./utils/launch.sh --vnc localhost:5901 --listen 6080 &

# Keep container running
echo "Services started. Connect to http://localhost:6080"
echo "VNC password: ubuntu"
tail -f /dev/null