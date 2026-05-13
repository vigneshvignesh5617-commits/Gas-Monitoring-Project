# 🔥 Gas Monitoring Project

> An IoT-based LPG gas leakage detection and monitoring system using MQ-2 sensors and Arduino — designed for home safety and cost-efficiency.

![Arduino](https://img.shields.io/badge/Arduino-00979D?style=for-the-badge&logo=arduino&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![IoT](https://img.shields.io/badge/IoT-Project-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Completed-green?style=for-the-badge)

---

## 📌 About The Project

Every year, hundreds of accidents happen due to undetected LPG gas leaks at home. This project is my attempt to solve that — using affordable hardware and real-time monitoring.

The **Gas Monitoring System** continuously reads gas concentration levels using an **MQ-2 sensor** connected to an **Arduino**. When gas levels exceed a safe threshold, it triggers an **alert** — helping prevent accidents before they happen.

Built with affordability and real-world impact in mind. 💡

---

## 🎯 Features

- ✅ Real-time LPG gas level detection
- ✅ Automatic alert when gas exceeds safe threshold
- ✅ Low-cost hardware setup (under ₹500)
- ✅ Simple dashboard to monitor gas levels
- ✅ Designed for home and kitchen safety

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Hardware | Arduino Uno |
| Sensor | MQ-2 Gas Sensor |
| Programming | C++ (Arduino IDE), JavaScript |
| Monitoring | Serial Monitor / Web Dashboard |

---

## ⚙️ How It Works

```
MQ-2 Sensor
     │
     ▼
Reads gas concentration (analog value)
     │
     ▼
Arduino processes the value
     │
     ├── Below threshold → ✅ Safe — Normal reading displayed
     │
     └── Above threshold → 🚨 ALERT — Buzzer triggers + Warning shown
```

---

## 🚀 Getting Started

### Prerequisites
- Arduino Uno board
- MQ-2 Gas Sensor module
- Buzzer
- Jumper wires
- Arduino IDE installed on your computer

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/vigneshvignesh5617/Gas-Monitoring-Project.git
cd Gas-Monitoring-Project
```

2. **Open Arduino IDE**
   - Open the `.ino` file from the project folder

3. **Connect the hardware**
   - MQ-2 VCC → Arduino 5V
   - MQ-2 GND → Arduino GND
   - MQ-2 A0  → Arduino A0
   - Buzzer +  → Arduino Pin 8
   - Buzzer -  → Arduino GND

4. **Upload the code**
   - Select your board: `Tools → Board → Arduino Uno`
   - Select your port: `Tools → Port → COMX`
   - Click **Upload**

5. **Monitor output**
   - Open Serial Monitor (`Ctrl + Shift + M`)
   - Set baud rate to `9600`
   - Watch real-time gas readings!

---

## 📊 Sensor Threshold Values

| Gas Level | Sensor Value | Status |
|-----------|-------------|--------|
| Normal | < 300 | ✅ Safe |
| Warning | 300 – 500 | ⚠️ Caution |
| Danger | > 500 | 🚨 Alert! |

---

## 💡 Real World Use Case

- Kitchen LPG cylinder monitoring
- Industrial gas safety systems
- Smart home safety automation
- College lab safety projects

---

## 🧠 What I Learned

- How to interface analog sensors with Arduino
- Reading and processing real-time sensor data
- Building safety-critical systems with low-cost hardware
- Connecting hardware output to a software interface

---

## 🙋‍♂️ About Me

**Vighnesh N**
BCA Student | Vivekananda Arts, Science and Commerce College, Puttur

- 🔗 [LinkedIn](https://www.linkedin.com/in/vighnesh-n-3b5b42351)
- 🐙 [GitHub](https://github.com/vigneshvignesh5617-commits)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

> ⭐ If you found this helpful, consider starring the repo — it motivates me to build more!

