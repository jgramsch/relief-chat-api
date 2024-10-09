"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class DatabaseController {
    constructor() {
        this.sequelize = new sequelize_1.Sequelize({
            dialect: "postgres",
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            logging: false,
        });
        this.Client = this.sequelize.define("Client", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: sequelize_1.DataTypes.STRING(1024),
                allowNull: false,
            },
            rut: {
                type: sequelize_1.DataTypes.STRING(15),
                allowNull: false,
                unique: true,
            },
            lastMessageAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
        }, {
            tableName: "clients",
            timestamps: false,
        });
        this.Message = this.sequelize.define("Message", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            text: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
            },
            role: {
                type: sequelize_1.DataTypes.STRING(10),
                allowNull: false,
                validate: {
                    isIn: [["client", "agent"]], // Ensure the role is either 'client' or 'agent'
                },
            },
            sentAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
            clientId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "clients", // Assumes 'clients' table exists
                    key: "id",
                },
            },
        }, {
            tableName: "messages",
            timestamps: false,
        });
        this.Debt = this.sequelize.define("Debt", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            institution: {
                type: sequelize_1.DataTypes.STRING(512),
                allowNull: false,
            },
            amount: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
            },
            dueDate: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
            clientId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "clients", // Assumes 'clients' table exists
                    key: "id",
                },
            },
        }, {
            tableName: "debts",
            timestamps: false,
        });
        this.Client.hasMany(this.Message, { foreignKey: "clientId" });
        this.Client.hasMany(this.Debt, { foreignKey: "clientId" });
        this.Message.belongsTo(this.Client, { foreignKey: "clientId" });
        this.Debt.belongsTo(this.Client, { foreignKey: "clientId" });
    }
    async addClient(name, rut) {
        try {
            // Synchronize the model with the database (if table doesn't exist, create it)
            await this.sequelize.sync();
            // Create a new client
            const newClient = await this.Client.create({ name, rut });
            // console.log("Client added successfully:", newClient);
            return newClient.dataValues.id;
        }
        catch (error) {
            console.error("Error adding client:", error);
            throw error;
        }
    }
    async addMessage(text, role, sentAt, clientId) {
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
            await this.updateLastMessageAt(clientId, sentAt);
            // console.log("Message added successfully:", newMessage);
            return newMessage.dataValues.id;
        }
        catch (error) {
            console.error("Error adding message:", error);
            throw error;
        }
    }
    async addDebt(institution, amount, dueDate, clientId) {
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
        }
        catch (error) {
            console.error("Error adding debt:", error);
            throw error;
        }
    }
    async getSingleClient(clientId) {
        try {
            // Query the Client with associated Messages and Debts
            const client = await this.Client.findOne({
                where: { id: clientId },
                include: [{ model: this.Message }, { model: this.Debt }],
            });
            if (!client) {
                console.log(`Client with id ${clientId} not found.`);
                return null;
            }
            // console.log("Client with messages and debts:", client);
            return client;
        }
        catch (error) {
            console.error("Error fetching client:", error);
            throw error;
        }
    }
    async getAllClients() {
        try {
            // Query all clients without including messages or debts
            const clients = await this.Client.findAll({
                attributes: ["id", "name", "rut", "lastMessageAt"], // Specify the attributes to select
            });
            return clients;
        }
        catch (error) {
            console.error("Error fetching clients:", error);
            throw error;
        }
    }
    async updateLastMessageAt(clientId, lastMessageAt) {
        try {
            // Update the client's lastMessageAt field
            const result = await this.Client.update({ lastMessageAt }, // Set the new value for lastMessageAt
            { where: { id: clientId } } // Specify the client by id
            );
            if (result[0] === 0) {
                console.log(`No client found with id ${clientId}.`);
            }
            else {
                console.log(`Client with id ${clientId} updated successfully.`);
            }
            return result;
        }
        catch (error) {
            console.error("Error updating lastMessageAt:", error);
            throw error;
        }
    }
    async getClientsWithOldMessages() {
        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            // Find clients whose lastMessageAt is at least 7 days old
            const clients = await this.Client.findAll({
                where: {
                    lastMessageAt: {
                        [sequelize_1.Op.lte]: sevenDaysAgo, // Op.lte means 'less than or equal to'
                    },
                },
                attributes: ["id", "name", "rut", "lastMessageAt"], // Optional: select specific columns
            });
            return clients;
        }
        catch (error) {
            console.error("Error fetching clients with old messages:", error);
            throw error;
        }
    }
    async closeConection() {
        await this.sequelize.close();
    }
}
const databaseController = new DatabaseController();
exports.default = databaseController;
