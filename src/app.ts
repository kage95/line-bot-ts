import * as dotenv from "dotenv";
dotenv.config();
import * as line from "@line/bot-sdk";
import express from "express";
import axios from "axios";
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.listen(PORT);

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
};
line.middleware(config);

app.post("/webhook", (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(() => {
      replyStocks();
    })
    .catch(() => {
      return;
    });
});

const handleEvent = (event: {
  replyToken: string;
  type: string;
  message: { type: string; text: string };
}) => {
  if (
    event.type !== "message" ||
    event.message.type !== "text" ||
    event.message.text !== "ストック"
  ) {
    throw new Error();
  }
};

const replyStocks = async () => {
  const { data } = await axios.get<{ url: string }[]>(
    "https://qiita.com/api/v2/users/kage95/stocks?per_page=5",
    { headers: { Authorization: `Bearer ${process.env.QIITA_API}` } }
  );
  const stockUrls = data.map(({ url }) => {
    return url;
  });
  Promise.all(stockUrls.map(reply));
};

const client = new line.Client(config);
const reply = async (url: string) => {
  await client.pushMessage(`${process.env.USER_ID}`, {
    type: "text",
    text: `${url}`,
  });
};
