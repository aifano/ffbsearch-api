import { sendSyncRequest } from './utilities/request';
import { generateTests } from './utilities/syncTestFactory';

describe('IFS Sync API Tests', () => {
    const tableName = 'technical_object_reference_tab';

    describe(tableName, () => {
        generateTests(tableName, ["ROWKEY"], ["TECHNICAL_SPEC_NO"], "KEY_REF");
    });
});
