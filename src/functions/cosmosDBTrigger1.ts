import { app, InvocationContext } from "@azure/functions";

export async function cosmosDBTrigger1(documents: unknown[], context: InvocationContext): Promise<void> {
    context.log(`Cosmos DB function processed ${documents.length} documents`);
    if (documents.length > 0) {
        for (const document of documents) {
            context.log((document as any).id);
            context.log((document as any).text);
        }
    }
}

app.cosmosDB('cosmosDBTrigger1', {
    connectionStringSetting: 'COSMOSDB_CONNECTION_STRING',
    databaseName: 'TatsukoniTest',
    collectionName: 'tatsukoni-test-1',
    createLeaseCollectionIfNotExists: true,
    handler: cosmosDBTrigger1
});
