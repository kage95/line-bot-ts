import * as dotenv from "dotenv";
dotenv.config();
import { Client, middleware, ClientConfig, MiddlewareConfig, WebhookEvent, Config } from "@line/bot-sdk";
import express from "express";
import axios from "axios";
const PORT = process.env.PORT || 3000;

const app = express();

app.listen(PORT);

const config: Config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

app.get("/webhook", (_req, res) => {
  res.send("Hello World");
});

app.post("/webhook", middleware(config as MiddlewareConfig), (req, _res) => {
  console.log(req.body);
  Promise.all(req.body.events.map(handleEvent))
    .then(() => {
      getStocks();
    })
    .catch((e) => {
      console.log(e);
      return;
    });
});

const handleEvent = (event: WebhookEvent) => {
  if (event.type !== "message" || event.message.type !== "text" || event.message.text !== "ストック") {
    return Promise.reject("エラー");
  }
  return Promise.resolve();
};

const getStocks = async () => {
  const userName = process.env.USER_NAME;
  const { data } = await axios.get<{ url: string }[]>(`https://qiita.com/api/v2/users/${userName}/stocks?per_page=5`, {
    headers: { Authorization: `Bearer ${process.env.QIITA_API}` },
  });
  const stockUrls = data.map(({ url }) => {
    return url;
  });
  Promise.all(stockUrls.map(reply));
};

const client = new Client(config as ClientConfig);
const reply = async (url: string) => {
  await client.pushMessage(`${process.env.USER_ID}`, {
    type: "text",
    text: `${url}`,
  });
};
