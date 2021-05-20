"use strict";

const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

const db = new Client({
    connectionString: getDatabaseUri(),
});

// const db = new Client({
//     connectionString: getDatabaseUri(),
//     ssl: {
//         rejectUnauthorized: false,
//     },
// });

try {
    db.connect();
} catch (e) {
    console.log("db connect failed", e);
}

module.exports = db;
