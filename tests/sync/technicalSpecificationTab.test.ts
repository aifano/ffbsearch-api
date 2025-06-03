import { sendSyncRequest } from './utilities/request';
import { generateTests } from './utilities/syncTestFactory';

describe('IFS Sync API Tests', () => {
    const tableName = 'technical_specification_tab';

    describe(tableName, () => {
        generateTests(tableName, ["ROWKEY"], ["ATTRIBUTE", "TECHNICAL_SPEC_NO"], "ATTRIBUTE");
    });
});
