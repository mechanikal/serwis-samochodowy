# 📦 Instrukcja instalacji – Serwis Samochodowy

Poniższy przewodnik przeprowadza przez pełną konfigurację projektu na środowisku lokalnym.

---

## 1. Wymagania wstępne

Potrzebne narzędzia:
Node.js, MySQL, MongoDB, Angular

### 2. Konfiguracja zmiennych środowiskowych

Utwórz plik .env w katalogu /backend, w razie potrzeby skonfiguruj go

# MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=twoje_haslo_mysql
DB_NAME=users_db
DB_PORT=3306

# MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/serwis_db

# Serwer
PORT=3000

# JWT – zmień na losowy, bezpieczny ciąg znaków!
JWT_SECRET=zmien_na_bezpieczny_sekret

## 3. Instalacja zależności

wykonaj npm install w folderze /backend oraz w folderze /frontend

## 4. Konfiguracja bazy

Zaloguj się do MySQL i utwórz bazę 'users_db',
wykonaj w niej polecenie:

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  phone VARCHAR(20),
  role ENUM('user', 'mechanic') DEFAULT 'user'
);

uruchom usługę MongoDB

z folderu /backend Wykonaj polecenie 
npm run seed

## 5. Uruchomienie projektu

wykonaj polecenie npm run dev z folderu /backend a następnie z folderu /frontend

strona dostępna jest pod adresem: **http://localhost:4200**


## 6. Logowanie na stronie

przy seedowaniu zostały konta o następujących loginach:

konta klientów:
**klient1**
**klient2**
**klient3**
**klient4**
**klient5**

konta mechaników:
**mechanik1**

hasło do każdego z kont to 
**password123**

