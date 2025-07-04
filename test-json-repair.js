const { repairAndParseJSON } = require('./dist/utilities/jsonRepair');

// Test the exact case from the customer
const testJson = `{
    "action": "upsert",
    "data": {
        "DESCRIPTION": "Gerade Einschraubreduzierung IG/AG 1/4"-1\"",
        "ROWKEY": "TEST"
    }
}`;

console.log('Original JSON:');
console.log(testJson);
console.log('\n' + '='.repeat(50) + '\n');

// Test normal JSON parsing (should fail)
try {
    const normalParse = JSON.parse(testJson);
    console.log('Normal JSON.parse succeeded (unexpected):', normalParse);
} catch (error) {
    console.log('Normal JSON.parse failed as expected:', error.message);
}

console.log('\n' + '='.repeat(50) + '\n');

// Test our repair function
const result = repairAndParseJSON(testJson);

if (result.success) {
    console.log('JSON repair succeeded!');
    console.log('Parsed data:', JSON.stringify(result.data, null, 2));
} else {
    console.log('JSON repair failed:', result.error);
}

// Test a few more cases
console.log('\n' + '='.repeat(50) + '\n');
console.log('Testing additional cases...\n');

const testCases = [
    // Case 1: Simple unescaped quotes
    '{"name": "Test "quoted" value"}',
    
    // Case 2: Multiple fields with quotes
    '{"DESCRIPTION": "Size 1/2"-3/4"", "NAME": "Test "item""}',
    
    // Case 3: Already valid JSON (should pass through)
    '{"DESCRIPTION": "Size 1/2\\"-3/4\\"", "NAME": "Valid"}',
];

testCases.forEach((testCase, index) => {
    console.log(`Test case ${index + 1}:`);
    console.log('Input:', testCase);
    
    const repairResult = repairAndParseJSON(testCase);
    if (repairResult.success) {
        console.log('✅ Success:', JSON.stringify(repairResult.data));
    } else {
        console.log('❌ Failed:', repairResult.error);
    }
    console.log('');
});
