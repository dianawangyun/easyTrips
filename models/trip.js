"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { v4: uuid } = require("uuid");

class Trip {
    /** Create a trip (from data), update db, return message.
     *
     * data should be { user_id, trip_name, start_date, end_date }
     *
     * Returns { trip_id }
     * */

    static async create({ userId, tripName, startDate, endDate }) {
        const tripId = uuid();
        const result = await db.query(
            `INSERT INTO trips (trip_id, user_id, trip_name, start_date, end_date)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING
            trip_id as "tripId"`,
            [tripId, userId, tripName, startDate, endDate]
        );
        let trip = result.rows[0];

        return trip;
    }

    /** Given a userId, return all trips of a user.
     *
     * Returns [trip_id, trip_name, start_date, end_date]...
     */

    static async findAll(userId) {
        const result = await db.query(
            `SELECT
    t.trip_id AS "tripId",
    t.trip_name AS "tripName",
    to_char(t.start_date, 'YYYY-MM-DD') AS "startDate",
    to_char(t.end_date, 'YYYY-MM-DD') AS "endDate"
    FROM trips t
    JOIN users u
    ON t.user_id=u.user_id
    WHERE u.user_id=$1
    ORDER BY t.start_date`,
            [userId]
        );

        return result.rows;
    }

    /** Given a trip id, return data about a trip.
     *
     * Returns {user_id, trip_name, start_date, end_date}
     */

    static async get(tripId) {
        const result = await db.query(
            `
    SELECT 
    user_id AS "userId",
    trip_name AS "tripName",
    to_char(t.start_date, 'YYYY-MM-DD') AS "startDate",
    to_char(t.end_date, 'YYYY-MM-DD') AS "endDate"
    FROM trips t
    WHERE trip_id=$1`,
            [tripId]
        );

        const trip = result.rows[0];

        if (!trip) throw new NotFoundError(`No trip: ${tripId}`);

        const activityRes = await db.query(
            `
      SELECT
      activity_id AS "activityId",
      activity_name AS "activityName",
      description,
      to_char(start_time, 'YYYY-MM-DD HH24:MI:SS') AS "startTime",
      to_char(end_time, 'YYYY-MM-DD HH24:MI:SS') AS "endTime",
      location,
      latitude,
      longitude,
      comment
      FROM activities
      WHERE trip_id=$1`,
            [tripId]
        );

        trip.activities = activityRes.rows;

        return trip;
    }

    /** Update trip data with `data`
     *
     * This is a "partial update" --- it's find if data dosn't contain all the fields.
     *
     * Data can include: { tripName, startDate, endDate }
     *
     * Returns { tripId, tripName, startDate, endDate }
     *
     * Throws NotFoundError if not found.
     */

    static async update(tripId, data) {
        const { setCols, values } = sqlForPartialUpdate(data, {
            tripName: "trip_name",
            startDate: "start_date",
            endDate: "end_date",
        });
        const idVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE trips
      SET ${setCols} 
      WHERE trip_id =${idVarIdx}
      RETURNING
      trip_id as "tripId",
      user_id as "userId",
      trip_name as "tripName",
      to_char(start_date, 'YYYY-MM-DD') as "startDate",
      to_char(end_date, 'YYYY-MM-DD') as "endDate"`;
        const result = await db.query(querySql, [...values, tripId]);

        const trip = result.rows[0];

        if (!trip) throw new NotFoundError(`No trip: ${tripId}`);

        return trip;
    }

    /** Delete given trip from database; returns undefined.
     *
     * Throws NotFoundError if trip not found.
     **/

    static async remove(tripId) {
        const result = await db.query(
            `
    DELETE FROM trips
    WHERE trip_id=$1
    RETURNING trip_id`,
            [tripId]
        );
        const trip = result.rows[0];
        if (!trip) throw new NotFoundError(`No trip: ${tripId}`);
    }
}

module.exports = Trip;
