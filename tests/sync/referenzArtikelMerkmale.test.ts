import { sendSyncRequest } from './utilities/request';

describe('IFS Sync API Tests', () => {
    describe('referenzArtikelMerkmale', () => {
        const testData = {
            TECHNICAL_SPEC_NO: "TEST",
            LU_NAME: "TEST",
            KEY_REF: "TEST"
        };

        it('should insert a record successfully', async () => {
            const { KEY_REF, ...data } = testData;
            const res = await sendSyncRequest('referenz-artikel-merkmale', 'insert', data);
            expect(res.status).toBe(201);
        });

        it('should fail to insert when required field is missing', async () => {
            const { TECHNICAL_SPEC_NO, ...data } = testData;
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
                TECHNICAL_SPEC_NO: 'NON_EXISTENT'
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
                TECHNICAL_SPEC_NO: testData.TECHNICAL_SPEC_NO
            });
            expect(res.status).toBe(200);
        });

        it('should fail to delete non-existing record', async () => {
            const res = await sendSyncRequest('referenz-artikel-merkmale', 'delete', {
                TECHNICAL_SPEC_NO: 'NON_EXISTENT'
            });
            expect(res.status).toBe(404);
        });

        it('should fail to delete without primary key', async () => {
            const { TECHNICAL_SPEC_NO, ...data } = testData;
            const res = await sendSyncRequest('referenz-artikel-merkmale', 'delete', data);
            expect(res.status).toBe(422);
        });
    });
});
