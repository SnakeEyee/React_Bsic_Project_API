const fs = require("fs");
const path = require("path");
const database = require("better-sqlite3");

function createDatabase() {
  const filePath = path.join(__dirname, "../../app.db");

  if (!fs.existsSync(filePath)) {
    console.log("File dows not exist, creating a new one...");
    const db = new db(filePath);
    console.log("app.db created successfully.");
    createUsersTable(db);
    db.close();
  } else {
    console.log("app.db already exists.");
    const db = new database(filePath);
    createUsersTable(db);
    db.close();
  }
}

function createUsersTable(db) {
  const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS "Users" (
	"ID"	INTEGER NOT NULL UNIQUE,
	"Username"	TEXT NOT NULL,
  "Name"	TEXT NOT NULL,
	"Email"	TEXT NOT NULL,
	"Password"	INTEGER NOT NULL,
	"Token"	INTEGER,
	"created_at"	TEXT NOT NULL,
	"updated_at"	TEXT,
	"deleted_at"	TEXT,
	PRIMARY KEY("ID" AUTOINCREMENT)
);`;
  try {
    db.exec(createUsersTableQuery);
  } catch (error) {
    console.error("Error creating Users table: ", error);
  }
}

module.exports = { createDatabase };
