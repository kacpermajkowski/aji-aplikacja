# Aplikacje w językach interpretowanych

## Zadanie 3


### Autorzy
- Kacper Majkowski **251578**
- Tobiasz Kowalczyk **xxxxxx**

### Jak uruchomić?

1. Znawiguj do folderu będącego korzeniem repozytorium
2. Wykonaj kolejne kroki odpowiednie dla wybranego wariantu

### Wariant 1 - uruchomienie na produkcji

1. Wykonaj polecenie
```bash
docker-compose --file "./docker-compose-prod.yml" up -d
```

### Wariant 2 - uruchomienie w celach deweloperskich

#### Wariant 2a - wszystko w kontenerach

1. Uruchom zestaw kontenerów
```bash
docker-compose --file "./docker-compose-dev.yml" up -d
```

Zostaną uruchomione trzy kontenery: baza danych, frontend i backend. Baza danych korzysta z **docker named volume**, natomiast frontend i backend bazują na plikach znajdujących się w folderach ./backend i ./frontend

#### Wariant 2b - tylko baza w kontenerze

1. Wykonaj polecenie
```bash
docker-compose --file "./docker-compose-only-db.yml" up -d
```

W konterze zostanie uruchomiona tylko baza danych.

2. Ustaw zmienne środowiskowe:
```
      VITE_API_URL: http://backend:3000
      DATABASE_URL: postgresql://postgres:postgres@postgres:6767/aji_db
      PORT: 3000
```

3. Uruchom frontend (zalecamy wykorzystanie bun zamiast npm)
```bash
cd ./frontend
bun install
bun run dev
```

4. Uruchom backend
```bash
cd ../backend
bun install
bun run dev
```



