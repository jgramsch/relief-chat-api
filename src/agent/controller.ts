import { OpenAI } from "openai";
import { MessageInterface, Client, Debt, Message } from "./models";
import { readFileSync } from "fs";
import { join } from "path";
import { GPTTokens } from "gpt-tokens";

class ChatController {
	openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
	model = "o1-mini";
	base_prompt = readFileSync(join(__dirname, "prompt.txt"));
	async getApiCompletion(messages: MessageInterface[]) {
		const response = await this.openai.chat.completions.create({
			model: this.model, // Specify chat model
			messages: messages,
			max_tokens: 100, // Limit tokens to control response length
		});

		return response.choices[0].message?.content;
	}
	async getChatCompletion(client: Client) {
		// to-do prepare messages and prompt before sending
		const messages: MessageInterface[] = [];
		const response = await this.getApiCompletion(messages);
	}

	preparePrompt(debts: Debt[]): MessageInterface {
		return {
			role: "system",
			content: "",
		};
	}
	prepareConversation(messages: Message[], debts: Debt[]) {}

	countMessagesTokens(messages: MessageInterface[]): number {
		const usageInfo = new GPTTokens({
			model: "o1-mini",
			messages: messages,
		});
		return usageInfo.usedTokens;
	}
}

export const chatController = new ChatController();
