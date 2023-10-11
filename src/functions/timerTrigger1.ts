import { CosmosClient } from "@azure/cosmos";
import { app, InvocationContext, Timer } from "@azure/functions";

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

async function addItem(item: any) {
    const { resource: createdItem } = await container.items.create(item);
    console.log(`Item with id ${createdItem.id} created!`);
    return createdItem;
}

export async function timerTrigger1(myTimer: Timer, context: InvocationContext): Promise<void> {
    context.log('Start timer trigger function v3');

    const recordId = generateRandomNumber().toString();
    context.log('Item will creat with id: ' + recordId);

    // 3分40秒待機
    await sleep(220000);

    // DBレコード作成
    // const timeStamp = getJSTISOString();
    // const createItem = {
    //     id: recordId,
    //     user: {
    //         id: "1",
    //         name: "user_1"
    //     },
    //     text: "2023-10-11 Timer trigger function run! " + timeStamp
    // };
    // addItem(createItem)
    //     .then(createdItem => {
    //         console.log(`Item created with id: ${createdItem.id}`);
    //     })
    //     .catch(error => {
    //         console.error("Error creating item:", error);
    //     });

    context.log('Item created with id:' + recordId);
    context.log('Finish timer trigger function v3');
}

app.timer('timerTrigger1', {
    schedule: '0 */4 * * * *',
    handler: timerTrigger1
});
