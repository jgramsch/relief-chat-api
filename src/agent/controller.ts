import { OpenAI } from "openai";
import { Client } from "./models";
import { MessageInterface } from "./models";

class ChatController {
	openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

	async getApiCompletion(messages: MessageInterface[]) {
		const response = await this.openai.chat.completions.create({
			model: "o1-mini", // Specify chat model
			messages: messages,
			max_tokens: 100, // Limit tokens to control response length
		});

		return response.choices[0].message?.content;
	}
	async getChatCompletion() {
		// to-do prepare messages and prompt before sending
		const messages: MessageInterface[] = [];
		const response = await this.getApiCompletion(messages);
	}
}
