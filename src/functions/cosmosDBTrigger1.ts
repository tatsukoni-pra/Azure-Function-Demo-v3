import { CosmosClient, PatchOperation } from "@azure/cosmos";
import { app, InvocationContext } from "@azure/functions";

let globalContext: InvocationContext | null = null;
const client = new CosmosClient(process.env["COSMOSDB_CONNECTION_STRING"]);
const container = client.database("TatsukoniTest").container("tatsukoni-test-1");

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const generateRandomNumber: () => number = () => {
    // 3から9999999までのランダムな数値を返す
    return Math.floor(Math.random() * (9999999 - 3 + 1)) + 3;
}

process.on('SIGTERM', async () => {
    if (globalContext) {
        globalContext.log('処理が途中終了されました。');
        // ここにクリーンアップ処理を追加します。
        // 例: データベースのクローズ、ファイルの保存など
    }

    // 必要なクリーンアップ処理が完了したら、プロセスを終了します。
    process.exit(0);
});

process.on('SIGINT', async () => {
    if (globalContext) {
        globalContext.log('処理が中断されました。');
        // ここにクリーンアップ処理を追加します。
        // 例: データベースのクローズ、ファイルの保存など
    }

    // 必要なクリーンアップ処理が完了したら、プロセスを終了します。
    process.exit(0);
});

process.on('exit', async () => {
    if (globalContext) {
        globalContext.log('処理がexitされました。');
        // ここにクリーンアップ処理を追加します。
        // 例: データベースのクローズ、ファイルの保存など
    }

    // 必要なクリーンアップ処理が完了したら、プロセスを終了します。
    process.exit(0);
});

process.on('uncaughtException', async () => {
    if (globalContext) {
        globalContext.log('処理が異常終了されました。');
        // ここにクリーンアップ処理を追加します。
        // 例: データベースのクローズ、ファイルの保存など
    }

    // 必要なクリーンアップ処理が完了したら、プロセスを終了します。
    process.exit(0);
});

export async function cosmosDBTrigger1(documents: unknown[], context: InvocationContext): Promise<void> {
    context.log('リトライ回数: ' + context.retryContext.retryCount);
    context.log('最大リトライ回数: ' + context.retryContext.maxRetryCount);
    context.log('リトライ原因' + context.retryContext.exception);

    globalContext = context;
    try {
        const functionVersion = "v3-21";
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

        // 3分30秒待機
        await sleep(30000);
        context.log('30秒経過...');
        await sleep(60000);
        context.log('1分30秒経過...');
        await sleep(60000);
        context.log('2分30秒経過...');
        await sleep(60000);
        context.log('3分30秒経過');

        // 完了
        context.log(`Finished Function Exec Id: ${functionExecId}`);
        context.log('Finished!!!');
    } catch (error: any) {
        context.log('エラーが発生しました。');
        context.log(error);
        // throw error;
    }
}

app.cosmosDB('cosmosDBTrigger1', {
    connectionStringSetting: 'COSMOSDB_LEASE_CONNECTION_STRING',
    databaseName: 'TatsukoniTest',
    collectionName: 'tatsukoni-test-1',
    createLeaseCollectionIfNotExists: true,
    handler: cosmosDBTrigger1
});
