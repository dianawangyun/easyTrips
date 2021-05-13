"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { v4: uuid } = require("uuid");

class Activity {
    /** Create an activity (from data), update db, return new trip data.
     *
     * data should be { activity_name, description, start_time, end_time, location, latitude, longitude, comment }
     *
     * Returns { activity_id }
     * */

    static async create({
        tripId,
        activityName,
        description,
        startTime,
        endTime,
        location,
        latitude,
        longitude,
        comment,
    }) {
        const activityId = uuid();
        const result = await db.query(
            `INSERT INTO activities (activity_id, trip_id, activity_name, description, start_time, end_time, location, latitude, longitude, comment)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING
          activity_id as "activityId"`,
            [
                activityId,
                tripId,
                activityName,
                description,
                startTime,
                endTime,
                location,
                latitude,
                longitude,
                comment,
            ]
        );
        let activity = result.rows[0];

        return activity;
    }

    /** Given a trip Id, return all activities of a trip sort in start_time ascend.
     *
     * Returns [activity_id, activity_name, description, start_time, end_time, location, latitude, longitude, comment]...
     */

    static async findAll(tripId) {
        const result = await db.query(
            `SELECT
            a.activity_id AS "activityId",
            a.activity_name AS "activityName",
            a.description,
            to_char(a.start_time,  'YYYY-MM-DD HH24:MI:SS') AS "startTime",
            to_char(a.end_time, 'YYYY-MM-DD HH24:MI:SS') AS "endTime",
            a.location,
            a.latitude,
            a.longitude,
            a.comment
            FROM activities a
            JOIN trips t
            ON t.trip_id=a.trip_id
            WHERE t.trip_id=$1
            ORDER BY a.start_time`,
            [tripId]
        );

        return result.rows;
    }

    /** Given an activity id, return data about an activity.
     *
     * Returns {activity_id, activity_name, description, start_time, end_time, location, latitude, longitude, comment}
     *
     * Throws NotFoundError if not found.
     */

    static async get(activityId) {
        const result = await db.query(
            `
    SELECT activity_id AS "activityId",
    activity_name AS "activityName",
    description,
    to_char(start_time,  'YYYY-MM-DD HH24:MI:SS') AS "startTime",
    to_char(end_time, 'YYYY-MM-DD HH24:MI:SS') AS "endTime",
    location,
    latitude,
    longitude,
    comment
    FROM activities
    where activity_id=$1`,
            [activityId]
        );
        const activity = result.rows[0];

        if (!activity) throw new NotFoundError(`No activity: ${activityId}`);

        return activity;
    }

    /** Update activity data with `data`
     *
     * This is a "partial update" --- it's find if data dosn't contain all the fields.
     *
     * Data can include: { activityName, description, startTime, endTime, location, latitude, longitude, comment }
     *
     * Returns { activityId, activityName, description, startTime, endTime, location, latitude, longitude, comment }
     *
     * Throws NotFoundError if not found.
     */

    static async update(activityId, data) {
        const { setCols, values } = sqlForPartialUpdate(data, {
            activityName: "activity_name",
            activityId: "activity_id",
            startTime: "start_time",
            endTime: "end_time",
        });
        const idVarIdx = "$" + (values.length + 1);
        const querySql = `UPDATE activities
        SET ${setCols}
        WHERE activity_id = ${idVarIdx}
        RETURNING
        activity_id AS "activityId",
        activity_name AS "activityName",
        description,
        to_char(start_time,  'YYYY-MM-DD HH24:MI:SS') AS "startTime",
        to_char(end_time, 'YYYY-MM-DD HH24:MI:SS') AS "endTime",
        location,
        latitude,
        longitude,
        comment`;
        const result = await db.query(querySql, [...values, activityId]);

        const activity = result.rows[0];

        if (!activity) throw new NotFoundError(`No activity: ${activityId}`);

        return activity;
    }

    /** Delete given activity from database; returns undefined.
     *
     * Throws NotFoundError if activity not found.
     **/

    static async remove(activityId) {
        const result = await db.query(
            `
    DELETE FROM activities
    WHERE activity_id=$1
    RETURNING activity_id`,
            [activityId]
        );
        const activity = result.rows[0];
        if (!activity) throw new NotFoundError(`No activity: ${activityId}`);
    }
}

module.exports = Activity;
