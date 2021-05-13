"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");
const { v4: uuid } = require("uuid");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

class User {
    /* authenticate user with username, password.
    
    Returns {username, first_name, last_name, email}
    
    Throws Unauthorized Error if user not found or wrong password.
    */

    static async authenticate(username, password) {
        const result = await db.query(
            `SELECT user_id AS "userId", username, password, first_name AS "firstName", last_name AS "lastName", email
            FROM users
            WHERE username = $1`,
            [username]
        );

        const user = result.rows[0];

        if (user) {
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid === true) {
                delete user.password;
                return user;
            }
        }

        throw new UnauthorizedError("Invalid username/password");
    }

    /* Register user with data.
    
    Returns {userId, username, firstName, lastName, email}
    
    Throw BadRequestError on duplicates.
    */

    static async register({ username, password, firstName, lastName, email }) {
        const duplicateCheck = await db.query(
            `SELECT username
            FROM users
            WHERE username=$1`,
            [username]
        );
        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate username: ${username}`);
        }

        const userId = uuid();
        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

        const result = await db.query(
            `INSERT INTO users 
        (user_id, username, password, first_name, last_name, email)
        VALUES($1, $2, $3, $4, $5, $6)
        RETURNING user_id AS "userId", username, first_name AS "firstName", last_name AS "lastName", email`,
            [userId, username, hashedPassword, firstName, lastName, email]
        );

        const user = result.rows[0];

        return user;
    }

    /*  Find all users.

        Returns [{userId, username, firstName, lastName, email} ...]
    */

    static async findAll() {
        const result = await db.query(
            `SELECT user_id AS "userId", username, first_name AS "firstName", last_name AS "lastName", email FROM users ORDER BY username`
        );

        return result.rows;
    }

    /* Given a username, return data about user.
    
    Returns {userId, username, fistName, lastName, email}
    */

    static async get(username) {
        const result = await db.query(
            `SELECT user_id AS "userId", username, first_name AS "firstName", last_name AS "lastName", email
            FROM users
            WHERE username=$1`,
            [username]
        );
        const user = result.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);

        const tripsRes = await db.query(
            `SELECT trip_id as "tripId",
            trip_name as "tripName",
            to_char(start_date, 'YYYY-MM-DD') as "startDate",
            to_char(end_date, 'YYYY-MM-DD') as "endDate"
            FROM trips
            WHERE user_id=$1
            ORDER BY start_date DESC`,
            [user.userId]
        );

        user.trips = tripsRes.rows;

        return user;
    }

    /* Update user data.
    
    Can handle partial update if only changed ones provided.

    Data can include: {firstName, lastName, password, email}

    Throws NotFoundError if not found.
    */

    static async update(username, data) {
        if (data.password) {
            data.password = await bcrypt.hash(
                data.password,
                BCRYPT_WORK_FACTOR
            );
        }

        const { setCols, values } = sqlForPartialUpdate(data, {
            firstName: "first_name",
            lastName: "last_name",
        });
        const usernameVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE users
        SET ${setCols}
        WHERE username = ${usernameVarIdx}
        RETURNING user_id as "userId",
        username,
        first_name AS "firstName",
        last_name AS "lastName",
        email`;

        const result = await db.query(querySql, [...values, username]);
        const user = result.rows[0];
        if (!user) throw new NotFoundError(`No user: ${username}`);

        delete user.password;
        return user;
    }

    /* Delete a user in database and return deleted message. */

    static async remove(username) {
        let result = await db.query(
            `
        DELETE FROM users
        WHERE username=$1
        RETURNING username
        `,
            [username]
        );

        let user = result.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);

        return { msg: `deleted user: ${username}` };
    }

    /* Add trip: update db, returns added message. */
}

module.exports = User;
