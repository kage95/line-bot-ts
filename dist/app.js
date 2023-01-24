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
const line = __importStar(require("@line/bot-sdk"));
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
};
app.use(express_1.default.json());
line.middleware(config);
app.use(express_1.default.urlencoded({
    extended: true,
}));
app.listen(3000);
app.post("/", (req, res) => {
    Promise.all(req.body.events.map(handleEvent))
        .then(() => {
        replyStocks();
    })
        .catch(() => {
        return;
    });
});
const client = new line.Client(config);
const reply = async (url) => {
    await client.pushMessage(`${process.env.USER_ID}`, {
        type: "text",
        text: `${url}`,
    });
};
const handleEvent = (event) => {
    if (event.type !== "message" ||
        event.message.type !== "text" ||
        event.message.text !== "stocks") {
        throw new Error();
    }
};
const replyStocks = async () => {
    const { data } = await axios_1.default.get("https://qiita.com/api/v2/users/kage95/stocks?per_page=3", { headers: { Authorization: `Bearer ${process.env.QIITA_API}` } });
    const stockUrls = data.map(({ url }) => {
        return url;
    });
    Promise.all(stockUrls.map(reply));
};
