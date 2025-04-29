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

### InventoryPartInStockTab <-> artikelbestand
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
* Event-Action / REST End Point: `https://api.ffbsearch.aifano.com/ifs-sync/artikelbestand` oder `https://api.ffbsearch.aifano.com/ifs-sync/inventory_part_in_stock_tab`
* Event-Action / Method: `POST`
* Event-Action / Sender: `NXS_REST_SENDER`
* Event-Action / Authenication: `None`
* Event-Action / Additional Header Parameters: `apikey: apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmciOnsiaWQiOiJvcmdfMnc4WWU3eEJUYkNwaFVDdWJHeG9PV2x5R2ROIn0sInR5cGUiOiJpZnMuc3VwcGxpZXIifQ._Q-97RIFnWGb9fnEDfRUPAL8NurYuK6SunYZ7OdPXTg`
* Event-Action / Body:
    <details>
    <summary>Upsert</summary>

    ```json
    {
    "action": "upsert",
    "data": {
        "ACTIVITY_SEQ": "&NEW:ACTIVITY_SEQ",
        "AVAILABILITY_CONTROL_ID": "&NEW:AVAILABILITY_CONTROL_ID",
        "AVG_UNIT_TRANSIT_COST": "&NEW:AVG_UNIT_TRANSIT_COST",
        "BAY_NO": "&NEW:BAY_NO",
        "BIN_NO": "&NEW:BIN_NO",
        "CATCH_QTY_IN_TRANSIT": "&NEW:CATCH_QTY_IN_TRANSIT",
        "CATCH_QTY_ONHAND": "&NEW:CATCH_QTY_ONHAND",
        "CONFIGURATION_ID": "&NEW:CONFIGURATION_ID",
        "CONTRACT": "&NEW:CONTRACT",
        "COUNT_VARIANCE": "&NEW:COUNT_VARIANCE",
        "CREATE_DATE": "&NEW:CREATE_DATE",
        "ENG_CHG_LEVEL": "&NEW:ENG_CHG_LEVEL",
        "EXPIRATION_DATE": "&NEW:EXPIRATION_DATE",
        "FREEZE_FLAG": "&NEW:FREEZE_FLAG",
        "HANDLING_UNIT_ID": "&NEW:HANDLING_UNIT_ID",
        "LAST_ACTIVITY_DATE": "&NEW:LAST_ACTIVITY_DATE",
        "LAST_COUNT_DATE": "&NEW:LAST_COUNT_DATE",
        "LATEST_TRANSACTION_ID": "&NEW:LATEST_TRANSACTION_ID",
        "LOCATION_NO": "&NEW:LOCATION_NO",
        "LOCATION_TYPE": "&NEW:LOCATION_TYPE",
        "LOT_BATCH_NO": "&NEW:LOT_BATCH_NO",
        "OWNING_CUSTOMER_NO": "&NEW:OWNING_CUSTOMER_NO",
        "OWNING_VENDOR_NO": "&NEW:OWNING_VENDOR_NO",
        "PART_NO": "&NEW:PART_NO",
        "PART_OWNERSHIP": "&NEW:PART_OWNERSHIP",
        "PROJECT_ID": "&NEW:PROJECT_ID",
        "QTY_IN_TRANSIT": "&NEW:QTY_IN_TRANSIT",
        "QTY_ONHAND": "&NEW:QTY_ONHAND",
        "QTY_RESERVED": "&NEW:QTY_RESERVED",
        "RECEIPT_DATE": "&NEW:RECEIPT_DATE",
        "ROTABLE_PART_POOL_ID": "&NEW:ROTABLE_PART_POOL_ID",
        "ROW_NO": "&NEW:ROW_NO",
        "ROWKEY": "&NEW:ROWKEY",
        "ROWVERSION": "&NEW:ROWVERSION",
        "SERIAL_NO": "&NEW:SERIAL_NO",
        "SOURCE": "&NEW:SOURCE",
        "TIER_NO": "&NEW:TIER_NO",
        "WAIV_DEV_REJ_NO": "&NEW:WAIV_DEV_REJ_NO",
        "WAREHOUSE": "&NEW:WAREHOUSE"
    }
    }
    ```

    </details>
    <details>
    <summary>Delete</summary>

    ```json
    {
        "action": "delete",
        "data": {
            "ROWKEY": "&NEW:ROWKEY"
        }
    }
    ```

    </details>

### LanguageSysTab <-> language_sys_tab
* Custom-Event / Event-ID:
  * Upsert: `C_NXS_LanguageSys_Upsert`
  * Delete: `C_NXS_LanguageSys_Delete`
* Custom-Event / Descripton: `Wird ausgelöst, wenn Lagerbestandsdaten erstellt, aktualisiert, oder gelöscht werden`
* Custom-Event / Event Enabled: `True`
* Custom-Event / Logical Unit: ``
* Custom-Event / Table: `LANGUAGE_SYS_TAB`
* Custom-Event / Fire When:
  * Upsert: `New objects are created` und `Objects are changed`
  * Delete: `Object are removed`
* Custom-Event / Fire before or afer object is changed: `After`
* Custom-Event / Select attributes: Alle `New Value`
* Event-Action / Action Type: `REST Call`
* Event-Action / Perform upon Event:
  * Upsert: `C_NXS_LanguageSys_Upsert`
  * Delete: `C_NXS_LanguageSys_Delete`
* Event-Action / Action Description: `Updatet die NXSearch Datenbank`
* Event-Action / REST End Point: `https://api.ffbsearch.aifano.com/ifs-sync/language_sys_tab`
* Event-Action / Method: `POST`
* Event-Action / Sender: `NXS_REST_SENDER`
* Event-Action / Authenication: `None`
* Event-Action / Additional Header Parameters: `apikey: apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmciOnsiaWQiOiJvcmdfMnc4WWU3eEJUYkNwaFVDdWJHeG9PV2x5R2ROIn0sInR5cGUiOiJpZnMuc3VwcGxpZXIifQ._Q-97RIFnWGb9fnEDfRUPAL8NurYuK6SunYZ7OdPXTg`
* Event-Action / Body:
    <details>
    <summary>Upsert</summary>

    ```json
    {
    "action": "upsert",
    "data": {
        "MAIN_TYPE": "&NEW:MAIN_TYPE",
        "TYPE": "&NEW:TYPE",
        "PATH": "&NEW:PATH",
        "ATTRIBUTE": "&NEW:ATTRIBUTE",
        "LANG_CODE": "&NEW:LANG_CODE",
        "MODULE": "&NEW:MODULE",
        "TEXT": "&NEW:TEXT",
        "INSTALLATION_TEXT": "&NEW:INSTALLATION_TEXT",
        "SYSTEM_DEFINED": "&NEW:SYSTEM_DEFINED",
        "BULK": "&NEW:BULK",
        "ROWVERSION": "&NEW:ROWVERSION",
        "LAYER": "&NEW:LAYER"
    }
    }
    ```

    </details>
    <details>
    <summary>Delete</summary>

    ```json
    {
        "action": "delete",
        "data": {
            "PATH": "&NEW:PATH",
            "ATTRIBUTE": "&NEW:ATTRIBUTE",
            "LANG_CODE": "&NEW:LANG_CODE"
        }
    }
    ```

    </details>



### PartCatalogTab <-> hauptartikeldaten
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
* Event-Action / REST End Point: `https://api.ffbsearch.aifano.com/ifs-sync/hauptartikeldaten` oder `https://api.ffbsearch.aifano.com/ifs-sync/part_catalog_tab`
* Event-Action / Method: `POST`
* Event-Action / Sender: `NXS_REST_SENDER`
* Event-Action / Authenication: `None`
* Event-Action / Additional Header Parameters: `apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmciOnsiaWQiOiJvcmdfMnc4WWU3eEJUYkNwaFVDdWJHeG9PV2x5R2ROIn0sInR5cGUiOiJpZnMuc3VwcGxpZXIifQ._Q-97RIFnWGb9fnEDfRUPAL8NurYuK6SunYZ7OdPXTg`
* Event-Action / Body:
    <details>
    <summary>Upsert</summary>

    ```json
    {
        "action": "upsert",
        "data": {
            "ALLOW_AS_NOT_CONSUMED": "&NEW:ALLOW_AS_NOT_CONSUMED",
            "CATCH_UNIT_ENABLED": "&NEW:CATCH_UNIT_ENABLED",
            "COMPONENT_LOT_RULE": "&NEW:COMPONENT_LOT_RULE",
            "CONDITION_CODE_USAGE": "&NEW:CONDITION_CODE_USAGE",
            "CONFIGURABLE": "&NEW:CONFIGURABLE",
            "CUST_WARRANTY_ID": "&NEW:CUST_WARRANTY_ID",
            "DESCRIPTION": "&NEW:DESCRIPTION",
            "ENG_SERIAL_TRACKING_CODE": "&NEW:ENG_SERIAL_TRACKING_CODE",
            "FREIGHT_FACTOR": "&NEW:FREIGHT_FACTOR",
            "INFO_TEXT": "&NEW:INFO_TEXT",
            "INPUT_UNIT_MEAS_GROUP_ID": "&NEW:INPUT_UNIT_MEAS_GROUP_ID",
            "LOT_QUANTITY_RULE": "&NEW:LOT_QUANTITY_RULE",
            "LOT_TRACKING_CODE": "&NEW:LOT_TRACKING_CODE",
            "MULTILEVEL_TRACKING": "&NEW:MULTILEVEL_TRACKING",
            "PART_MAIN_GROUP": "&NEW:PART_MAIN_GROUP",
            "PART_NO": "&NEW:PART_NO",
            "POSITION_PART": "&NEW:POSITION_PART",
            "RECEIPT_ISSUE_SERIAL_TRACK": "&NEW:RECEIPT_ISSUE_SERIAL_TRACK",
            "ROWKEY": "&NEW:ROWKEY",
            "ROWVERSION": "&NEW:ROWVERSION",
            "SERIAL_RULE": "&NEW:SERIAL_RULE",
            "SERIAL_TRACKING_CODE": "&NEW:SERIAL_TRACKING_CODE",
            "STD_NAME_ID": "&NEW:STD_NAME_ID",
            "STOP_ARRIVAL_ISSUED_SERIAL": "&NEW:STOP_ARRIVAL_ISSUED_SERIAL",
            "STOP_NEW_SERIAL_IN_RMA": "&NEW:STOP_NEW_SERIAL_IN_RMA",
            "SUB_LOT_RULE": "&NEW:SUB_LOT_RULE",
            "SUP_WARRANTY_ID": "&NEW:SUP_WARRANTY_ID",
            "TEXT_ID": "&NEW:TEXT_ID",
            "UNIT_CODE": "&NEW:UNIT_CODE",
            "UOM_FOR_VOLUME_NET": "&NEW:UOM_FOR_VOLUME_NET",
            "UOM_FOR_WEIGHT_NET": "&NEW:UOM_FOR_WEIGHT_NET",
            "VOLUME_NET": "&NEW:VOLUME_NET",
            "WEIGHT_NET": "&NEW:WEIGHT_NET"
        }
    }
    ```

    </details>
    <details>
    <summary>Delete</summary>

    ```json
    {
        "action": "delete",
        "data": {
            "ROWKEY": "&NEW:ROWKEY"
        }
    }
    ```

    </details>

### TechnicalObjectReferenceTab <-> referenz_artikel_merkmale
* Custom-Event / Event-ID:
  * Upsert: `C_NXS_TechObjRef_Upsert`
  * Delete: `C_NXS_TechObjRef_Delete`
* Custom-Event / Descripton: `Wird ausgelöst, wenn Artikelmerkmale erstellt, aktualisiert, oder gelöscht werden`
* Custom-Event / Event Enabled: `True`
* Custom-Event / Logical Unit: ``
* Custom-Event / Table: `TECHNICAL_OBJECT_REFERENCE_TAB`
* Custom-Event / Fire When:
  * Upsert: `New objects are created` und `Objects are changed`
  * Delete: `Object are removed`
* Custom-Event / Fire before or afer object is changed: `After`
* Custom-Event / Select attributes: Alle `New Value`
* Event-Action / Action Type: `REST Call`
* Event-Action / Perform upon Event:
  * Upsert: `C_NXS_TechObjRef_Upsert`
  * Delete: `C_NXS_TechObjRef_Delete`
* Event-Action / Action Description: `Updatet die NXSearch Datenbank`
* Event-Action / REST End Point: `https://api.ffbsearch.aifano.com/ifs-sync/referenz-artikel-merkmale` oder `https://api.ffbsearch.aifano.com/ifs-sync/technical_object_reference_tab`
* Event-Action / Method: `POST`
* Event-Action / Sender: `NXS_REST_SENDER`
* Event-Action / Authenication: `None`
* Event-Action / Additional Header Parameters: `apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmciOnsiaWQiOiJvcmdfMnc4WWU3eEJUYkNwaFVDdWJHeG9PV2x5R2ROIn0sInR5cGUiOiJpZnMuc3VwcGxpZXIifQ._Q-97RIFnWGb9fnEDfRUPAL8NurYuK6SunYZ7OdPXTg`
* Event-Action / Body:
    <details>
    <summary>Upsert</summary>

    ```json
    {
        "action": "upsert",
        "data": {
            "DT_OK": "&NEW:DT_OK",
            "KEY_REF": "&NEW:KEY_REF",
            "KEY_VALUE": "&NEW:KEY_VALUE",
            "LU_NAME": "&NEW:LU_NAME",
            "OK_SIGN": "&NEW:OK_SIGN",
            "OK_YES_NO": "&NEW:OK_YES_NO",
            "ROWKEY": "&NEW:ROWKEY",
            "ROWVERSION": "&NEW:ROWVERSION",
            "TECHNICAL_CLASS": "&NEW:TECHNICAL_CLASS",
            "TECHNICAL_SPEC_NO": "&NEW:TECHNICAL_SPEC_NO"
        }
    }
    ```

    </details>
    <details>
    <summary>Delete</summary>

    ```json
    {
        "action": "delete",
        "data": {
            "ROWKEY": "&NEW:ROWKEY"
        }
    }
    ```

    </details>

### TechnicalSpecificationTab <-> merkmalsdaten
* Custom-Event / Event-ID:
  * Upsert: `C_NXS_TechSpecTab_Upsert`
  * Delete: `C_NXS_TechSpecTab_Delete`
* Custom-Event / Descripton: `Wird ausgelöst, wenn Merkmalsdaten erstellt, aktualisiert, oder gelöscht werden`
* Custom-Event / Event Enabled: `True`
* Custom-Event / Logical Unit: ``
* Custom-Event / Table: `TECHNICAL_SPECIFICATION_TAB`
* Custom-Event / Fire When:
  * Upsert: `New objects are created` und `Objects are changed`
  * Delete: `Object are removed`
* Custom-Event / Fire before or afer object is changed: `After`
* Custom-Event / Select attributes: Alle `New Value`
* Event-Action / Action Type: `REST Call`
* Event-Action / Perform upon Event:
  * Upsert: `C_NXS_TechSpecTab_Upsert`
  * Delete: `C_NXS_TechSpecTab_Delete`
* Event-Action / Action Description: `Updatet die NXSearch Datenbank`
* Event-Action / REST End Point: `https://api.ffbsearch.aifano.com/ifs-sync/merkmalsdaten` oder `https://api.ffbsearch.aifano.com/ifs-sync/technical_specification_tab`
* Event-Action / Method: `POST`
* Event-Action / Sender: `NXS_REST_SENDER`
* Event-Action / Authenication: `None`
* Event-Action / Additional Header Parameters: `apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmciOnsiaWQiOiJvcmdfMnc4WWU3eEJUYkNwaFVDdWJHeG9PV2x5R2ROIn0sInR5cGUiOiJpZnMuc3VwcGxpZXIifQ._Q-97RIFnWGb9fnEDfRUPAL8NurYuK6SunYZ7OdPXTg`
* Event-Action / Body:
    <details>
    <summary>Upsert</summary>

    ```json
    {
        "action": "upsert",
        "data": {
            "ALT_UNIT": "&NEW:ALT_UNIT",
            "ALT_VALUE_NO": "&NEW:ALT_VALUE_NO",
            "ATTRIB_NUMBER": "&NEW:ATTRIB_NUMBER",
            "ATTRIBUTE": "&NEW:ATTRIBUTE",
            "INFO": "&NEW:INFO",
            "LOWER_LIMIT": "&NEW:LOWER_LIMIT",
            "ROWKEY": "&NEW:ROWKEY",
            "ROWTYPE": "&NEW:ROWTYPE",
            "ROWVERSION": "&NEW:ROWVERSION",
            "TECHNICAL_CLASS": "&NEW:TECHNICAL_CLASS",
            "TECHNICAL_SPEC_NO": "&NEW:TECHNICAL_SPEC_NO",
            "UPPER_LIMIT": "&NEW:UPPER_LIMIT",
            "VALUE_NO": "&NEW:VALUE_NO",
            "VALUE_TEXT": "&NEW:VALUE_TEXT",
            "C_VALUE_ID": "&NEW:C_VALUE_ID"
        }
    }
    ```

    </details>
    <details>
    <summary>Delete</summary>

    ```json
    {
        "action": "delete",
        "data": {
            "ROWKEY": "&NEW:ROWKEY"
        }
    }
    ```

    </details>
