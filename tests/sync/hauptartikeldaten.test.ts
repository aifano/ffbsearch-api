import { sendSyncRequest } from './utilities/request';

describe('IFS Sync API Tests', () => {
    describe('hauptartikeldaten', () => {
        const testData = {
            ROWKEY: "TEST",

            PART_NO: "TEST",
            DESCRIPTION: "TEST",
            INFO_TEXT: "TEST"
        };

        it('should insert a record successfully', async () => {
            const { INFO_TEXT, ...data } = testData;
            const res = await sendSyncRequest('hauptartikeldaten', 'insert', data);
            expect(res.status).toBe(201);
        });

        it('should fail to insert when required field is missing', async () => {
            const { ROWKEY, ...data } = testData;
            const res = await sendSyncRequest('hauptartikeldaten', 'insert', data);
            expect(res.status).toBe(422);
        });

        it('should update the record successfully', async () => {
            const res = await sendSyncRequest('hauptartikeldaten', 'update', {
                ...testData,
                INFO_TEXT: "TEST2"
            });
            expect(res.status).toBe(200);
        });

        it('should fail to update a non-existing record', async () => {
            const res = await sendSyncRequest('hauptartikeldaten', 'update', {
                ...testData,
                ROWKEY: 'NON_EXISTENT'
            });
            expect(res.status).toBe(404);
        });

        it('should fail to insert when extra field is present', async () => {
            const res = await sendSyncRequest('hauptartikeldaten', 'insert', {
                ...testData,
                EXTRA_FIELD: 'unexpected'
            });
            expect(res.status).toBeGreaterThanOrEqual(422);
        });

        it('should delete the record successfully', async () => {
            const res = await sendSyncRequest('hauptartikeldaten', 'delete', {
                ROWKEY: testData.ROWKEY
            });
            expect(res.status).toBe(200);
        });

        it('should fail to delete non-existing record', async () => {
            const res = await sendSyncRequest('hauptartikeldaten', 'delete', {
                ROWKEY: 'NON_EXISTENT'
            });
            expect(res.status).toBe(404);
        });

        it('should fail to delete without primary key', async () => {
            const { ROWKEY, ...data } = testData;
            const res = await sendSyncRequest('hauptartikeldaten', 'delete', data);
            expect(res.status).toBe(422);
        });

        it('should create a new record via upsert', async () => {
            const res = await sendSyncRequest('hauptartikeldaten', 'upsert', testData);
            expect(res.status).toBe(201);
        });

        it('should update an existing record via upsert', async () => {
            const res = await sendSyncRequest('hauptartikeldaten', 'upsert', {
                ...testData,
                INFO_TEXT: 'TEST2',
            });
            expect(res.status).toBe(200);
        });

        it('should delete the record after upsert', async () => {
            const res = await sendSyncRequest('hauptartikeldaten', 'delete', {
                ROWKEY: testData.ROWKEY,
            });
            expect(res.status).toBe(200);
        });

        async function cleanup() {
            return await sendSyncRequest('artikelbestand', 'delete', {
                ROWKEY: testData.ROWKEY
            });
        };

        beforeAll(async () => {
            await cleanup();
        });

        afterAll(async () => {
            await cleanup();
        });
    });
});
