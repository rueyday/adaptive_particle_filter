#!/bin/bash

# Set password for VNC
echo "password" | vncpasswd -f > /root/.vnc/passwd
chmod 600 /root/.vnc/passwd

# Start VNC server
export DISPLAY=:1
vncserver :1 -geometry 1280x800 -depth 24

# Start noVNC
websockify --web=/usr/share/novnc/ 6080 localhost:5901 &

# Keep container running
tail -f /dev/null

