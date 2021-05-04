"use strict";

const db = require("../db");
const User = require("../models/user");
const Trip = require("../models/trip");
const Activity = require("../models/activity");
const { createToken } = require("../helpers/tokens");

const testUserIds = [];
const testTripIds = [];
const testActivityIds = [];
const tokens = [];

async function commonBeforeAll() {
    await db.query("DELETE FROM activities");
    await db.query("DELETE FROM trips");
    await db.query("DELETE FROM users");

    testUserIds[0] = (
        await User.register({
            username: "u1",
            firstName: "U1F",
            lastName: "U1L",
            email: "user1@user.com",
            password: "password1",
        })
    ).userId;
    testUserIds[1] = (
        await User.register({
            username: "u2",
            firstName: "U2F",
            lastName: "U2L",
            email: "user2@user.com",
            password: "password2",
        })
    ).userId;
    testUserIds[2] = (
        await User.register({
            username: "u3",
            firstName: "U3F",
            lastName: "U3L",
            email: "user3@user.com",
            password: "password3",
        })
    ).userId;

    testTripIds[0] = (
        await Trip.create({
            tripName: "Austin 1 Day",
            startDate: "2020-01-23",
            endDate: "2020-01-23",
            userId: testUserIds[0],
        })
    ).tripId;
    testTripIds[1] = (
        await Trip.create({
            tripName: "Houston 1 Day",
            startDate: "2021-01-01",
            endDate: "2021-01-01",
            userId: testUserIds[0],
        })
    ).tripId;
    testTripIds[2] = (
        await Trip.create({
            tripName: "NY 2 Days",
            startDate: "2020-08-30",
            endDate: "2020-08-31",
            userId: testUserIds[1],
        })
    ).tripId;

    testActivityIds[0] = (
        await Activity.create({
            tripId: testTripIds[0],
            activityName: "Eat Breakfast",
            startTime: "2021-01-23 09:00:00",
            endTime: "2021-01-23 09:30:00",
            location: "hotel",
            latitude: "100.00",
            longitude: "45.00",
            comment: "no bacon",
        })
    ).activityId;
    testActivityIds[1] = (
        await Activity.create({
            tripId: testTripIds[0],
            activityName: "hang around",
            startTime: "2021-01-23 10:00:00",
            endTime: "2021-01-23 11:00:00",
            location: "green belt",
            latitude: "100.01",
            longitude: "45.02",
            comment: "take a walk",
        })
    ).activityId;

    let u1Token = createToken({ userId: testUserIds[0], username: "u1" });
    let u2Token = createToken({ userId: testUserIds[1], username: "u2" });
    tokens.push(u1Token);
    tokens.push(u2Token);
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
    tokens,
    testUserIds,
    testTripIds,
    testActivityIds,
};
