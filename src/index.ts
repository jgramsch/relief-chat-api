import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import databaseController from "./controllers/database";

const app = new Koa();
const router = new Router();
const PORT = 3000;

router.post("/client", async (ctx) => {
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
	const clientId = await databaseController.addClient(client.name, client.rut);
	for (const msg of client.messages) {
		await databaseController.addMessage(
			msg.text,
			msg.role,
			msg.sentAt,
			clientId
		);
	}
	for (const dbt of client.debts) {
		await databaseController.addDebt(
			dbt.institution,
			dbt.amount,
			dbt.dueDate,
			clientId
		);
	}
	ctx.body = { message: "Client added successfully.", id: clientId };
});
router.post("/client/:id/message", async (ctx) => {
	const clientId = Number.parseInt(ctx.params.id);
	const message = ctx.request.body as {
		text: string;
		role: "agent" | "client";
		sentAt: Date;
	};
	await databaseController.addMessage(
		message.text,
		message.role,
		message.sentAt,
		clientId
	);
});
router.post("/client/:id/debt");

app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());
app.listen(PORT, () => {
	console.log(`Api serving on http://localhost:${PORT}`);
});
