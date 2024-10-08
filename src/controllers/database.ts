import { Sequelize } from "sequelize";
import { readFileSync } from "fs";
import { join } from "path";
import * as dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize({
	dialect: "postgres",
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	logging: false,
});

async function runSchema() {
	try {
		const schemaPath = join(__dirname, "schema.sql");
		const schema = readFileSync(schemaPath, "utf-8");

		await sequelize.query(schema);
		console.log("Tables created successfully");
	} catch (error) {
		console.error("Error creating tables:", error);
	} finally {
		await sequelize.close();
	}
}

runSchema();
