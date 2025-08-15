import request from 'supertest';
import express from 'express';
import { repairAndParseJSON } from '../../src/utilities/jsonRepair';

// Mock the IFS service to avoid database dependencies
jest.mock('../../src/services/ifs', () => ({
    handlePrismaSync: jest.fn().mockResolvedValue({
        status: 200,
        message: 'Success'
    })
}));

// Create a test app with our JSON repair middleware
function createTestApp() {
    const app = express();

    // Copy the JSON repair middleware from src/index.ts
    app.use((req, res, next) => {
        if (req.headers['content-type']?.includes('application/json')) {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    // First try normal JSON parsing
                    req.body = JSON.parse(body);
                    next();
                } catch (error) {
                    console.log('JSON parse failed, attempting repair...', error);
                    
                    // Try to repair and parse the JSON
                    const repairResult = repairAndParseJSON(body);
                    
                    if (repairResult.success) {
                        console.log('JSON repair successful!');
                        req.body = repairResult.data;
                        next();
                    } else {
                        console.error('JSON repair failed:', repairResult.error);
                        res.status(400).json({ 
                            error: "Invalid JSON payload", 
                            details: repairResult.error,
                            originalBody: body 
                        });
                    }
                }
            });
        } else {
            next();
        }
    });

    // Simple test route
    app.post('/ifs-sync/:table', (req, res) => {
        const { table } = req.params;
        const { action, data } = req.body;
        
        // Return the parsed data to verify it was correctly repaired
        res.status(200).json({
            status: 'success',
            table,
            action,
            data,
            message: 'JSON was successfully parsed and processed'
        });
    });

    return app;
}

describe('JSON Repair Integration Tests', () => {
    let app: express.Application;

    beforeEach(() => {
        app = createTestApp();
    });

    it('should handle the customer example with malformed JSON', async () => {
        const malformedPayload = `{
            "action": "upsert",
            "data": {
                "DESCRIPTION": "Gerade Einschraubreduzierung IG/AG 1/4"-1\\"",
                "ROWKEY": "AIFANO_TEST"
            }
        }`;

        const response = await request(app)
            .post('/ifs-sync/part_catalog_tab')
            .set('Content-Type', 'application/json')
            .send(malformedPayload);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.DESCRIPTION).toBe('Gerade Einschraubreduzierung IG/AG 1/4"-1"');
        expect(response.body.data.ROWKEY).toBe('AIFANO_TEST');
    });

    it('should handle valid JSON normally', async () => {
        const validPayload = {
            action: 'upsert',
            data: {
                DESCRIPTION: 'Gerade Einschraubreduzierung IG/AG 1/4"-1"',
                ROWKEY: 'AIFANO_TEST'
            }
        };

        const response = await request(app)
            .post('/ifs-sync/part_catalog_tab')
            .set('Content-Type', 'application/json')
            .send(validPayload);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.DESCRIPTION).toBe('Gerade Einschraubreduzierung IG/AG 1/4"-1"');
    });

    it('should handle multiple fields with unescaped quotes', async () => {
        const malformedPayload = `{
            "action": "upsert",
            "data": {
                "DESCRIPTION": "Size 1/2"-3/4"",
                "NAME": "Test "item"",
                "ROWKEY": "AIFANO_TEST_UNESCAPED"
            }
        }`;

        const response = await request(app)
            .post('/ifs-sync/part_catalog_tab')
            .set('Content-Type', 'application/json')
            .send(malformedPayload);

        expect(response.status).toBe(200);
        expect(response.body.data.DESCRIPTION).toBe('Size 1/2"-3/4"');
        expect(response.body.data.NAME).toBe('Test "item"');
        expect(response.body.data.ROWKEY).toBe('AIFANO_TEST_UNESCAPED');
    });

    it('should return error for completely invalid JSON that cannot be repaired', async () => {
        const invalidPayload = 'this is not json at all';

        const response = await request(app)
            .post('/ifs-sync/part_catalog_tab')
            .set('Content-Type', 'application/json')
            .send(invalidPayload);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid JSON payload');
        expect(response.body.details).toBe('Unable to repair JSON after trying all strategies');
    });

    it('should handle complex nested objects with quotes', async () => {
        const complexMalformedPayload = `{
            "action": "upsert",
            "data": {
                "DESCRIPTION": "Pipe "Heavy Duty" 2\\"",
                "SPECS": {
                    "size": "1/2" to 3/4"",
                    "material": "Steel "Grade A""
                },
                "ROWKEY": "AIFANO_TEST_COMPLEX"
            }
        }`;

        const response = await request(app)
            .post('/ifs-sync/part_catalog_tab')
            .set('Content-Type', 'application/json')
            .send(complexMalformedPayload);

        expect(response.status).toBe(200);
        expect(response.body.data.DESCRIPTION).toBe('Pipe "Heavy Duty" 2"');
        expect(response.body.data.SPECS.size).toBe('1/2" to 3/4"');
        expect(response.body.data.SPECS.material).toBe('Steel "Grade A"');
    });

    it('should handle trailing commas', async () => {
        const payloadWithTrailingComma = `{
            "action": "upsert",
            "data": {
                "DESCRIPTION": "Test item",
                "ROWKEY": "AIFANO_TEST",
            }
        }`;

        const response = await request(app)
            .post('/ifs-sync/part_catalog_tab')
            .set('Content-Type', 'application/json')
            .send(payloadWithTrailingComma);

        expect(response.status).toBe(200);
        expect(response.body.data.DESCRIPTION).toBe('Test item');
        expect(response.body.data.ROWKEY).toBe('AIFANO_TEST');
    });
});
