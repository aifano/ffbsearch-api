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

In der Datei `supabase/docker/volumes/api/long.yml` müssen einige Einstellungen hinzugefügt werden.
- Für ein eigenen API-Key:
```yaml
###
### Consumers / Users
###
consumers:
  - username: ifs_sync
    keyauth_credentials:
      - key: ••••••
```

- Bei ACL die Gruppe hinzufügen:
```yaml
###
### Access Control List
###
acls:
  - consumer: ifs_sync
    group: ifs_sync
```

- Und abschließend den Service anlegen:
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
      - name: key-auth
        config:
          hide_credentials: false
      - name: acl
        config:
          hide_groups_header: true
          allow:
            - ifs_sync
```

---

## 📦 Funktionsweise

- Die API stellt für jede IFS-Tabelle einen POST-Endpunkt zur Verfügung: `/ifs-sync/<tabellen-alias>`
- Payload muss folgende Struktur haben:

```json
{
  "action": "insert" | "update" | "upsert" | "delete",
  "data": {
    ...Daten zur Tabelle
  }
}
```

- Der API-Key muss im Header mit `apikey: ••••••` übergeben werden.

- Alle Änderungen werden geprüft, validiert und mit Prisma an Supabase weitergereicht.

---

## 🧪 Testen

- Tests befinden sich im Ordner `tests/`
- Ausführen mit:

```bash
npm run test
```



# IFS Configuration

## REST-Sender
abc

## Custom-Events / Event-Actions
Unter `Solution manager / User Interface / Custom Objects / New Custom Event` sollen die folgenden `Custom Objects`, sowie die dazugehörigen `Event Actions` erstellt werden.

### InventoryPartInStock <-> artikelbestand
* Custom-Event / Event-ID:
  * Upsert: `C_NXS_InvPartInStk_Upsert`
  * Delete: `C_NXS_InvPartInStk_Delete`
* Custom-Event / Descripton: `Wird ausgelöst, wenn Lagerbestandsdaten erstellt, aktualisiert, oder gelöscht werden`
* Custom-Event / Event Enabled: `True`
* Custom-Event / Logical Unit: `InventoryPartInStock`
* Custom-Event / Table: `INVENTORY_PART_TAB`
* Custom-Event / Fire When:
  * Upsert: `New objects are created` und `Objects are changed`
  * Delete: `Object are removed`
* Custom-Event / Fire before or afer object is changed: `After`
* Custom-Event / Select attributes: Alle `New Value`
* Event-Action / Action Type: `REST Call`
* Event-Action / Perform upon Event:
  * Upsert: `C_NXS_InvPartInStk_Upsert`
  * Delete: `C_NXS_InvPartInStk_Delete`
* Event-Action / Action Description: `Updatet die NXSearch Datenbank`
* Event-Action / REST End Point: `https://api.ffbsearch.aifano.com/ifs-sync/artikelbestand`
* Event-Action / Method: `POST`
* Event-Action / Sender: `NXS_REST_SENDER`
* Event-Action / Authenication: `None`
* Event-Action / Additional Header Parameters: `apikey: apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmciOnsiaWQiOiJvcmdfMnc4WWU3eEJUYkNwaFVDdWJHeG9PV2x5R2ROIn0sInR5cGUiOiJpZnMuc3VwcGxpZXIifQ._Q-97RIFnWGb9fnEDfRUPAL8NurYuK6SunYZ7OdPXTg`
* Event-Action / Body:
```json
{
  "action": "upsert" | "delete",
  "data": {
    "PART_NO": "&NEW:PART_NO",
    "CONTRACT": "&NEW:CONTRACT",
    "CONFIGURATION_ID": "&NEW:CONFIGURATION_ID",
    "LOCATION_NO": "&NEW:LOCATION_NO",
    "LOT_BATCH_NO": "&NEW:LOT_BATCH_NO",
    "SERIAL_NO": "&NEW:SERIAL_NO",
    "ENG_CHG_LEVEL": "&NEW:ENG_CHG_LEVEL",
    "WAIV_DEV_REJ_NO": "&NEW:WAIV_DEV_REJ_NO",
    "ACTIVITY_SEQ": "&NEW:ACTIVITY_SEQ",
    "HANDLING_UNIT_ID": "&NEW:HANDLING_UNIT_ID",
    "AVG_UNIT_TRANSIT_COST": "&NEW:AVG_UNIT_TRANSIT_COST",
    "COUNT_VARIANCE": "&NEW:COUNT_VARIANCE",
    "EXPIRATION_DATE": "&NEW:EXPIRATION_DATE",
    "FREEZE_FLAG": "&NEW:FREEZE_FLAG",
    "LAST_ACTIVITY_DATE": "&NEW:LAST_ACTIVITY_DATE",
    "LAST_COUNT_DATE": "&NEW:LAST_COUNT_DATE",
    "LOCATION_TYPE": "&NEW:LOCATION_TYPE",
    "QTY_IN_TRANSIT": "&NEW:QTY_IN_TRANSIT",
    "QTY_ONHAND": "&NEW:QTY_ONHAND",
    "QTY_RESERVED": "&NEW:QTY_RESERVED",
    "RECEIPT_DATE": "&NEW:RECEIPT_DATE",
    "SOURCE": "&NEW:SOURCE",
    "WAREHOUSE": "&NEW:WAREHOUSE",
    "BAY_NO": "&NEW:BAY_NO",
    "ROW_NO": "&NEW:ROW_NO",
    "TIER_NO": "&NEW:TIER_NO",
    "BIN_NO": "&NEW:BIN_NO",
    "AVAILABILITY_CONTROL_ID": "&NEW:AVAILABILITY_CONTROL_ID",
    "CREATE_DATE": "&NEW:CREATE_DATE",
    "ROTABLE_PART_POOL_ID": "&NEW:ROTABLE_PART_POOL_ID",
    "PROJECT_ID": "&NEW:PROJECT_ID",
    "CATCH_QTY_IN_TRANSIT": "&NEW:CATCH_QTY_IN_TRANSIT",
    "CATCH_QTY_ONHAND": "&NEW:CATCH_QTY_ONHAND",
    "PART_OWNERSHIP": "&NEW:PART_OWNERSHIP",
    "OWNING_CUSTOMER_NO": "&NEW:OWNING_CUSTOMER_NO",
    "OWNING_VENDOR_NO": "&NEW:OWNING_VENDOR_NO",
    "ROWVERSION": "&NEW:ROWVERSION",
    "ROWKEY": "&NEW:ROWKEY",
    "LATEST_TRANSACTION_ID": "&NEW:LATEST_TRANSACTION_ID"
  }
}
```

### PartCatalog <-> hauptartikeldaten
* Custom-Event / Event-ID:
  * Upsert: `C_NXS_PartCatalog_Upsert`
  * Delete: `C_NXS_PartCatalog_Delete`
* Custom-Event / Descripton: `Wird ausgelöst, wenn Hauptartikeldaten erstellt, aktualisiert, oder gelöscht werden`
* Custom-Event / Event Enabled: `True`
* Custom-Event / Logical Unit: `PartCatalog`
* Custom-Event / Table: `PART_CATALOG_TAB`
* Custom-Event / Fire When:
  * Upsert: `New objects are created` und `Objects are changed`
  * Delete: `Object are removed`
* Custom-Event / Fire before or afer object is changed: `After`
* Custom-Event / Select attributes: Alle `New Value`
* Event-Action / Action Type: `REST Call`
* Event-Action / Perform upon Event:
  * Upsert: `C_NXS_PartCatalog_Upsert`
  * Delete: `C_NXS_PartCatalog_Delete`
* Event-Action / Action Description: `Updatet die NXSearch Datenbank`
* Event-Action / REST End Point: `https://api.ffbsearch.aifano.com/ifs-sync/hauptartikeldaten`
* Event-Action / Method: `POST`
* Event-Action / Sender: `NXS_REST_SENDER`
* Event-Action / Authenication: `None`
* Event-Action / Additional Header Parameters: `apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmciOnsiaWQiOiJvcmdfMnc4WWU3eEJUYkNwaFVDdWJHeG9PV2x5R2ROIn0sInR5cGUiOiJpZnMuc3VwcGxpZXIifQ._Q-97RIFnWGb9fnEDfRUPAL8NurYuK6SunYZ7OdPXTg`
* Event-Action / Body:
```json
{
  "action": "upsert" | "delete",
  "data": {
    "PART_NO": "&NEW:PART_NO",
    "DESCRIPTION": "&NEW:DESCRIPTION",
    "INFO_TEXT": "&NEW:INFO_TEXT",
    "STD_NAME_ID": "&NEW:STD_NAME_ID",
    "UNIT_CODE": "&NEW:UNIT_CODE",
    "LOT_TRACKING_CODE": "&NEW:LOT_TRACKING_CODE",
    "SERIAL_RULE": "&NEW:SERIAL_RULE",
    "SERIAL_TRACKING_CODE": "&NEW:SERIAL_TRACKING_CODE",
    "ENG_SERIAL_TRACKING_CODE": "&NEW:ENG_SERIAL_TRACKING_CODE",
    "PART_MAIN_GROUP": "&NEW:PART_MAIN_GROUP",
    "CONFIGURABLE": "&NEW:CONFIGURABLE",
    "CUST_WARRANTY_ID": "&NEW:CUST_WARRANTY_ID",
    "SUP_WARRANTY_ID": "&NEW:SUP_WARRANTY_ID",
    "CONDITION_CODE_USAGE": "&NEW:CONDITION_CODE_USAGE",
    "SUB_LOT_RULE": "&NEW:SUB_LOT_RULE",
    "LOT_QUANTITY_RULE": "&NEW:LOT_QUANTITY_RULE",
    "POSITION_PART": "&NEW:POSITION_PART",
    "INPUT_UNIT_MEAS_GROUP_ID": "&NEW:INPUT_UNIT_MEAS_GROUP_ID",
    "CATCH_UNIT_ENABLED": "&NEW:CATCH_UNIT_ENABLED",
    "MULTILEVEL_TRACKING": "&NEW:MULTILEVEL_TRACKING",
    "COMPONENT_LOT_RULE": "&NEW:COMPONENT_LOT_RULE",
    "STOP_ARRIVAL_ISSUED_SERIAL": "&NEW:STOP_ARRIVAL_ISSUED_SERIAL",
    "WEIGHT_NET": "&NEW:WEIGHT_NET",
    "UOM_FOR_WEIGHT_NET": "&NEW:UOM_FOR_WEIGHT_NET",
    "VOLUME_NET": "&NEW:VOLUME_NET",
    "UOM_FOR_VOLUME_NET": "&NEW:UOM_FOR_VOLUME_NET",
    "FREIGHT_FACTOR": "&NEW:FREIGHT_FACTOR",
    "ALLOW_AS_NOT_CONSUMED": "&NEW:ALLOW_AS_NOT_CONSUMED",
    "RECEIPT_ISSUE_SERIAL_TRACK": "&NEW:RECEIPT_ISSUE_SERIAL_TRACK",
    "STOP_NEW_SERIAL_IN_RMA": "&NEW:STOP_NEW_SERIAL_IN_RMA",
    "TEXT_ID": "&NEW:TEXT_ID$",
    "ROWVERSION": "&NEW:ROWVERSION",
    "ROWKEY": "&NEW:ROWKEY"
  }
}
```

### InventoryLocation <-> locations
* Custom-Event / Event-ID:
  * Upsert: `C_NXS_InvLocation_Upsert`
  * Delete: `C_NXS_InvLocation_Delete`
* Custom-Event / Descripton: `Wird ausgelöst, wenn Lagerorte erstellt, aktualisiert, oder gelöscht werden`
* Custom-Event / Event Enabled: `True`
* Custom-Event / Logical Unit: `InventoryLocation`
* Custom-Event / Table: `WAREHOUSE_BAY_BIN_TAB`
* Custom-Event / Fire When:
  * Upsert: `New objects are created` und `Objects are changed`
  * Delete: `Object are removed`
* Custom-Event / Fire before or afer object is changed: `After`
* Custom-Event / Select attributes: Alle `New Value`
* Event-Action / Action Type: `REST Call`
* Event-Action / Perform upon Event:
  * Upsert: `C_NXS_InvLocation_Upsert`
  * Delete: `C_NXS_InvLocation_Delete`
* Event-Action / Action Description: `Updatet die NXSearch Datenbank`
* Event-Action / REST End Point: `https://api.ffbsearch.aifano.com/ifs-sync/locations`
* Event-Action / Method: `POST`
* Event-Action / Sender: `NXS_REST_SENDER`
* Event-Action / Authenication: `None`
* Event-Action / Additional Header Parameters: `apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmciOnsiaWQiOiJvcmdfMnc4WWU3eEJUYkNwaFVDdWJHeG9PV2x5R2ROIn0sInR5cGUiOiJpZnMuc3VwcGxpZXIifQ._Q-97RIFnWGb9fnEDfRUPAL8NurYuK6SunYZ7OdPXTg`
* Event-Action / Body:
```json
{
  "action": "upsert" | "delete",
  "data": {
  }
}
```

### PartCatalogInventAttrib <-> mappingAttributeDescription
* Custom-Event / Event-ID:
  * Upsert: `C_NXS_PartAttribute_Upsert`
  * Delete: `C_NXS_PartAttribute_Delete`
* Custom-Event / Descripton: `Wird ausgelöst, wenn Attributezuordnungen erstellt, aktualisiert, oder gelöscht werden`
* Custom-Event / Event Enabled: `True`
* Custom-Event / Logical Unit: `PartCatalogInventAttrib`
* Custom-Event / Table: `PART_CATALOG_INVENT_ATTRIB_TAB`
* Custom-Event / Fire When:
  * Upsert: `New objects are created` und `Objects are changed`
  * Delete: `Object are removed`
* Custom-Event / Fire before or afer object is changed: `After`
* Custom-Event / Select attributes: Alle `New Value`
* Event-Action / Action Type: `REST Call`
* Event-Action / Perform upon Event:
  * Upsert: `C_NXS_PartAttribute_Upsert`
  * Delete: `C_NXS_PartAttribute_Delete`
* Event-Action / Action Description: `Updatet die NXSearch Datenbank`
* Event-Action / REST End Point: `https://api.ffbsearch.aifano.com/ifs-sync/mapping-attribute`
* Event-Action / Method: `POST`
* Event-Action / Sender: `NXS_REST_SENDER`
* Event-Action / Authenication: `None`
* Event-Action / Additional Header Parameters: `apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmciOnsiaWQiOiJvcmdfMnc4WWU3eEJUYkNwaFVDdWJHeG9PV2x5R2ROIn0sInR5cGUiOiJpZnMuc3VwcGxpZXIifQ._Q-97RIFnWGb9fnEDfRUPAL8NurYuK6SunYZ7OdPXTg`
* Event-Action / Body:
```json
{
  "action": "upsert" | "delete",
  "data": {
  }
}
```

### TechnicalClass <-> mappingTechnicalClassDescription
* Custom-Event / Event-ID:
  * Upsert: `C_NXS_TechClassEnt_Upsert`
  * Delete: `C_NXS_TechClassEnt_Delete`
* Custom-Event / Descripton: `Wird ausgelöst, wenn technische Klassifizierungen erstellt, aktualisiert, oder gelöscht werden`
* Custom-Event / Event Enabled: `True`
* Custom-Event / Logical Unit: `TechnicalClass`
* Custom-Event / Table: `TECHNICAL_CLASS_TAB`
* Custom-Event / Fire When:
  * Upsert: `New objects are created` und `Objects are changed`
  * Delete: `Object are removed`
* Custom-Event / Fire before or afer object is changed: `After`
* Custom-Event / Select attributes: Alle `New Value`
* Event-Action / Action Type: `REST Call`
* Event-Action / Perform upon Event:
  * Upsert: `C_NXS_TechClassEnt_Upsert`
  * Delete: `C_NXS_TechClassEnt_Delete`
* Event-Action / Action Description: `Updatet die NXSearch Datenbank`
* Event-Action / REST End Point: `https://api.ffbsearch.aifano.com/ifs-sync/mapping-techclass`
* Event-Action / Method: `POST`
* Event-Action / Sender: `NXS_REST_SENDER`
* Event-Action / Authenication: `None`
* Event-Action / Additional Header Parameters: `apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmciOnsiaWQiOiJvcmdfMnc4WWU3eEJUYkNwaFVDdWJHeG9PV2x5R2ROIn0sInR5cGUiOiJpZnMuc3VwcGxpZXIifQ._Q-97RIFnWGb9fnEDfRUPAL8NurYuK6SunYZ7OdPXTg`
* Event-Action / Body:
```json
{
  "action": "upsert" | "delete",
  "data": {
    "TECHNICAL_CLASS": "&NEW:TECHNICAL_CLASS",
    "DESCRIPTION": "&NEW:DESCRIPTION"
  }
}
```

### ??? <-> merkmalsdaten
* Custom-Event / Event-ID:
  * Upsert: `C_NXS_??_Upsert`
  * Delete: `C_NXS_??_Delete`
* Custom-Event / Descripton: `Wird ausgelöst, wenn Merkmalsdaten erstellt, aktualisiert, oder gelöscht werden`
* Custom-Event / Event Enabled: `True`
* Custom-Event / Logical Unit: `??`
* Custom-Event / Table: `??`
* Custom-Event / Fire When:
  * Upsert: `New objects are created` und `Objects are changed`
  * Delete: `Object are removed`
* Custom-Event / Fire before or afer object is changed: `After`
* Custom-Event / Select attributes: Alle `New Value`
* Event-Action / Action Type: `REST Call`
* Event-Action / Perform upon Event:
  * Upsert: `C_NXS_??_Upsert`
  * Delete: `C_NXS_??_DELETE`
* Event-Action / Action Description: `Updatet die NXSearch Datenbank`
* Event-Action / REST End Point: `https://api.ffbsearch.aifano.com/ifs-sync/merkmalsdaten`
* Event-Action / Method: `POST`
* Event-Action / Sender: `NXS_REST_SENDER`
* Event-Action / Authenication: `None`
* Event-Action / Additional Header Parameters: `apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmciOnsiaWQiOiJvcmdfMnc4WWU3eEJUYkNwaFVDdWJHeG9PV2x5R2ROIn0sInR5cGUiOiJpZnMuc3VwcGxpZXIifQ._Q-97RIFnWGb9fnEDfRUPAL8NurYuK6SunYZ7OdPXTg`
* Event-Action / Body:
```json
{
  "action": "upsert" | "delete",
  "data": {
  }
}
```

### ??? <-> referenzArtikelMerkmale
* Custom-Event / Event-ID:
  * Upsert: `C_NXS_??_Upsert`
  * Delete: `C_NXS_??_Delete`
* Custom-Event / Descripton: `Wird ausgelöst, wenn Referenzdaten für Artikelmerkmale erstellt, aktualisiert, oder gelöscht werden`
* Custom-Event / Event Enabled: `True`
* Custom-Event / Logical Unit: `??`
* Custom-Event / Table: `??`
* Custom-Event / Fire When:
  * Upsert: `New objects are created` und `Objects are changed`
  * Delete: `Object are removed`
* Custom-Event / Fire before or afer object is changed: `After`
* Custom-Event / Select attributes: Alle `New Value`
* Event-Action / Action Type: `REST Call`
* Event-Action / Perform upon Event:
  * Upsert: `C_NXS_??_Upsert`
  * Delete: `C_NXS_??_DELETE`
* Event-Action / Action Description: `Updatet die NXSearch Datenbank`
* Event-Action / REST End Point: `https://api.ffbsearch.aifano.com/ifs-sync/referenz-artikel-merkmale`
* Event-Action / Method: `POST`
* Event-Action / Sender: `NXS_REST_SENDER`
* Event-Action / Authenication: `None`
* Event-Action / Additional Header Parameters: `apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmciOnsiaWQiOiJvcmdfMnc4WWU3eEJUYkNwaFVDdWJHeG9PV2x5R2ROIn0sInR5cGUiOiJpZnMuc3VwcGxpZXIifQ._Q-97RIFnWGb9fnEDfRUPAL8NurYuK6SunYZ7OdPXTg`
* Event-Action / Body:
```json
{
  "action": "upsert" | "delete",
  "data": {
  }
}
```
