# sim.py
import pybullet as p
import pybullet_data
import time

p.connect(p.GUI)
p.setAdditionalSearchPath(pybullet_data.getDataPath())
p.setGravity(0, 0, -9.8)
p.loadURDF("plane.urdf")
robot = p.loadURDF("r2d2.urdf", [0, 0, 0.5])

while True:
    p.stepSimulation()
    time.sleep(1.0 / 240.0)
