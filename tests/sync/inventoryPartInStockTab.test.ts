import { generateTests } from './utilities/syncTestFactory';

describe('IFS Sync API Tests', () => {
    const tableName = 'inventory_part_in_stock_tab';

    describe(tableName, () => {
        generateTests(tableName, ["ROWKEY"], ["PART_NO", "CONTRACT"], "CONFIGURATION_ID");
    });
});
