import { sendSyncRequest } from './utilities/request';

describe('IFS Sync API Tests', () => {
    describe('artikelbestand', () => {
        const testData = {
            ROWKEY: "TEST",

            PART_NO: "TEST",
            CONTRACT: "TEST",
            CONFIGURATION_ID: "TEST"
        };

        it('should insert a record successfully', async () => {
            const { CONFIGURATION_ID, ...data } = testData;
            const res = await sendSyncRequest('artikelbestand', 'insert', data);
            expect(res.status).toBe(201);
        });

        it('should fail to insert when required field is missing', async () => {
            const { ROWKEY, ...data } = testData;
            const res = await sendSyncRequest('artikelbestand', 'insert', data);
            expect(res.status).toBe(422);
        });

        it('should update the record successfully', async () => {
            const res = await sendSyncRequest('artikelbestand', 'update', {
                ...testData,
                CONFIGURATION_ID: "TEST2"
            });
            expect(res.status).toBe(200);
        });

        it('should fail to update a non-existing record', async () => {
            const res = await sendSyncRequest('artikelbestand', 'update', {
                ...testData,
                ROWKEY: 'NON_EXISTENT'
            });
            expect(res.status).toBe(404);
        });

        it('should fail to insert when extra field is present', async () => {
            const res = await sendSyncRequest('artikelbestand', 'insert', {
                ...testData,
                EXTRA_FIELD: 'unexpected'
            });
            expect(res.status).toBeGreaterThanOrEqual(422);
        });

        it('should delete the record successfully', async () => {
            const res = await cleanup();
            expect(res.status).toBe(200);
        });

        it('should fail to delete non-existing record', async () => {
            const res = await sendSyncRequest('artikelbestand', 'delete', {
                ROWKEY: 'NON_EXISTENT'
            });
            expect(res.status).toBe(404);
        });

        it('should fail to delete without primary key', async () => {
            const { ROWKEY, ...data } = testData;
            const res = await sendSyncRequest('artikelbestand', 'delete', data);
            expect(res.status).toBe(422);
        });

        it('should create a new record via upsert', async () => {
            const res = await sendSyncRequest('artikelbestand', 'upsert', testData);
            expect(res.status).toBe(201);
        });

        it('should update an existing record via upsert', async () => {
            const res = await sendSyncRequest('artikelbestand', 'upsert', {
                ...testData,
                CONFIGURATION_ID: 'TEST2',
            });
            expect(res.status).toBe(200);
        });

        it('should delete the record after upsert', async () => {
            const res = await cleanup();
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
