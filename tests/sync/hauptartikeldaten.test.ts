import { sendSyncRequest } from './utilities/request';

describe('IFS Sync API Tests', () => {
    describe('hauptartikeldaten', () => {
        const testData = {
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
            const { PART_NO, ...data } = testData;
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
                PART_NO: 'NON_EXISTENT'
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
                PART_NO: testData.PART_NO
            });
            expect(res.status).toBe(200);
        });

        it('should fail to delete non-existing record', async () => {
            const res = await sendSyncRequest('hauptartikeldaten', 'delete', {
                PART_NO: 'NON_EXISTENT'
            });
            expect(res.status).toBe(404);
        });

        it('should fail to delete without primary key', async () => {
            const { PART_NO, ...data } = testData;
            const res = await sendSyncRequest('hauptartikeldaten', 'delete', data);
            expect(res.status).toBe(422);
        });
    });
});
