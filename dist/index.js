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
const koa_1 = __importDefault(require("koa"));
const koa_router_1 = __importDefault(require("koa-router"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const controller_1 = __importDefault(require("./database/controller"));
const controller_2 = __importDefault(require("./agent/controller"));
const app = new koa_1.default();
const router = new koa_router_1.default();
const PORT = 3000;
router.get("/client/:id", async (ctx) => {
    try {
        const clientId = Number.parseInt(ctx.params.id);
        const client = await controller_1.default.getSingleClient(clientId);
        ctx.body = client;
    }
    catch (error) {
        console.log(error);
        ctx.status = 500;
        ctx.body = { message: "Internal server error." };
    }
});
router.get("/clients", async (ctx) => {
    try {
        const clients = await controller_1.default.getAllClients();
        ctx.body = clients;
    }
    catch (error) {
        console.log(error);
        ctx.status = 500;
        ctx.body = { message: "Internal server error." };
    }
});
router.get("/clients-to-do-follow-up", async (ctx) => {
    try {
        const clients = await controller_1.default.getClientsWithOldMessages();
        ctx.body = clients;
    }
    catch (error) {
        console.log(error);
        ctx.status = 500;
        ctx.body = { message: "Internal server error." };
    }
});
router.get("/clients/:id/generateMessage", async (ctx) => {
    try {
        // retreive client info
        const clientId = Number.parseInt(ctx.params.id);
        const client = await controller_1.default.getSingleClient(clientId);
        const clientObj = {
            name: client === null || client === void 0 ? void 0 : client.dataValues.name,
            rut: client === null || client === void 0 ? void 0 : client.dataValues.rut,
            messages: client === null || client === void 0 ? void 0 : client.dataValues.Messages,
            debts: client === null || client === void 0 ? void 0 : client.dataValues.Debts,
        };
        // get chat completion
        const message_text = await controller_2.default.getChatCompletion(clientObj);
        // add message to database
        await controller_1.default.addMessage(message_text, "agent", new Date(), clientId);
        ctx.body = { text: message_text };
    }
    catch (error) {
        console.log(error);
        ctx.status = 500;
        ctx.body = { message: "Internal server error." };
    }
});
router.post("/clients", async (ctx) => {
    try {
        // retreive request body
        const client = ctx.request.body;
        // adding client to table and geting its id
        const clientId = await controller_1.default.addClient(client.name, client.rut);
        // adding messages to table
        for (const msg of client.messages) {
            await controller_1.default.addMessage(msg.text, msg.role, msg.sentAt, clientId);
        }
        // adding debts to table
        for (const dbt of client.debts) {
            const dbtId = await controller_1.default.addDebt(dbt.institution, dbt.amount, dbt.dueDate, clientId);
            console.log(dbtId);
        }
        // setting response body
        ctx.body = { message: "Client added successfully.", id: clientId };
    }
    catch (error) {
        console.log(error);
        ctx.status = 500;
        ctx.body = { message: "Internal server error." };
    }
});
router.post("/clients/:id/message", async (ctx) => {
    try {
        const clientId = Number.parseInt(ctx.params.id);
        const message = ctx.request.body;
        const msgId = await controller_1.default.addMessage(message.text, message.role, message.sentAt, clientId);
        ctx.body = {
            message: "message added successfully",
            clientId: clientId,
            messageId: msgId,
        };
    }
    catch (error) {
        console.log(error);
        ctx.status = 500;
        ctx.body = { message: "Internal server error." };
    }
});
//router.post("/client/:id/debt");
app.use((0, koa_bodyparser_1.default)());
app.use(router.routes()).use(router.allowedMethods());
app.listen(PORT, () => {
    console.log(`Api serving on http://localhost:${PORT}`);
});
