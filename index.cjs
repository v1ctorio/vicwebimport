const Telegram =  require('telegram')
const { StringSession } = require( "telegram/sessions/index.js");
const { config } = require('dotenv');
const { MongoClient } = require('mongodb');
const readline = require('readline');
config();

const { TELEGRAM_TOKEN, MONGO_URI, TG_CHAT_ID, API_ID,API_HASH, SESSION_STRING} = process.env;
const { Api } = require("telegram/tl");
const fs = require('fs');

let mongo = new MongoClient(MONGO_URI)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const sessionString = new StringSession(SESSION_STRING);

async function main() {
  await mongo.connect();
  const db = mongo.db('vicweb');
  const postsC = db.collection('posts');
  
  const tg = new Telegram.TelegramClient(
    sessionString,
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

 
  const posts = await tg.invoke(
    new Api.messages.GetHistory({
      peer: 'vicequisd',
      limit: 1,
    })
  );
  const formattedPosts = posts.messages.map((post) => {
    return {
      _id: "tg"+post.id,
      message: post.message,
      date: post.date,
    };
  });

  console.log(posts.messages[0].media);
  fs.writeFileSync("posts.json",JSON.stringify(posts.messages, null, 2));

  console.log(posts.messages[0].media.getBytes())
  fs.writeFileSync("media.png",posts.messages[0].media.getBytes());
  const attachment = await tg.invoke(
    new Api.upload.GetCdnFile({
      fileToken: posts.messages[0].media.getBytes(),
      offset: BigInt("-4156887774564"),
      limit: 100,

    })
  );

  // for (const post of posts.messages) {
  //   const hasAttachment = post.media !== null;
  //   await postsC.updateOne(
  //     { _id: post._id },
  //     { $set: post },
  //     { upsert: true }
  //   );
  // }
  console.log(attachment)
  


}
main();
