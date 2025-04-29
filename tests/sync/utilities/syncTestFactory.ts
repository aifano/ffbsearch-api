import { sendSyncRequest } from "./request";

export function generateTests(
    tableName: string,
    primaryKeys: string[],
    foreignKeys: string[],
    updateKey: string,
) {
    const buildTestData = (override: Record<string, string> = {}) => {
        const base: Record<string, string> = {};

        [...primaryKeys, ...foreignKeys].forEach(key => {
            base[key] = "TEST";
        });

        return { ...base, ...override };
    };

    async function cleanup() {
        const keyData = Object.fromEntries(
            primaryKeys.map(key => [key, "TEST"])
        );
        return await sendSyncRequest(tableName, 'delete', keyData);
    }

    beforeAll(async () => {
        await cleanup();
    });

    afterAll(async () => {
        await cleanup();
    });

    it('should insert a record successfully', async () => {
        const data = buildTestData();
        const res = await sendSyncRequest(tableName, 'insert', data);
        expect(res.status).toBe(201);
    });

    it('should fail to insert when required field is missing', async () => {
        const data = buildTestData();
        delete data[primaryKeys[0]];
        const res = await sendSyncRequest(tableName, 'insert', data);
        expect(res.status).toBe(422);
    });

    it('should update the record successfully', async () => {
        const data = buildTestData({ [updateKey]: "UPDATED_TEST" });
        const res = await sendSyncRequest(tableName, 'update', data);
        expect(res.status).toBe(200);
    });

    it('should fail to update a non-existing record', async () => {
        const data = buildTestData({
            ...Object.fromEntries(primaryKeys.map(k => [k, "NON_EXISTENT"])),
            [updateKey]: "UPDATED_TEST_2"
        });
        const res = await sendSyncRequest(tableName, 'update', data);
        expect(res.status).toBe(404);
    });

    it('should fail to insert when extra field is present', async () => {
        const data = buildTestData({ EXTRA_FIELD: "unexpected" });
        const res = await sendSyncRequest(tableName, 'insert', data);
        expect(res.status).toBeGreaterThanOrEqual(422);
    });

    it('should delete the record successfully', async () => {
        const keyData = Object.fromEntries(
            primaryKeys.map(key => [key, "TEST"])
        );
        const res = await sendSyncRequest(tableName, 'delete', keyData);
        expect(res.status).toBe(200);
    });

    it('should fail to delete non-existing record', async () => {
        const keyData = Object.fromEntries(
            primaryKeys.map(key => [key, "NON_EXISTENT"])
        );
        const res = await sendSyncRequest(tableName, 'delete', keyData);
        expect(res.status).toBe(404);
    });

    it('should fail to delete without primary key', async () => {
        const data = buildTestData();
        delete data[primaryKeys[0]];
        const res = await sendSyncRequest(tableName, 'delete', data);
        expect(res.status).toBe(422);
    });

    it('should create a new record via upsert', async () => {
        const data = buildTestData();
        const res = await sendSyncRequest(tableName, 'upsert', data);
        expect(res.status).toBe(201);
    });

    it('should update an existing record via upsert', async () => {
        const data = buildTestData({ [updateKey]: "UPDATED_TEST" });
        const res = await sendSyncRequest(tableName, 'upsert', data);
        expect(res.status).toBe(200);
    });

    it('should delete the record after upsert', async () => {
        const keyData = Object.fromEntries(
            primaryKeys.map(key => [key, "TEST"])
        );
        const res = await sendSyncRequest(tableName, 'delete', keyData);
        expect(res.status).toBe(200);
    });
}
