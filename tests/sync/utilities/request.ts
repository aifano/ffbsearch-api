export const sendSyncRequest = async (
    table: string,
    action: 'insert' | 'update' | 'upsert' | 'delete',
    data: Record<string, any>
): Promise<Response> => {
    const url = `https://api.ffbsearch.aifano.com/ifs-sync/${table}`;

    return await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data }),
    });
};
