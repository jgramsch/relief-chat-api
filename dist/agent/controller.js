"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = require("openai");
const fs_1 = require("fs");
const path_1 = require("path");
const gpt_tokens_1 = require("gpt-tokens");
class ChatController {
    constructor() {
        this.openai = new openai_1.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        this.model = "gpt-4o-mini";
        this.base_prompt = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, "prompt.txt"));
    }
    async getApiCompletion(messages) {
        var _a, _b;
        try {
            const response = await this.openai.chat.completions.create({
                model: this.model, // Specify chat model
                messages: messages,
                max_tokens: 500, // Limit tokens to control response length
                temperature: 0.1,
            });
            return ((_a = response.choices[0].message) === null || _a === void 0 ? void 0 : _a.content)
                ? (_b = response.choices[0].message) === null || _b === void 0 ? void 0 : _b.content
                : "";
        }
        catch (error) {
            throw new Error("Error while using api: \n \n " + error);
        }
    }
    async getChatCompletion(client) {
        // console.log(client.messages);
        const conversation = this.prepareConversation(client.messages ? client.messages : [], client.debts ? client.debts : []);
        const response = await this.getApiCompletion(conversation);
        return response;
    }
    preparePrompt(debts) {
        // parse client debts
        var debt_info;
        if (debts.length == 0) {
            debt_info = "El cliente no tiene deudas registradas";
        }
        else {
            debt_info = `El cliente registra ${debts.length} deudas en DICOM`;
        }
        debt_info = "<Debts>" + debt_info + "</Debts>\n";
        // parse cars and stores from database
        const fileContent = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, "dummy_data.json"), "utf-8");
        const parsedData = JSON.parse(fileContent);
        const stores = parsedData.stores;
        const cars = parsedData.cars;
        // write cars info strings
        var cars_info = "";
        for (const car of cars) {
            cars_info =
                cars_info +
                    `\n - ${car.name}, price: ${car.price}, desription: ${car.description}\n`;
        }
        cars_info = "<Cars>" + cars_info + "</Cars>\n";
        // write stores info string
        var stores_info = "";
        for (const store of stores) {
            stores_info =
                stores_info + `\n - ${store.name}, location: ${store.location}\n`;
        }
        stores_info = "<Stores>" + stores_info + "</Stores>\n";
        const text = this.base_prompt + debt_info + cars_info + stores_info;
        return {
            role: "system",
            content: text,
        };
    }
    prepareConversation(messages, debts) {
        const conversation = [];
        // add prompt
        const prompt_msg = this.preparePrompt(debts);
        conversation.push(prompt_msg);
        // add messages
        for (const message of messages) {
            const role = message.role == "client" ? "user" : "assistant";
            conversation.push({ role: role, content: message.text });
        }
        // count tokens
        const tokens = this.countMessagesTokens(conversation);
        // todo implement message trimming
        console.log(tokens);
        return conversation;
    }
    countMessagesTokens(messages) {
        const usageInfo = new gpt_tokens_1.GPTTokens({
            model: "gpt-4o-mini",
            messages: messages,
        });
        return usageInfo.usedTokens;
    }
}
const chatController = new ChatController();
exports.default = chatController;
