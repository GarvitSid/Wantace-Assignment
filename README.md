# Northline Roofing: Config-Driven Estimator & Owner Panel

A full-stack, configuration-driven web application built for the Wantace SDE Intern assignment. 

This platform allows a roofing company to capture leads through a dynamic, multi-step public estimator while providing the business owner with a secure administrative panel to update proprietary pricing formulas, adjust global modifiers, and view captured leads without requiring code deployments.

## 🔗 Live Links & Access

* **Live Public Estimator:** [[https://wantace-assignment-gules.vercel.app/](https://wantace-assignment-gules.vercel.app/)]
* **Live Owner Panel:** [(https://wantace-assignment-gules.vercel.app/admin/login](https://wantace-assignment-gules.vercel.app/admin/login)
* **Live API Backend:** [https://wantace-assignment-mrig.onrender.com](https://wantace-assignment-mrig.onrender.com)

### Test Credentials (Owner Panel)
* **Username:** `owner`
* **Password:** `roof2026!`

---

## 🛠 Tech Stack

* **Frontend:** React.js (Vite), Tailwind CSS, React Router DOM
* **Backend:** Node.js, Express.js, JSON Web Tokens (JWT) for authentication
* **Database:** MongoDB, Mongoose ORM
* **Architecture:** Monorepo (Client + Server), "Three Layers of Truth" separation of concerns.

---

## ⚙️ Local Setup Instructions (Clean Clone)

Follow these steps to run the application locally from a clean clone.

### Prerequisites
* Node.js (v18.x or higher)
* Git
* A local MongoDB instance or a MongoDB Atlas URI string.

### 1. Clone the Repository
```bash
git clone https://github.com/GarvitSid/Wantace-Assignment
cd wantace-assignment