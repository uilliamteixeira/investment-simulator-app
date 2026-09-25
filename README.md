# 📈 Quanto Investir — Investment Simulator App

A Brazilian investment simulator for Android, built with **Flutter**. It shows everyday savers how much their money can really earn after taxes, compares fixed-income products, and estimates passive income from real estate funds (FIIs).

> **v2 (Sep 2026):** the original FlutterFlow prototype (Feb 2026) was rewritten from scratch in pure Flutter. The prototype screenshots are kept in [`docs/legado-flutterflow`](docs/legado-flutterflow).

The app's source code lives in a private repository. This public repository holds the project overview and the **open data pipeline** the app consumes.

---

## 🎯 Purpose

- Make compound interest, the CDI and income tax understandable to people who have never invested.
- Compare real products (CDB, LCI/LCA, Tesouro Selic, savings account, fixed-rate and inflation-linked bonds) **net of taxes**.
- Estimate how much capital is needed to earn a monthly passive income from FIIs.

Business model: a genuinely useful **free** version and a monthly **Pro** subscription (Google Play Billing).

---

## 🚀 Features

| Free | Pro |
|---|---|
| Compound interest simulator (months or years) with chart and month-by-month table | Compare up to 4 investments side by side |
| CDB/LC, LCI/LCA, Tesouro Selic, savings account, fixed-rate bonds | Inflation-linked bonds (IPCA+) |
| **Net value** with Brazil's regressive income tax, applied **per contribution** | Real value in today's money (IPCA-adjusted) |
| Goal planner: "how much per month?" and "how long?" | Saved simulations |
| Compare 2 investments | Passive income: time to reach the goal, fund-by-fund list |
| **Learn** tab: 8 plain-language cards with examples based on the minimum wage | |
| Passive income teaser: capital needed for a monthly income from FIIs | |

Interest rates (CDI, Selic, IPCA, TR) and the minimum wage are fetched live from the **Central Bank of Brazil** API. Examples in the Learn tab are computed on the fly, so they never go stale.

---

## 🧮 Financial Model

Future value with monthly contributions at the end of each month:

FV = P₀(1 + i)^n + A × ((1 + i)^n − 1) / i

- Annual rates are converted to effective monthly rates: i = (1 + r)^(1/12) − 1.
- **Regressive income tax** (22.5% → 20% → 17.5% → 15%) is computed separately for the initial amount and for **each monthly contribution**, according to how long each one stayed invested.
- **Savings account** follows the official rule (0.5% per month + TR when the Selic rate is above 8.5%; otherwise 70% of Selic + TR).
- **Goal planner** solves for the monthly contribution that reaches a **net** target (bisection over the full simulation, taxes included).

---

## 🏢 Open Data Pipeline (this repository)

[`robo/gerar.mjs`](robo/gerar.mjs) builds `fiis.json` using only **official, free** sources. No API keys, no scraping:

| Data | Source |
|---|---|
| Monthly distributions per fund | CVM, *Informe Mensal de FII* (dados.cvm.gov.br) |
| Closing prices and volume | B3, daily historical quotes (COTAHIST) |

- The two sources are joined by **ISIN**.
- Distribution per unit = monthly dividend yield reported to the CVM × book value per unit.
- Data-quality guards: yields reported as percentages are normalized, impossible months (negative or empty) are ignored, and funds with suspicious data are excluded instead of shown wrong.
- A GitHub Actions workflow runs every weekday evening and publishes the result to the [`dados`](../../tree/dados) branch, keeping `main` clean.

Run it locally (Node 20+, no dependencies):

```bash
node robo/gerar.mjs saida
```

---

## 🏗 Architecture

- **Flutter 3.47 / Dart 3.13**, Material 3, pt-BR locale.
- `core/`: pure calculation modules (interest, taxes, goals, products), plus the Central Bank and FII data services with offline cache.
- `ui/`: 5 tabs (Simulate, Compare, Goal, Learn, More), paywall, passive income screen.
- No backend: calculations run on the device, and the data is static JSON. Running cost is zero.
- **23 automated tests**: hand-checked financial cases plus widget tests, including a regression test for the empty-field crash in the prototype.

---

## 🗺 Roadmap

- [x] Compound interest with monthly deposits
- [x] Regressive income tax per contribution
- [x] Net comparison between scenarios (CDI multipliers, tax-exempt products)
- [x] Growth chart and monthly table
- [x] Saved simulations
- [x] Subscription model (Free / Pro)
- [x] Live rates from the Central Bank of Brazil
- [x] FII passive income with open data
- [ ] Play Store release (closed testing)
- [ ] Real dividends for stocks, ETFs and BDRs
- [ ] PDF export

---

## ⚠️ Disclaimer

Educational simulations only. This is not investment advice, and past returns do not guarantee future results.

---

## 👨‍💻 Author

**Uilliam Teixeira**: a side project combining financial reasoning, product design and software engineering.
