# 📈 Investment Simulator App

A modular compound interest investment simulator built with FlutterFlow.

This project combines financial modeling, structured state management, and product-oriented architecture to create a practical investment analysis tool.

The application is evolving into a dual-mode system:

- **Free Simulator**
- **Pro Investment Comparison Engine**

---

## 🎯 Purpose

The objective of this project is to build a real-world financial tool that helps users:

- Understand compound interest growth
- Simulate recurring monthly investments
- Analyze long-term capital accumulation
- Compare investment scenarios considering taxation

The focus is on:

- Financial clarity  
- Logical modeling  
- Clean UX  
- Modular architecture  
- Real-world usability  

---

## 🧮 Financial Model

The core engine is based on the compound interest formula with recurring contributions:

FV = P₀(1 + i)^n + A × ((1 + i)^n − 1) / i

Where:

- **P₀** = initial investment  
- **A** = monthly contribution  
- **i** = monthly interest rate  
- **n** = number of months  
- **FV** = final accumulated value  

The system converts annual rates into effective monthly rates and supports scenario-based multipliers (CDI-based projections in the Pro version).

All calculations are performed dynamically with controlled numeric handling and proper formatting.

---

## 🏗 Architecture Overview

The application follows a modular page architecture:

### 🔹 Simulador (Free Version)

- Manual input of investment data
- Real-time compound interest calculation
- Result breakdown:
  - Final Value
  - Total Invested
  - Interest Earned
- Currency formatting
- Typed Page State management

### 🔹 ComparadorPro (Pro Version)

- Receives parameters via navigation
- Isolated Page State (no interference with Free logic)
- Multi-scenario comparison engine
- Planned IR (Brazilian regressive tax) simulation
- Structured expansion for premium features

The separation between Free and Pro ensures:

- Clean state isolation
- No cross-page dependency conflicts
- Safe future expansion
- Controlled product scalability

---

## 🚀 Current Features

- Compound interest calculation with recurring deposits
- Real-time reactive UI updates
- Result breakdown:
  - Final value
  - Total invested
  - Interest earned
- Currency formatting (pt-BR)
- Typed state consistency (Integer / Double alignment)
- Parameter-based navigation between pages
- Modular financial calculation functions
- Page state isolation architecture

---

## 🧠 Technical Highlights

- Structured Page State architecture
- Page Parameter data transfer
- Reusable custom financial functions (Dart)
- Safe numeric handling and conversion logic
- Separation of concerns (Free vs Pro)
- Modular expansion strategy
- Low-code + custom logic integration
- Product-oriented architecture planning

This project demonstrates applied financial modeling inside a structured low-code environment with controlled state logic.

---

## 🛠 Tech Stack

- FlutterFlow  
- Dart (Custom Functions)  
- Page State Management  
- Page Parameters  
- Financial modeling logic  

---

## 🗺 Roadmap

### Core Engine

- [x] Compound interest calculation with monthly deposits
- [x] Real-time reactive UI updates
- [x] Result breakdown structure
- [x] Page state isolation architecture

### Pro Comparison Engine

- [ ] CDI multiplier scenario selection
- [ ] IR (Brazilian regressive tax) simulation
- [ ] Net return comparison between scenarios
- [ ] Automatic recalculation per scenario selection

### Product Evolution

- [ ] Data persistence
- [ ] Growth chart visualization
- [ ] Subscription model (Free / Pro)
- [ ] Usage analytics integration
- [ ] Play Store release

---

## 📸 Screenshots

| Free Simulator | Result Example |
|----------------|----------------|
| ![](screenshots/screenshots_initial.png) | ![](screenshots/screenshots_result.png) |

(Comparison screen will be added in future updates.)

---

## 📌 Project Status

Actively evolving.

Current focus:

- Pro comparison logic implementation
- Tax simulation modeling
- UX refinement
- Product positioning strategy

The application is transitioning from a simple simulator to a structured financial comparison tool with monetization potential.

---

## 👨‍💻 About the Author

Built as a side project focused on:

- Financial education  
- Logical modeling  
- Product architecture  
- State management design  
- Continuous technical growth  

This project reflects the combination of financial reasoning, system structuring, and user-centered product development.
