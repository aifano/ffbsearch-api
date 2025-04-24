export const sendSyncRequest = async (
    table: string,
    action: 'insert' | 'update' | 'upsert' | 'delete',
    data: Record<string, any>
): Promise<Response> => {
    const url = `https://api.ffbsearch.aifano.com/ifs-sync/${table}`;

    return await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmciOnsiaWQiOiJvcmdfMnc4WWU3eEJUYkNwaFVDdWJHeG9PV2x5R2ROIn0sInR5cGUiOiJpZnMuc3VwcGxpZXIifQ._Q-97RIFnWGb9fnEDfRUPAL8NurYuK6SunYZ7OdPXTg'
        },
        body: JSON.stringify({ action, data }),
    });
};
