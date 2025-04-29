import { sendSyncRequest } from './utilities/request';

describe('IFS Sync API Tests', () => {
    describe('language_sys_tab', () => {
        const testData = {
            ATTRIBUTE: "TEST",
            LANG_CODE: "TEST",
            PATH: "TEST",

            BULK: "TEST"
        };

        it('should insert a record successfully', async () => {
            const { BULK, ...data } = testData;
            const res = await sendSyncRequest('language_sys_tab', 'insert', data);
            expect(res.status).toBe(201);
        });

        it('should fail to insert when required field is missing', async () => {
            const { PATH, ...data } = testData;
            const res = await sendSyncRequest('language_sys_tab', 'insert', data);
            expect(res.status).toBe(422);
        });

        it('should update the record successfully', async () => {
            const res = await sendSyncRequest('language_sys_tab', 'update', {
                ...testData,
                BULK: "TEST2"
            });
            expect(res.status).toBe(200);
        });

        it('should fail to update a non-existing record', async () => {
            const res = await sendSyncRequest('language_sys_tab', 'update', {
                ...testData,
                PATH: 'NON_EXISTENT'
            });
            expect(res.status).toBe(404);
        });

        it('should fail to insert when extra field is present', async () => {
            const res = await sendSyncRequest('language_sys_tab', 'insert', {
                ...testData,
                EXTRA_FIELD: 'unexpected'
            });
            expect(res.status).toBeGreaterThanOrEqual(422);
        });

        it('should delete the record successfully', async () => {
            const res = await sendSyncRequest('language_sys_tab', 'delete', {
                ATTRIBUTE: testData.ATTRIBUTE,
                LANG_CODE: testData.LANG_CODE,
                PATH: testData.PATH
            });
            expect(res.status).toBe(200);
        });

        it('should fail to delete non-existing record', async () => {
            const res = await cleanup();
            expect(res.status).toBe(404);
        });

        it('should fail to delete without primary key', async () => {
            const { PATH, ...data } = testData;
            const res = await sendSyncRequest('language_sys_tab', 'delete', data);
            expect(res.status).toBe(422);
        });

        it('should create a new record via upsert', async () => {
            const res = await sendSyncRequest('language_sys_tab', 'upsert', testData);
            expect(res.status).toBe(201);
        });

        it('should update an existing record via upsert', async () => {
            const res = await sendSyncRequest('language_sys_tab', 'upsert', {
                ...testData,
                BULK: 'TEST2'
            });
            expect(res.status).toBe(200);
        });

        it('should delete the record after upsert', async () => {
            const res = await cleanup();
            expect(res.status).toBe(200);
        });

        async function cleanup() {
            return await sendSyncRequest('language_sys_tab', 'delete', {
                ATTRIBUTE: testData.ATTRIBUTE,
                LANG_CODE: testData.LANG_CODE,
                PATH: testData.PATH
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
