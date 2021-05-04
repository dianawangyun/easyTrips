const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testUserIds = [];
const testTripIds = [];
const testActivityIds = [];

async function commonBeforeAll() {
    await db.query("DELETE FROM trips");
    await db.query("DELETE FROM users");

    const resultsUsers = await db.query(
        `INSERT INTO users(user_id, username, password, first_name, last_name, email)
    VALUES
    ('u1id', 'u1', $1, 'U1F', 'U1L', 'u1@email.com'),
    ('u2id', 'u2', $2, 'U2F', 'U2L', 'u2@email.com')
    RETURNING user_id`,
        [
            await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
            await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
        ]
    );
    testUserIds.splice(0, 0, ...resultsUsers.rows.map((r) => r.user_id));

    const resultsTrips = await db.query(`
    INSERT INTO trips (trip_id, user_id, trip_name, start_date, end_date)
    VALUES
    ('1', 'u1id', 'Austin 1 Day', '2020-01-23', '2020-01-23'),
    ('2', 'u1id', 'Dallas 2 Days', '2020-02-20', '2020-02-21'),
    ('3', 'u2id', 'NY 2 Days', '2020-08-30', '2020-08-31')
    RETURNING trip_id`);
    testTripIds.splice(0, 0, ...resultsTrips.rows.map((r) => r.trip_id));

    const resultsActivities = await db.query(`
    INSERT INTO activities (activity_id, trip_id, activity_name, start_time, end_time, location, latitude, longitude, comment)
    VALUES
    ('101', '1', 'hang around', '2021-01-23 10:00:00', '2021-01-23 11:00:00', 'green belt', '100.01','45.02', 'take a walk'),
    ('102', '1', 'brunch', '2021-01-23 11:30:00', '2021-01-23 12:30:00', 'green belt', '100.01','45.20', 'chipotle')
    RETURNING activity_id`);

    testActivityIds.splice(
        0,
        0,
        ...resultsActivities.rows.map((r) => r.activity_id)
    );
}

async function commonBeforeEach() {
    await db.query("BEGIN");
}

async function commonAfterEach() {
    await db.query("ROLLBACK");
}

async function commonAfterAll() {
    await db.end();
}

module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testTripIds,
    testActivityIds,
};
