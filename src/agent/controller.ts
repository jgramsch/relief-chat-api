import { OpenAI } from "openai";
import { MessageInterface, Client, Debt, Message, Car, Store } from "./models";
import { readFileSync } from "fs";
import { join, parse } from "path";
import { GPTTokens } from "gpt-tokens";

class ChatController {
	openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
	model = "gpt-4o-mini";
	base_prompt = readFileSync(join(__dirname, "prompt.txt"));

	async getApiCompletion(messages: MessageInterface[]): Promise<string> {
		try {
			const response = await this.openai.chat.completions.create({
				model: this.model, // Specify chat model
				messages: messages,
				max_tokens: 500, // Limit tokens to control response length
				temperature: 0.1,
			});
			return response.choices[0].message?.content
				? response.choices[0].message?.content
				: "";
		} catch (error) {
			throw new Error("Error while using api: \n \n " + error);
		}
	}

	async getChatCompletion(client: Client): Promise<string> {
		// console.log(client.messages);
		const conversation = this.prepareConversation(
			client.messages ? client.messages : [],
			client.debts ? client.debts : []
		);
		const response = await this.getApiCompletion(conversation);
		return response;
	}

	preparePrompt(debts: Debt[]): MessageInterface {
		// parse client debts
		var debt_info: string;
		if (debts.length == 0) {
			debt_info = "El cliente no tiene deudas registradas";
		} else {
			debt_info = `El cliente registra ${debts.length} deudas en DICOM`;
		}
		debt_info = "<Debts>" + debt_info + "</Debts>\n";
		// parse cars and stores from database
		const fileContent = readFileSync(
			join(__dirname, "dummy_data.json"),
			"utf-8"
		);
		const parsedData = JSON.parse(fileContent) as {
			cars: Car[];
			stores: Store[];
		};
		const stores = parsedData.stores;
		const cars = parsedData.cars;

		// write cars info strings
		var cars_info: string = "";
		for (const car of cars) {
			cars_info =
				cars_info +
				`\n - ${car.name}, price: ${car.price}, desription: ${car.description}\n`;
		}
		cars_info = "<Cars>" + cars_info + "</Cars>\n";
		// write stores info string
		var stores_info: string = "";
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

	prepareConversation(messages: Message[], debts: Debt[]): MessageInterface[] {
		const conversation: MessageInterface[] = [];
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

	countMessagesTokens(messages: MessageInterface[]): number {
		const usageInfo = new GPTTokens({
			model: "gpt-4o-mini",
			messages: messages,
		});
		return usageInfo.usedTokens;
	}
}

const chatController = new ChatController();
export default chatController;
