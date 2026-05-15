# Aurum Finance Tracker

A personal finance tracker with login, registration, and transaction history.

---

## Requirements

- [Node.js](https://nodejs.org) (v18 or higher)
- [MySQL](https://dev.mysql.com/downloads/mysql/)

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/MOAmjTECH/Aurum.git
cd Aurum
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up the database

Open MySQL and run the following:

```sql
CREATE DATABASE aurum_finance;
USE aurum_finance;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Create a `.env` file

In the root of the project create a file called `.env` and add the following:

```
DB_PASSWORD=your_mysql_password_here
```

Replace `your_mysql_password_here` with your actual MySQL password.

### 5. Start the backend

```bash
node server.js
```

You should see:
```
Running on port 3000
Database connected
```

### 6. Open the frontend

Open the `Aurum/index.html` file with **Live Server** in VS Code.

> Make sure `node server.js` is running at the same time, otherwise login and transactions won't work.

---

## Usage

- Register a new account or sign in with Google
- Log in with your email and password
- Add income and expense transactions
- View your balance and spending breakdown
