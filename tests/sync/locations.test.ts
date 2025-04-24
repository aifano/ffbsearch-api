import { sendSyncRequest } from './utilities/request';

describe('IFS Sync API Tests', () => {
    describe('locations', () => {
        const testData = {
            LOCATION_ID: "TEST",
            LOCATION_NAME: "TEST",
            COMPANY_ID: "TEST"
        };

        it('should insert a record successfully', async () => {
            const { COMPANY_ID, ...data } = testData;
            const res = await sendSyncRequest('locations', 'insert', data);
            expect(res.status).toBe(201);
        });

        it('should fail to insert duplicate record', async () => {
            const res = await sendSyncRequest('locations', 'insert', testData);
            expect(res.status).toBe(409);
        });

        it('should fail to insert when required field is missing', async () => {
            const { LOCATION_ID, ...data } = testData;
            const res = await sendSyncRequest('locations', 'insert', data);
            expect(res.status).toBe(422);
        });

        it('should update the record successfully', async () => {
            const res = await sendSyncRequest('locations', 'update', {
                ...testData,
                COMPANY_ID: "TEST2"
            });
            expect(res.status).toBe(200);
        });

        it('should fail to update a non-existing record', async () => {
            const res = await sendSyncRequest('locations', 'update', {
                ...testData,
                LOCATION_ID: 'NON_EXISTENT'
            });
            expect(res.status).toBe(404);
        });

        it('should fail to insert when extra field is present', async () => {
            const res = await sendSyncRequest('locations', 'insert', {
                ...testData,
                EXTRA_FIELD: 'unexpected'
            });
            expect(res.status).toBeGreaterThanOrEqual(422);
        });

        it('should delete the record successfully', async () => {
            const res = await sendSyncRequest('locations', 'delete', {
                LOCATION_ID: testData.LOCATION_ID
            });
            expect(res.status).toBe(200);
        });

        it('should fail to delete non-existing record', async () => {
            const res = await sendSyncRequest('locations', 'delete', {
                LOCATION_ID: 'NON_EXISTENT'
            });
            expect(res.status).toBe(404);
        });

        it('should fail to delete without primary key', async () => {
            const { LOCATION_ID, ...data } = testData;
            const res = await sendSyncRequest('locations', 'delete', data);
            expect(res.status).toBe(422);
        });

        it.only('should create a new record via upsert', async () => {
            const res = await sendSyncRequest('locations', 'upsert', testData);
            expect(res.status).toBe(201);
        });

        it('should update an existing record via upsert', async () => {
            const res = await sendSyncRequest('locations', 'upsert', {
                ...testData,
                COMPANY_ID: 'TEST2',
            });
            expect(res.status).toBe(200);
        });

        it('should delete the record after upsert', async () => {
            const res = await sendSyncRequest('locations', 'delete', {
                LOCATION_ID: testData.LOCATION_ID,
            });
            expect(res.status).toBe(200);
        });
    });
});
