const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

// enabling foreign keys
db.get("PRAGMA foreign_keys = ON")

// creating required tables
db.run("CREATE TABLE Employee (id INTEGER PRIMARY KEY, name TEXT NOT NULL, position TEXT NOT NULL, wage INTEGER NOT NULL, is_current_employee INTEGER DEFAULT 1)");
db.run("CREATE TABLE Timesheet (id INTEGER PRIMARY KEY NOT NULL, hours INTEGER NOT NULL, rate INTEGER NOT NULL, date INTEGER NOT NULL, employee_id INTEGER NOT NULL, FOREIGN KEY (employee_id) REFERENCES Employee (id))");
db.run("CREATE TABLE Menu (id INTEGER PRIMARY KEY NOT NULL, title TEXT NOT NULL)");
db.run("CREATE TABLE MenuItem (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL, description TEXT NOT NULL, inventory INTEGER NOT NULL, price INTEGER NOT NULL, menu_id INTEGER NOT NULL, FOREIGN KEY (menu_id) REFERENCES Menu (id))");

