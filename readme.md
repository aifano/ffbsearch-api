# IFS Sync API

Die **IFS Sync API** ist ein Microservice zur Synchronisation von Daten aus dem IFS-System mit Supabase und Algolia. Sie empfängt strukturierte Events aus IFS (z. B. Insert, Update, Delete) und verarbeitet diese über REST-Endpoints weiter.

Der Service läuft als Container innerhalb der Supabase-Docker-Umgebung.

---

## 🔧 Projektstruktur

Das Projekt liegt unter:
```
supabase/docker/ifs-sync
```

## 🐳 Docker Compose Integration

In der Datei `supabase/docker-compose.yml` muss folgender Eintrag hinzugefügt werden:

```yaml
  ifs_sync:
    build:
      context: ./ifs-sync
      dockerfile: Dockerfile
    pull_policy: always
    restart: unless-stopped
    env_file:
      - ./ifs-sync/.env
```

## 🔀 API Gateway Routing

In der Datei `supabase/docker/volumes/api/long.yml` wird der Service im Gateway registriert:

```yaml
  ## IFS-Sync-API
  - name: ifs-sync
    _comment: 'API für die Syncronisation von IFS'
    url: http://ifs_sync:3000/
    routes:
      - name: ifs-sync-route
        strip_path: false
        paths:
          - /ifs-sync/
    plugins:
      - name: cors
```

---

## 📦 Funktionsweise

- Die API stellt für jede IFS-Tabelle einen POST-Endpunkt zur Verfügung: `/ifs-sync/<tabelle>`
- Payload muss folgende Struktur haben:

```json
{
  "action": "insert" | "update" | "upsert" | "delete",
  "data": {
    ...Daten zur Tabelle
  }
}
```

- Alle Änderungen werden geprüft, validiert und mit Prisma an Supabase weitergereicht.

---

## 🧪 Testen

- Tests befinden sich im Ordner `tests/`
- Ausführen mit:

```bash
npm run test
```
