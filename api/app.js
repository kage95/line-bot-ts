"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const bot_sdk_1 = require("@line/bot-sdk");
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const PORT = process.env.PORT || 3000;
const app = (0, express_1.default)();
app.listen(PORT);
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
};
app.get("/webhook", (_req, res) => {
    res.send("Hello World");
});
app.post("/webhook", (0, bot_sdk_1.middleware)(config), (req, _res) => {
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
const handleEvent = (event) => {
    if (event.type !== "message" || event.message.type !== "text" || event.message.text !== "ストック") {
        return Promise.reject("エラー");
    }
    return Promise.resolve();
};
const getStocks = async () => {
    const userName = process.env.USER_NAME;
    const { data } = await axios_1.default.get(`https://qiita.com/api/v2/users/${userName}/stocks?per_page=5`, {
        headers: { Authorization: `Bearer ${process.env.QIITA_API}` },
    });
    const stockUrls = data.map(({ url }) => {
        return url;
    });
    Promise.all(stockUrls.map(reply));
};
const client = new bot_sdk_1.Client(config);
const reply = async (url) => {
    await client.pushMessage(`${process.env.USER_ID}`, {
        type: "text",
        text: `${url}`,
    });
};
