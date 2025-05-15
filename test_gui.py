from PyQt5.QtWidgets import QApplication, QMainWindow, QPushButton
import sys

class TestWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Test Window")
        self.setGeometry(100, 100, 200, 100)
        button = QPushButton("Click Me!", self)
        button.move(50, 30)
        button.clicked.connect(lambda: print("Button clicked!"))

app = QApplication(sys.argv)
window = TestWindow()
window.show()
sys.exit(app.exec_()) 