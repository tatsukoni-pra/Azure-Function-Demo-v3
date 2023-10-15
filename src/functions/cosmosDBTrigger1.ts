import { CosmosClient, PatchOperation } from "@azure/cosmos";
import { app, InvocationContext } from "@azure/functions";

const client = new CosmosClient(process.env["COSMOSDB_CONNECTION_STRING"]);
const container = client.database("TatsukoniTest").container("tatsukoni-test-1");

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const getJSTISOString = () => {
    const now = new Date();
    // UTC時間に9時間加算してJSTに変換
    now.setHours(now.getUTCHours() + 9);
    return now.toISOString().replace('Z', '+09:00');  // タイムゾーンオフセットを'+09:00'に修正
};

const generateRandomNumber: () => number = () => {
    // 3から9999999までのランダムな数値を返す
    return Math.floor(Math.random() * (9999999 - 3 + 1)) + 3;
}

export async function cosmosDBTrigger1(documents: unknown[], context: InvocationContext): Promise<void> {
    const functionVersion = "v3-1";
    const functionExecId = generateRandomNumber().toString();
    const documentsCount = documents.length;
    if (documentsCount === 0) {
        context.log('Skip cosmosDBTrigger1 function because documents is empty.')
        return;
    }
    context.log(`Function Version: ${functionVersion} Processed documents: ${documentsCount} Function Exec Id: ${functionExecId}`);

    // 実行対象を取得
    const targetId = (documents[0] as any).id;
    const targetKey = (documents[0] as any).user.id;
    context.log(`targetId: ${targetId}, targetKey: ${targetKey}`);

    // 3分40秒待機
    await sleep(220000);

    // DBレコード更新
    const operations: PatchOperation[] = [
        {
            op: "replace", // replace operation を使用
            path: "/text", // 更新するプロパティのパス
            value: functionVersion + "-" + functionExecId + "-" + getJSTISOString()
        }
    ];
    const { resource: updateItem } = await container.item("2", "2").patch(operations);

    // 完了
    context.log(`Finished Function Exec Id: ${functionExecId}`);
}

app.cosmosDB('cosmosDBTrigger1', {
    connectionStringSetting: 'COSMOSDB_CONNECTION_STRING',
    databaseName: 'TatsukoniTest',
    collectionName: 'tatsukoni-test-1',
    createLeaseCollectionIfNotExists: true,
    handler: cosmosDBTrigger1
});
