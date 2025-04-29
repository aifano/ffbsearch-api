import { generateTests } from './utilities/syncTestFactory';

describe('IFS Sync API Tests', () => {
    const tableName = 'part_catalog_tab';

    describe(tableName, () => {
        generateTests(tableName, ["ROWKEY"], ["PART_NO"], "INFO_TEXT");
    });
});
