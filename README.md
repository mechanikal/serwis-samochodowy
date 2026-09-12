# 🔧 Serwis Samochodowy

Webowa aplikacja do zarządzania serwisem samochodowym. System obsługuje trzy role użytkowników: **klientów**, **mechaników** i **administratorów**, umożliwiając zarządzanie wizytami, pojazdami, diagnozami i kosztorysami napraw.

---

## 📋 Spis treści

- [Opis projektu](#opis-projektu)
- [Stos technologiczny](#stos-technologiczny)
- [Architektura](#architektura)
- [Funkcjonalności](#funkcjonalności)
- [Role użytkowników](#role-użytkowników)
- [Struktura projektu](#struktura-projektu)
- [API – przegląd endpointów](#api--przegląd-endpointów)
- [Instalacja](#instalacja)

---

## Opis projektu

Aplikacja **Serwis Samochodowy** to fullstackowy system webowy pozwalający na:

- **Klientom** – rejestrację, dodawanie pojazdów, umawianie wizyt, przeglądanie kosztorysów i zarządzanie powiadomieniami.
- **Mechanikom** – zarządzanie kalendarzem wizyt, wystawianie diagnoz i kosztorysów, zarządzanie statusami napraw, dostęp do statystyk usterek i usług.

---

## Stos technologiczny

### Frontend

| Technologia | Wersja | Opis |
|---|---|---|
| Angular | ~21.2 | Framework SPA |
| TypeScript | ~5.9 | Typowany JavaScript |
| TailwindCSS | ^4.1 | Stylowanie |
| RxJS | ~7.8 | Reaktywne strumienie danych |
| Angular CLI | ^21.2.5 | Narzędzie deweloperskie |
| Vitest | ^4.0 | Testy jednostkowe |

### Backend

| Technologia | Wersja | Opis |
|---|---|---|
| Node.js | LTS | Środowisko uruchomieniowe |
| Express | ^5.2 | Framework HTTP |
| MySQL2 | ^3.22 | Klient bazy MySQL (uwierzytelnianie) |
| Mongoose | ^9.6 | ODM dla MongoDB |
| bcrypt | ^6.0 | Haszowanie haseł |
| jsonwebtoken | ^9.0 | Autoryzacja JWT |
| dotenv | ^17.4 | Zarządzanie zmiennymi środowiskowymi |
| nodemon | ^3.1 | Hot-reload deweloperski |

### Bazy danych

| Baza | Zastosowanie |
|---|---|
| **MySQL** | Dane uwierzytelniające użytkowników (tabela `users`) |
| **MongoDB** | Dane domenowe: klienci, pojazdy, wizyty, diagnozy, powiadomienia |

---

## Architektura

```
serwis-samochodowy/
├── frontend/          # Aplikacja Angular (SPA)
└── backend/           # Serwer API Express.js
```

System stosuje **architekturę dwubazodanową**:
- **MySQL** przechowuje dane logowania i role (lekkie, relacyjne).
- **MongoDB** przechowuje dane domenowe (elastyczne, dokumentowe).

Komunikacja frontend ↔ backend odbywa się przez **REST API** z autoryzacją **JWT Bearer Token**.

---

## Funkcjonalności

### 👤 Klient
- Rejestracja i logowanie
- Zarządzanie pojazdami (dodawanie, edycja, usuwanie)
- Umawianie wizyt z wyborem pojazdu, daty i godziny
- Podgląd historii wizyt i ich statusów
- Przeglądanie kosztorysu naprawy wystawionego przez mechanika
- Zatwierdzanie lub anulowanie kosztorysu/wizyty
- System powiadomień o zmianach statusu wizyty

### 🔧 Mechanik
- Podgląd wszystkich wizyt w układzie kalendarza
- Lista klientów z ich pojazdami i historią wizyt
- Zarządzanie statusem wizyty
- Wystawianie diagnozy: opis usterek, wymagane usługi, części, kosztorys
- Usuwanie wizyt
- Dostęp do statystyk (najczęstsze usterki, najpopularniejsze usługi)

---

## Role użytkowników

| Rola | Opis | Dostęp |
|---|---|---|
| `user` | Zarejestrowany klient | Panel klienta |
| `mechanic` | Pracownik warsztatu | Panel mechanika + klientów |

Role są przypisywane w bazie MySQL w kolumnie `role` tabeli `users`.

---

## Struktura projektu

```
serwis-samochodowy/
│
├── backend/
│   ├── databases/
│   │   └── users.sql              # Schemat tabeli MySQL
│   ├── models/                    # Modele Mongoose (MongoDB)
│   │   ├── client.js
│   │   ├── vehicle.js
│   │   ├── visit.js
│   │   ├── diagnosis.js
│   │   ├── fault.js
│   │   ├── service.js
│   │   ├── part.js
│   │   ├── mechanic.js
│   │   └── notification.js
│   ├── db.js                      # Połączenie MySQL
│   ├── mongo.js                   # Połączenie MongoDB
│   ├── server.js                  # Główny serwer Express
│   ├── seed.js                    # Seed danych MySQL
│   ├── seed-mysql.js              # Seed użytkowników MySQL
│   ├── seed-mongo.js              # Seed danych MongoDB
│   └── .env                       # Zmienne środowiskowe (nie commitować!)
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   │   └── panel-site-components/
    │   │   │       ├── client-panel/
    │   │   │       │   ├── client-cars/       # Zarządzanie pojazdami
    │   │   │       │   ├── client-visits/     # Historia wizyt klienta
    │   │   │       │   ├── schedule-visit/    # Umawianie wizyt
    │   │   │       │   └── visits/            # Podgląd wizyt
    │   │   │       ├── mechanic panel/
    │   │   │       │   ├── calendar/          # Kalendarz wizyt
    │   │   │       │   ├── clients/           # Lista klientów
    │   │   │       │   ├── repairs/           # Zarządzanie naprawami
    │   │   │       │   └── statistical-report/ # Statystyki
    │   │   │       ├── notifications/         # Powiadomienia
    │   │   │       ├── panel/                 # Główny panel
    │   │   │       └── site-header/           # Nagłówek
    │   │   ├── login-site/                    # Strona logowania/rejestracji
    │   │   ├── panel-site/                    # Główny widok panelu
    │   │   ├── services/                      # Serwisy Angular (HTTP)
    │   │   └── app.routes.ts                  # Routing aplikacji
    │   ├── index.html
    │   └── styles.css
    └── angular.json
```

---

## API – przegląd endpointów

### Publiczne (bez autoryzacji)

| Metoda | Endpoint | Opis |
|---|---|---|
| `POST` | `/api/login` | Logowanie, zwraca JWT |
| `POST` | `/api/register` | Rejestracja nowego klienta |

### Klient (`role: user`)

| Metoda | Endpoint | Opis |
|---|---|---|
| `GET` | `/api/client-cars` | Lista pojazdów klienta |
| `POST` | `/api/client-cars` | Dodaj pojazd |
| `PUT` | `/api/client-cars/:id` | Edytuj pojazd |
| `DELETE` | `/api/client-cars/:id` | Usuń pojazd |
| `GET` | `/api/client-visits` | Historia wizyt klienta |
| `POST` | `/api/visits` | Umów wizytę |
| `GET` | `/api/car-visits/:id` | Wizyty dla konkretnego pojazdu |
| `GET` | `/api/visit-diagnosis/:id` | Diagnoza/kosztorys wizyty |
| `POST` | `/api/client-visits/accept/:id` | Zatwierdź kosztorys |
| `POST` | `/api/client-visits/cancel/:id` | Anuluj wizytę |
| `GET` | `/api/notifications` | Powiadomienia klienta |
| `PATCH` | `/api/notifications/read/:id` | Oznacz jako przeczytane |
| `DELETE` | `/api/notifications/:id` | Usuń powiadomienie |

### Mechanik (`role: mechanic`)

| Metoda | Endpoint | Opis |
|---|---|---|
| `GET` | `/api/visits` | Wszystkie wizyty |
| `PATCH` | `/api/visits/:id/status` | Zmień status wizyty |
| `DELETE` | `/api/visits/:id` | Usuń wizytę |
| `GET` | `/api/clients` | Lista klientów |
| `GET` | `/api/mechanic/visits/:id/diagnosis` | Diagnoza wizyty |
| `PUT` | `/api/visits/:id/diagnosis` | Zapisz diagnozę/kosztorys |
| `GET` | `/api/faults` | Słownik usterek |
| `GET` | `/api/services` | Słownik usług |
| `GET` | `/api/parts` | Słownik części |

---

## Statusy wizyt

Wizyty przechodzą przez następujące stany:

```
nadchodzące
    ↓
oczekiwanie na kosztorys
    ↓
oczekiwanie na zatwierdzenie kosztorysu
    ↓  (klient zatwierdza)
w trakcie naprawy
    ↓
zakończone

(lub w dowolnym momencie → anulowane)
```

---

## Instalacja

Szczegółowe instrukcje instalacji znajdziesz w pliku [INSTALL.md](./INSTALL.md).
