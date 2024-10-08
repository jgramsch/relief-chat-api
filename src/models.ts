interface Message {
	id: number; // primary key serial
	text: string; // text not null
	role: "client" | "agent"; // varchar not null
	sentAt: Date; // datetime not null
	clientId: number; // foreing key from client table
}

interface Debt {
	id: number; // primary key serial
	institution: string; // varchar 512 not null
	amount: number; // int not null
	dueDate: Date; // datetime not null
	clientId: number; // foreing key from client table
}

interface Client {
	id: number; // primary key serial
	name: string; // varchar 1024 not null
	rut: string; // varchar 15 not null unique
	lastMessageAt?: Date; // datetime
	messages?: Message[]; // (not in table)
	debts?: Debt[]; // (not in table)
}
