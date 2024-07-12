const Telegram =  require('telegram')
const { StringSession } = require( "telegram/sessions/index.js");
const { config } = require('dotenv');
const { MongoClient } = require('mongodb');
const readline = require('readline');
config();

const { TELEGRAM_TOKEN, MONGO_URI, TG_CHAT_ID, API_ID,API_HASH, } = process.env;
const { Api } = require("telegram/tl");

let mongo = new MongoClient(MONGO_URI)
const stringSession = new StringSession("");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


async function main() {
  await mongo.connect();
  const db = mongo.db('test');
  const postsC = db.collection('posts');
  
  const tg = new Telegram.TelegramClient(
    stringSession,
    parseInt(API_ID),
    API_HASH,
    {
      connectionRetries: 2,
    }
  );
  await tg.start({
    phoneNumber: async () =>
      new Promise((resolve) =>
        rl.question("Number: ", resolve)
      ),
    password: async () =>
      new Promise((resolve) =>
        rl.question("Password: ", resolve)
      ),
    phoneCode: async () =>
      new Promise((resolve) =>
        rl.question("Code: ", resolve)
      ),
    onError: (err) => console.log(err),
  });

  console.log("Succesfully logged in on telegram.");
  console.log(tg.session.save()); 

 
  const posts = await tg.invoke(
    new Api.channels.GetFullChannel({
      channel: TG_CHAT_ID,
    })
  );
  console.log(posts);
  


}
main();
