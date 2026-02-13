# 📈 Investment Simulator App

A compound interest investment simulator built with FlutterFlow.

This application allows users to simulate monthly investments and visualize long-term growth before investing in financial products such as CDB, LCI, Treasury bonds, or similar fixed-income assets.

---

## 🎯 Objective

Provide a simple and accessible financial projection tool that helps users understand:

- How much they are investing  
- For how long  
- How compound interest impacts total accumulation  

The app focuses on clarity, usability, and financial awareness.

---

## 🧮 Compound Interest Formula

The accumulated value is calculated using the future value of recurring contributions:

M = P × ((1 + i)^n - 1) / i

Where:

- **P** = monthly contribution  
- **i** = monthly interest rate (default: 10% annual ÷ 12)  
- **n** = number of months  
- **M** = total accumulated value  

The simulator uses a default annual rate of 10%, converted to a monthly rate.

---

## 📸 Screenshots

### Contribution Selection Screen

![Contribution Screen](screenshots/aporte-screen.png)

---

## 🛠 Tech Stack

- FlutterFlow
- Page State Management
- Navigation Parameters
- Inline Functions (String → Integer conversion)
- Custom Functions (compound calculation logic – in progress)

---

## 🚀 Current Features

- Predefined monthly contribution selection
- Investment period dropdown (12–60 months)
- Parameter passing between pages (aporte & meses)
- Compound interest simulation
- Result screen with accumulated value

---

## 🧠 Technical Highlights

- Structured state management using Page State
- Dynamic parameter navigation
- Inline function for safe type conversion
- Modular page architecture
- Scalable structure for future financial products

This project demonstrates logical flow control, state handling, and financial calculation modeling inside a low-code environment.

---

## 💼 Business Model (Planned)

- Google AdMob monetization
- Premium version (ad-free)
- Expansion to additional investment types:
  - CDB
  - LCI/LCA
  - Treasury Direct
  - IPCA-based assets

---

## 🗺 Roadmap

- [x] Monthly contribution selection
- [x] Investment period dropdown
- [ ] Custom compound interest function
- [ ] Dynamic result rendering
- [ ] Play Store release

---

## 📌 Project Status

Currently in development phase.

Code export will be available after FlutterFlow plan upgrade.

---

## 👨‍💻 Author

Developed as a side project focused on financial education, logical structuring, and product building.

Planned for commercial release on Google Play Store.
