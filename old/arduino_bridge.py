# arduino_bridge.py
import rclpy
from rclpy.node import Node
import serial
import threading
from std_msgs.msg import String

class ArduinoBridge(Node):
    def __init__(self):
        super().__init__('arduino_bridge')

        self.serial_port = serial.Serial('/dev/ttyACM0', 9600, timeout=1)
        self.publisher_ = self.create_publisher(String, 'arduino_data', 10)
        self.subscription = self.create_subscription(String, 'arduino_cmd', self.send_command, 10)

        self.get_logger().info('Arduino Bridge Started.')

        # Start reading thread
        thread = threading.Thread(target=self.read_from_arduino)
        thread.daemon = True
        thread.start()

    def send_command(self, msg):
        command = msg.data.strip()
        self.serial_port.write((command + '\n').encode())
        self.get_logger().info(f'Sent to Arduino: {command}')

    def read_from_arduino(self):
        while rclpy.ok():
            try:
                line = self.serial_port.readline().decode().strip()
                if line:
                    msg = String()
                    msg.data = line
                    self.publisher_.publish(msg)
                    self.get_logger().info(f'Received from Arduino: {line}')
            except Exception as e:
                self.get_logger().error(f'Serial read error: {e}')

def main(args=None):
    rclpy.init(args=args)
    node = ArduinoBridge()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        node.get_logger().info('Shutting down...')
    finally:
        node.serial_port.close()
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
