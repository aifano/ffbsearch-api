import { repairAndParseJSON, fixQuotesInDescription } from '../../src/utilities/jsonRepair';

describe('JSON Repair Utilities', () => {
    describe('repairAndParseJSON', () => {
        it('should parse valid JSON without modification', () => {
            const validJson = '{"name": "test", "value": 123}';
            const result = repairAndParseJSON(validJson);
            
            expect(result.success).toBe(true);
            expect(result.data).toEqual({ name: 'test', value: 123 });
        });

        it('should handle the customer example with unescaped quotes in DESCRIPTION', () => {
            const customerJson = `{
                "action": "upsert",
                "data": {
                    "DESCRIPTION": "Gerade Einschraubreduzierung IG/AG 1/4"-1\\"",
                    "ROWKEY": "TEST"
                }
            }`;
            
            const result = repairAndParseJSON(customerJson);
            
            expect(result.success).toBe(true);
            expect(result.data).toEqual({
                action: 'upsert',
                data: {
                    DESCRIPTION: 'Gerade Einschraubreduzierung IG/AG 1/4"-1"',
                    ROWKEY: 'TEST'
                }
            });
        });

        it('should fix simple unescaped quotes in string values', () => {
            const malformedJson = '{"name": "Test "quoted" value"}';
            const result = repairAndParseJSON(malformedJson);
            
            expect(result.success).toBe(true);
            expect(result.data).toEqual({ name: 'Test "quoted" value' });
        });

        it('should fix multiple fields with unescaped quotes', () => {
            const malformedJson = '{"DESCRIPTION": "Size 1/2"-3/4"", "NAME": "Test "item""}';
            const result = repairAndParseJSON(malformedJson);
            
            expect(result.success).toBe(true);
            expect(result.data).toEqual({
                DESCRIPTION: 'Size 1/2"-3/4"',
                NAME: 'Test "item"'
            });
        });

        it('should handle already properly escaped JSON', () => {
            const properJson = '{"DESCRIPTION": "Size 1/2\\"-3/4\\"", "NAME": "Valid"}';
            const result = repairAndParseJSON(properJson);
            
            expect(result.success).toBe(true);
            expect(result.data).toEqual({
                DESCRIPTION: 'Size 1/2"-3/4"',
                NAME: 'Valid'
            });
        });

        it('should fix trailing commas', () => {
            const jsonWithTrailingComma = '{"name": "test", "value": 123,}';
            const result = repairAndParseJSON(jsonWithTrailingComma);
            
            expect(result.success).toBe(true);
            expect(result.data).toEqual({ name: 'test', value: 123 });
        });

        it('should fix missing quotes around property names', () => {
            const jsonWithUnquotedProps = '{name: "test", value: 123}';
            const result = repairAndParseJSON(jsonWithUnquotedProps);
            
            expect(result.success).toBe(true);
            expect(result.data).toEqual({ name: 'test', value: 123 });
        });

        it('should return error for completely invalid JSON', () => {
            const invalidJson = 'this is not json at all';
            const result = repairAndParseJSON(invalidJson);
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Unable to repair JSON after trying all strategies');
        });

        it('should handle complex nested objects with quotes', () => {
            const complexJson = `{
                "product": {
                    "name": "Pipe "Heavy Duty" 2\\"",
                    "specs": {
                        "size": "1/2" to 3/4"",
                        "material": "Steel "Grade A""
                    }
                }
            }`;
            
            const result = repairAndParseJSON(complexJson);
            
            expect(result.success).toBe(true);
            expect(result.data.product.name).toBe('Pipe "Heavy Duty" 2"');
            expect(result.data.product.specs.size).toBe('1/2" to 3/4"');
            expect(result.data.product.specs.material).toBe('Steel "Grade A"');
        });
    });

    describe('fixQuotesInDescription', () => {
        it('should fix quotes specifically in DESCRIPTION field', () => {
            const jsonWithDescriptionQuotes = '"DESCRIPTION": "Gerade Einschraubreduzierung IG/AG 1/4"-1\\""';
            const result = fixQuotesInDescription(jsonWithDescriptionQuotes);
            
            expect(result).toBe('"DESCRIPTION": "Gerade Einschraubreduzierung IG/AG 1/4\\"-1\\""');
        });

        it('should not modify DESCRIPTION field if already properly escaped', () => {
            const properDescription = '"DESCRIPTION": "Gerade Einschraubreduzierung IG/AG 1/4\\"-1\\""';
            const result = fixQuotesInDescription(properDescription);
            
            expect(result).toBe(properDescription);
        });

        it('should not affect other fields', () => {
            const jsonWithOtherFields = '"NAME": "Test "quoted" name", "DESCRIPTION": "Size 1/4"-1\\""';
            const result = fixQuotesInDescription(jsonWithOtherFields);
            
            // Should only fix DESCRIPTION, not NAME
            expect(result).toContain('"NAME": "Test "quoted" name"'); // unchanged
            expect(result).toContain('"DESCRIPTION": "Size 1/4\\"-1\\""'); // fixed
        });
    });
});
