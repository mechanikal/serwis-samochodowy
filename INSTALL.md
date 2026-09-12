# 📦 Instrukcja instalacji – Serwis Samochodowy

Poniższy przewodnik przeprowadza przez pełną konfigurację projektu na środowisku lokalnym.

---

## Wymagania wstępne

Zanim rozpoczniesz, upewnij się, że masz zainstalowane:

| Narzędzie | Wersja | Pobierz |
|---|---|---|
| **Node.js** | LTS (18+) | https://nodejs.org |
| **npm** | 11+ (dołączony z Node.js) | — |
| **MySQL** | 8.0+ | https://dev.mysql.com/downloads/ |
| **MongoDB** | 6.0+ | https://www.mongodb.com/try/download/community |
| **Angular CLI** | 21+ | `npm install -g @angular/cli` |

---

## 1. Klonowanie repozytorium

```bash
git clone <URL_REPOZYTORIUM>
cd serwis-samochodowy
```

---

## 2. Konfiguracja bazy MySQL

### 2.1. Utwórz bazę danych

Zaloguj się do MySQL i utwórz bazę:

```sql
CREATE DATABASE users_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2.2. Utwórz tabelę `users`

> Wykonaj gotowy skrypt: `backend/databases/users.sql`
>
> ```bash
> mysql -u root -p users_db < backend/databases/users.sql
> ```

---

## 3. Konfiguracja bazy MongoDB

Upewnij się, że usługa MongoDB jest uruchomiona:

```bash
# Windows (usługa systemowa)
net start MongoDB

# macOS / Linux
sudo systemctl start mongod
# lub
mongod --dbpath /data/db
```

Baza danych `serwis_db` zostanie automatycznie utworzona przez MongoDB przy pierwszym połączeniu.

---

## 4. Konfiguracja backendu

### 4.1. Przejdź do katalogu backend

```bash
cd backend
```

### 4.2. Zainstaluj zależności

```bash
npm install
```

### 4.3. Skonfiguruj zmienne środowiskowe

Skopiuj przykładowy plik `.env` lub utwórz plik `backend/.env` o poniższej zawartości:

```env
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
---

## 5. Wypełnianie baz danych (seed)

Projekt zawiera skrypty seed do wypełnienia baz przykładowymi danymi.

### 5.1. Seed MySQL – konta użytkowników

```bash
npm run seed:mysql
```

Tworzy przykładowych użytkowników (klientów, mechanika, admina) w bazie MySQL.

### 5.2. Seed MongoDB – dane domenowe

```bash
npm run seed:mongo
```

Tworzy w MongoDB:
- Klientów i mechaników
- Pojazdy
- Słowniki: usterki, usługi, części
- Wizyty, diagnozy, powiadomienia

> **Uwaga:** Uruchom seedy tylko raz lub na czystej bazie, aby uniknąć duplikacji danych.

### 5.3. Alternatywnie – seed łączony

```bash
npm run seed
```

---

## 6. Uruchomienie backendu

### Tryb deweloperski (z hot-reload)

```bash
npm run dev
```

### Tryb produkcyjny

```bash
npm start
```

Serwer będzie dostępny pod adresem: **http://localhost:3000**

Możesz sprawdzić, czy API działa poprawnie:

```
GET http://localhost:3000/
→ "API works"
```

---

## 7. Konfiguracja frontendu

Otwórz nowy terminal i przejdź do katalogu frontend:

```bash
cd frontend
```

### 7.1. Zainstaluj zależności

```bash
npm install
```

### 7.2. Uruchom serwer deweloperski

```bash
npm run dev
# lub
ng serve
```

Frontend będzie dostępny pod adresem: **http://localhost:4200**

---

## 8. Pierwsze logowanie

Po uruchomieniu seedów możesz zalogować się za pomocą przykładowych kont:

| Rola | Login | Hasło |
|---|---|---|
| Klient | `klient1` | *(ustawione w seed-mysql.js)* |
| Mechanik | `mechanik1` | *(ustawione w seed-mysql.js)* |
| Admin | `admin` | *(ustawione w seed-mysql.js)* |

> Sprawdź plik `backend/seed-mysql.js`, aby poznać dokładne dane logowania lub je zmienić.

---

## 9. Build produkcyjny frontendu

```bash
cd frontend
npm run build
```

Skompilowane pliki znajdą się w katalogu `frontend/dist/`.