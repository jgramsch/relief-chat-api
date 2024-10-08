import { Sequelize, DataTypes } from "sequelize";
import * as dotenv from "dotenv";

dotenv.config();

class DatabaseController {
	sequelize = new Sequelize({
		dialect: "postgres",
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT),
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		logging: false,
	});

	Client = this.sequelize.define(
		"Client",
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			name: {
				type: DataTypes.STRING(1024),
				allowNull: false,
			},
			rut: {
				type: DataTypes.STRING(15),
				allowNull: false,
				unique: true,
			},
			lastMessageAt: {
				type: DataTypes.DATE,
				allowNull: true,
			},
		},
		{
			tableName: "clients",
			timestamps: false,
		}
	);

	Message = this.sequelize.define(
		"Message",
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			text: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			role: {
				type: DataTypes.STRING(10),
				allowNull: false,
				validate: {
					isIn: [["client", "agent"]], // Ensure the role is either 'client' or 'agent'
				},
			},
			sentAt: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			clientId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "clients", // Assumes 'clients' table exists
					key: "id",
				},
			},
		},
		{
			tableName: "messages",
			timestamps: false,
		}
	);

	Debt = this.sequelize.define(
		"Debt",
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			institution: {
				type: DataTypes.STRING(512),
				allowNull: false,
			},
			amount: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			dueDate: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			clientId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "clients", // Assumes 'clients' table exists
					key: "id",
				},
			},
		},
		{
			tableName: "debts",
			timestamps: false,
		}
	);
	constructor() {
		this.Client.hasMany(this.Message, { foreignKey: "clientId" });
		this.Client.hasMany(this.Debt, { foreignKey: "clientId" });
		this.Message.belongsTo(this.Client, { foreignKey: "clientId" });
		this.Debt.belongsTo(this.Client, { foreignKey: "clientId" });
	}

	async addClient(name: string, rut: string) {
		try {
			// Synchronize the model with the database (if table doesn't exist, create it)
			await this.sequelize.sync();

			// Create a new client
			const newClient = await this.Client.create({ name, rut });

			// console.log("Client added successfully:", newClient);
			return newClient.dataValues.id;
		} catch (error) {
			console.error("Error adding client:", error);
			throw error;
		}
		// finally {
		// 	await this.sequelize.close();
		// }
	}

	async addMessage(
		text: string,
		role: "client" | "agent",
		sentAt: Date,
		clientId: number
	) {
		try {
			// Synchronize the model with the database (if table doesn't exist, create it)
			await this.sequelize.sync();

			// Create a new message
			const newMessage = await this.Message.create({
				text,
				role,
				sentAt,
				clientId,
			});

			// console.log("Message added successfully:", newMessage);
			return newMessage.dataValues.id;
		} catch (error) {
			console.error("Error adding message:", error);
			throw error;
		}
		// finally {
		// 	await this.sequelize.close();
		// }
	}

	async addDebt(
		institution: string,
		amount: number,
		dueDate: Date,
		clientId: number
	) {
		try {
			// Synchronize the model with the database (if table doesn't exist, create it)
			await this.sequelize.sync();

			// Create a new debt
			const newDebt = await this.Debt.create({
				institution,
				amount,
				dueDate,
				clientId,
			});

			// console.log("Debt added successfully:", newDebt);
			return newDebt.dataValues.id;
		} catch (error) {
			console.error("Error adding debt:", error);
			throw error;
		}
		// finally {
		// 	await this.sequelize.close();
		// }
	}
	async closeConection() {
		await this.sequelize.close();
	}
}

const databaseController = new DatabaseController();

export default databaseController;
