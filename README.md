# AegisAid: Privacy-Safe Humanitarian Resource AI
### 🛡️ Secure, Fair, and Offline-Capable Needs Forecasting & Resource Allocation

AegisAid is a complete, production-ready solution built for the **WiePrompt Hackathon: Data for the Displaced**. It addresses the critical ethical dilemma of modern humanitarian aid: **How can organizations identify vulnerable needs and allocate resources efficiently without creating databases that can be breached or weaponized against the very populations they aim to protect?**

By combining **k-Anonymity**, **Local Differential Privacy (LDP)**, and **Utility-Fairness optimization**, AegisAid ensures aid reaches those in need (advancing UN SDGs 1, 2, 3, and 10) while remaining **structurally incapable** of leaking individual identities.

---

## 🌟 Key Features

1.  **k-Anonymity Enforcement**: Groups individuals into equivalence classes based on quasi-identifiers (Camp, Gender, Age). Cohorts containing fewer than $k$ individuals are automatically suppressed to block database linkage attacks.
2.  **Local Differential Privacy (LDP)**: Applies Laplace noise injection on aggregated vulnerability scores. Attacker reconstruction attempts are mathematically bounded.
3.  **Fairness-Constrained Optimization**: Integrates a parameterized resource allocator ($\alpha$) allowing directors to trade pure mathematical utility (allocating based on group size/severity) with egalitarian fairness (ensuring minority subgroups are not under-served).
4.  **Epidemiological Early Warning System**: Run time-series anomaly detection on aggregate clinical presentation rates to spot disease spikes (e.g., cholera) without compromising individual safety.
5.  **Inclusive Visual/Audio Consent**: Pictographic and spoken-word consent tools designed for low-literacy intakes in **English, Arabic, French, and Somali**.
6.  **Offline-First Execution**: The entire dashboard runs locally in the browser with zero external dependencies, making it resilient to local network censorship or tracking.

---

## 📁 Repository Structure

```
├── index.html                     # Main AegisAid Web Dashboard Interface
├── style.css                      # Glassmorphism dark-themed Vanilla CSS styles
├── app.js                         # Client-side simulator, math models & UI logic
├── do_no_harm_assessment.md       # Formal Data Protection & Ethical Risk assessment (source)
├── presentation.html              # Interactive HTML Pitch Slide Deck for judges
├── LICENSE                        # MIT License
├── .gitignore
├── requirements.txt                # Intentionally empty — stdlib only, see file for notes
├── SUBMISSION_CHECKLIST.md        # Rubric-by-rubric readiness checklist for this repo
├── scripts/
│   ├── synthetic_gen.py           # Generates the 10,000-household synthetic dataset (seed=42)
│   └── privacy_allocation.py      # Demo of DP sums, k-anonymity, and allocations (seed=42)
└── data/
    └── synthetic_refugee_data.csv # Generated synthetic dataset (10,000 households)
```

## 🚀 How to Run the Solution

### 1. Interactive Dashboard (Web Prototype)
AegisAid is built to be **fully offline-capable**.
*   **Action**: Locate the [index.html](file:///c:/Users/hp/OneDrive%20-%20ESPRIT/Desktop/privacy%20safe%20humanitarian%20ai/index.html) file and **double-click to open it in any web browser** (Chrome, Firefox, Edge, Safari).
*   **No installation required**: The simulations, privacy transformations, and charts run in-memory inside your browser client.

### 2. Interactive Presentation Pitch
We have built a beautiful slide deck directly in code.
*   **Action**: Locate the [presentation.html](file:///c:/Users/hp/OneDrive%20-%20ESPRIT/Desktop/privacy%20safe%20humanitarian%20ai/presentation.html) file and **double-click to open it in any web browser**.
*   **Controls**: Use the **Left / Right arrow keys** or click the **Back / Next** buttons to traverse slides.

### 3. Backend Python ML Scripts
AegisAid includes Python scripts implementing the raw mathematical algorithms using only core libraries.
*   **Prerequisites**: A standard Python installation (Python 3.x). No external dependencies (like pandas or numpy) are needed.
*   **Generate Synthetic Data**:
    ```bash
    python scripts/synthetic_gen.py
    ```
    This generates `data/synthetic_refugee_data.csv` containing 10,000 household intake records.
*   **Run Privacy & Resource Allocation Analysis**:
    ```bash
    python scripts/privacy_allocation.py
    ```
    This script verifies $k$-anonymity compliance, applies Laplace noise queries under varying Epsilon constraints, and solves utility-fairness resource allocation.

---

## 📄 License

Released under the [MIT License](LICENSE) — free to reuse, adapt, and deploy
for real humanitarian settings.

## 🔬 Mathematical Specifications

### Laplace Noise Injection (Differential Privacy)
Aggregated need outputs are perturbed by adding noise drawn from the Laplace distribution:
$$Reported\_Sum = Actual\_Sum + Laplace\left(0, \frac{\Delta f}{\epsilon}\right)$$
Where the sensitivity $\Delta f = 1.0$ (maximum individual contribution) and $\epsilon$ is the slider value.

### Fairness Resource Allocation Formula
Aid allocation shares for each camp ($c$) are balanced using the following formula:
$$Share_c = (1 - \alpha) \cdot \left(\frac{Need_c}{Total\_Need}\right) + \alpha \cdot \left(\frac{1}{Num\_Camps}\right)$$
Setting $\alpha = 0.3$ strikes a balance between directed efficiency and structural equality.
