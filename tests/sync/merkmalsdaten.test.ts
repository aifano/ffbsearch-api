import { sendSyncRequest } from './utilities/request';

describe('IFS Sync API Tests', () => {
    describe('merkmalsdaten', () => {
        const testData = {
            TECHNICAL_SPEC_NO: "TEST",
            TECHNICAL_CLASS: "TEST",
            ATTRIBUTE: "TEST"
        };

        it('should insert a record successfully', async () => {
            const { ATTRIBUTE, ...data } = testData;
            const res = await sendSyncRequest('merkmalsdaten', 'insert', data);
            expect(res.status).toBe(201);
        });

        it('should fail to insert when required field is missing', async () => {
            const { TECHNICAL_SPEC_NO, ...data } = testData;
            const res = await sendSyncRequest('merkmalsdaten', 'insert', data);
            expect(res.status).toBe(422);
        });

        it('should update the record successfully', async () => {
            const res = await sendSyncRequest('merkmalsdaten', 'update', {
                ...testData,
                ATTRIBUTE: "TEST2"
            });
            expect(res.status).toBe(200);
        });

        it('should fail to update a non-existing record', async () => {
            const res = await sendSyncRequest('merkmalsdaten', 'update', {
                ...testData,
                TECHNICAL_SPEC_NO: 'NON_EXISTENT'
            });
            expect(res.status).toBe(404);
        });

        it('should fail to insert when extra field is present', async () => {
            const res = await sendSyncRequest('merkmalsdaten', 'insert', {
                ...testData,
                EXTRA_FIELD: 'unexpected'
            });
            expect(res.status).toBeGreaterThanOrEqual(422);
        });

        it('should delete the record successfully', async () => {
            const res = await sendSyncRequest('merkmalsdaten', 'delete', {
                TECHNICAL_SPEC_NO: testData.TECHNICAL_SPEC_NO
            });
            expect(res.status).toBe(200);
        });

        it('should fail to delete non-existing record', async () => {
            const res = await sendSyncRequest('merkmalsdaten', 'delete', {
                TECHNICAL_SPEC_NO: 'NON_EXISTENT'
            });
            expect(res.status).toBe(404);
        });

        it('should fail to delete without primary key', async () => {
            const { TECHNICAL_SPEC_NO, ...data } = testData;
            const res = await sendSyncRequest('merkmalsdaten', 'delete', data);
            expect(res.status).toBe(422);
        });
    });
});
