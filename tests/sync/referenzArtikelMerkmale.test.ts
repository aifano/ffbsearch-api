import { sendSyncRequest } from './utilities/request';

describe('IFS Sync API Tests', () => {
    describe('referenzArtikelMerkmale', () => {
        const testData = {
            ROWKEY: "TEST",

            TECHNICAL_SPEC_NO: "TEST",
            LU_NAME: "TEST",
            KEY_REF: "TEST",
        };

        beforeAll(async () => {
            await sendSyncRequest('referenz-artikel-merkmale', 'delete', {
                ROWKEY: testData.ROWKEY
            });
        });

        it('should insert a record successfully', async () => {
            const { KEY_REF, ...data } = testData;
            const res = await sendSyncRequest('referenz-artikel-merkmale', 'insert', data);
            expect(res.status).toBe(201);
        });

        it('should fail to insert when required field is missing', async () => {
            const { ROWKEY, ...data } = testData;
            const res = await sendSyncRequest('referenz-artikel-merkmale', 'insert', data);
            expect(res.status).toBe(422);
        });

        it('should update the record successfully', async () => {
            const res = await sendSyncRequest('referenz-artikel-merkmale', 'update', {
                ...testData,
                KEY_REF: "TEST2"
            });
            expect(res.status).toBe(200);
        });

        it('should fail to update a non-existing record', async () => {
            const res = await sendSyncRequest('referenz-artikel-merkmale', 'update', {
                ...testData,
                ROWKEY: 'NON_EXISTENT'
            });
            expect(res.status).toBe(404);
        });

        it('should fail to insert when extra field is present', async () => {
            const res = await sendSyncRequest('referenz-artikel-merkmale', 'insert', {
                ...testData,
                EXTRA_FIELD: 'unexpected'
            });
            expect(res.status).toBeGreaterThanOrEqual(422);
        });

        it('should delete the record successfully', async () => {
            const res = await sendSyncRequest('referenz-artikel-merkmale', 'delete', {
                ROWKEY: testData.ROWKEY
            });
            expect(res.status).toBe(200);
        });

        it('should fail to delete non-existing record', async () => {
            const res = await sendSyncRequest('referenz-artikel-merkmale', 'delete', {
                ROWKEY: 'NON_EXISTENT'
            });
            expect(res.status).toBe(404);
        });

        it('should fail to delete without primary key', async () => {
            const { ROWKEY, ...data } = testData;
            const res = await sendSyncRequest('referenz-artikel-merkmale', 'delete', data);
            expect(res.status).toBe(422);
        });

        it('should create a new record via upsert', async () => {
            const res = await sendSyncRequest('referenz-artikel-merkmale', 'upsert', testData);
            expect(res.status).toBe(201);
        });

        it('should update an existing record via upsert', async () => {
            const res = await sendSyncRequest('referenz-artikel-merkmale', 'upsert', {
                ...testData,
                KEY_REF: 'TEST2',
            });
            expect(res.status).toBe(200);
        });

        it('should delete the record after upsert', async () => {
            const res = await sendSyncRequest('referenz-artikel-merkmale', 'delete', {
                ROWKEY: testData.ROWKEY
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
