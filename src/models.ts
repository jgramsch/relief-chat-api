export interface Message {
	text: string; // text not null
	role: "client" | "agent"; // varchar not null
	sentAt: Date; // datetime not null
}

export interface Debt {
	institution: string; // varchar 512 not null
	amount: number; // int not null
	dueDate: Date; // datetime not null
}

export interface Client {
	name: string; // varchar 1024 not null
	rut: string; // varchar 15 not null unique
	lastMessageAt?: Date;
	messages?: Message[]; // (not in table)
	debts?: Debt[]; // (not in table)
}
