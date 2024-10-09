import * as dotenv from "dotenv";
dotenv.config();

import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import databaseController from "./database/controller";
import chatController from "./agent/controller";
import { Client } from "./agent/models";

const app = new Koa();
const router = new Router();
const PORT = 3000;

router.get("/client/:id", async (ctx) => {
	try {
		const clientId = Number.parseInt(ctx.params.id);
		const client = await databaseController.getSingleClient(clientId);
		ctx.body = client;
	} catch (error) {
		console.log(error);
		ctx.status = 500;
		ctx.body = { message: "Internal server error." };
	}
});

router.get("/clients", async (ctx) => {
	try {
		const clients = await databaseController.getAllClients();
		ctx.body = clients;
	} catch (error) {
		console.log(error);
		ctx.status = 500;
		ctx.body = { message: "Internal server error." };
	}
});

router.get("/clients-to-do-follow-up", async (ctx) => {
	try {
		const clients = await databaseController.getClientsWithOldMessages();
		ctx.body = clients;
	} catch (error) {
		console.log(error);
		ctx.status = 500;
		ctx.body = { message: "Internal server error." };
	}
});

router.get("/clients/:id/generateMessage", async (ctx) => {
	try {
		// retreive client info
		const clientId = Number.parseInt(ctx.params.id);
		const client = await databaseController.getSingleClient(clientId);
		const clientObj: Client = {
			name: client?.dataValues.name,
			rut: client?.dataValues.rut,
			messages: client?.dataValues.Messages,
			debts: client?.dataValues.Debts,
		};
		// get chat completion
		const message_text = await chatController.getChatCompletion(clientObj);
		// add message to database
		await databaseController.addMessage(
			message_text,
			"agent",
			new Date(),
			clientId
		);
		ctx.body = { text: message_text };
	} catch (error) {
		console.log(error);
		ctx.status = 500;
		ctx.body = { message: "Internal server error." };
	}
});

router.post("/client", async (ctx) => {
	try {
		// retreive request body
		const client = ctx.request.body as {
			name: string;
			rut: string;
			messages: {
				text: string;
				role: "agent" | "client";
				sentAt: Date;
			}[];
			debts: {
				institution: string;
				amount: number;
				dueDate: Date;
			}[];
		};

		// adding client to table and geting its id
		const clientId = await databaseController.addClient(
			client.name,
			client.rut
		);

		// adding messages to table
		for (const msg of client.messages) {
			await databaseController.addMessage(
				msg.text,
				msg.role,
				msg.sentAt,
				clientId
			);
		}

		// adding debts to table
		for (const dbt of client.debts) {
			const dbtId = await databaseController.addDebt(
				dbt.institution,
				dbt.amount,
				dbt.dueDate,
				clientId
			);
			console.log(dbtId);
		}
		// setting response body
		ctx.body = { message: "Client added successfully.", id: clientId };
	} catch (error) {
		console.log(error);
		ctx.status = 500;
		ctx.body = { message: "Internal server error." };
	}
});

router.post("/clients/:id/message", async (ctx) => {
	try {
		const clientId = Number.parseInt(ctx.params.id);
		const message = ctx.request.body as {
			text: string;
			role: "agent" | "client";
			sentAt: Date;
		};
		const msgId = await databaseController.addMessage(
			message.text,
			message.role,
			message.sentAt,
			clientId
		);
		ctx.body = {
			message: "message added successfully",
			clientId: clientId,
			messageId: msgId,
		};
	} catch (error) {
		console.log(error);
		ctx.status = 500;
		ctx.body = { message: "Internal server error." };
	}
});

//router.post("/client/:id/debt");

app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());
app.listen(PORT, () => {
	console.log(`Api serving on http://localhost:${PORT}`);
});
