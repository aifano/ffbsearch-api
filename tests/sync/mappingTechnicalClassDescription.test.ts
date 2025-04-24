import { sendSyncRequest } from './utilities/request';

describe('IFS Sync API Tests', () => {
    describe('mappingTechnicalClassDescription', () => {
        const testData = {
            TECHNICAL_CLASS: "TEST",
            DESCRIPTION: "TEST",
            DESCRIPTION_EN: "TEST"
        };

        it('should insert a record successfully', async () => {
            const { DESCRIPTION_EN, ...data } = testData;
            const res = await sendSyncRequest('mapping-techclass', 'insert', data);
            expect(res.status).toBe(201);
        });

        it('should fail to insert duplicate record', async () => {
            const res = await sendSyncRequest('mapping-techclass', 'insert', testData);
            expect(res.status).toBe(409);
        });

        it('should fail to insert when required field is missing', async () => {
            const { TECHNICAL_CLASS, ...data } = testData;
            const res = await sendSyncRequest('mapping-techclass', 'insert', data);
            expect(res.status).toBe(422);
        });

        it('should update the record successfully', async () => {
            const res = await sendSyncRequest('mapping-techclass', 'update', {
                ...testData,
                DESCRIPTION_EN: "TEST2"
            });
            expect(res.status).toBe(200);
        });

        it('should fail to update a non-existing record', async () => {
            const res = await sendSyncRequest('mapping-techclass', 'update', {
                ...testData,
                TECHNICAL_CLASS: 'NON_EXISTENT'
            });
            expect(res.status).toBe(404);
        });

        it('should fail to insert when extra field is present', async () => {
            const res = await sendSyncRequest('mapping-techclass', 'insert', {
                ...testData,
                EXTRA_FIELD: 'unexpected'
            });
            expect(res.status).toBeGreaterThanOrEqual(422);
        });

        it('should delete the record successfully', async () => {
            const res = await sendSyncRequest('mapping-techclass', 'delete', {
                TECHNICAL_CLASS: testData.TECHNICAL_CLASS
            });
            expect(res.status).toBe(200);
        });

        it('should fail to delete non-existing record', async () => {
            const res = await sendSyncRequest('mapping-techclass', 'delete', {
                TECHNICAL_CLASS: 'NON_EXISTENT'
            });
            expect(res.status).toBe(404);
        });

        it('should fail to delete without primary key', async () => {
            const { TECHNICAL_CLASS, ...data } = testData;
            const res = await sendSyncRequest('mapping-techclass', 'delete', data);
            expect(res.status).toBe(422);
        });

        it('should create a new record via upsert', async () => {
            const res = await sendSyncRequest('mapping-techclass', 'upsert', testData);
            expect(res.status).toBe(201);
        });

        it('should update an existing record via upsert', async () => {
            const res = await sendSyncRequest('mapping-techclass', 'upsert', {
                ...testData,
                DESCRIPTION_EN: 'TEST2',
            });
            expect(res.status).toBe(200);
        });

        it('should delete the record after upsert', async () => {
            const res = await sendSyncRequest('mapping-techclass', 'delete', {
                TECHNICAL_CLASS: testData.TECHNICAL_CLASS,
            });
            expect(res.status).toBe(200);
        });
    });
});
