"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testTripIds,
    testActivityIds,
} = require("./_testCommon");
const Activity = require("./activity.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create a new activity", function () {
    const newActivity = {
        tripId: "1",
        activityName: "Eat Breakfast",
        startTime: "2021-01-23 09:00:00",
        endTime: "2021-01-23 09:30:00",
        location: "hotel",
        latitude: "100.00",
        longitude: "45.00",
        comment: "no bacon",
    };
    test("works", async function () {
        const activity = await Activity.create(newActivity);
        expect(activity).toEqual({
            activityId: expect.any(String),
        });
        const found = await db.query(
            "SELECT * FROM activities WHERE activity_name='Eat Breakfast'"
        );
        expect(found.rows.length).toEqual(1);
    });
});

/************************************** findALl */

describe("findAll", function () {
    test("works", async function () {
        const activities = await Activity.findAll("1");
        expect(activities.length).toEqual(2);
        expect(activities).toEqual([
            {
                activityId: "101",
                activityName: "hang around",
                description: null,
                startTime: "2021-01-23 10:00:00",
                endTime: "2021-01-23 11:00:00",
                location: "green belt",
                latitude: "100.01",
                longitude: "45.02",
                comment: "take a walk",
            },
            {
                activityId: "102",
                activityName: "brunch",
                description: null,
                startTime: "2021-01-23 11:30:00",
                endTime: "2021-01-23 12:30:00",
                location: "green belt",
                latitude: "100.01",
                longitude: "45.20",
                comment: "chipotle",
            },
        ]);
    });

    test("would return empty array if no such user", async function () {
        const activities = await Activity.findAll("nope");
        expect(activities).toEqual([]);
    });
});

/************************************** get */

describe("get", function () {
    test("works", async function () {
        let activity = await Activity.get("102");
        expect(activity).toEqual({
            activityId: "102",
            activityName: "brunch",
            description: null,
            startTime: "2021-01-23 11:30:00",
            endTime: "2021-01-23 12:30:00",
            location: "green belt",
            latitude: "100.01",
            longitude: "45.20",
            comment: "chipotle",
        });
    });

    test("not found if no such activitiy", async function () {
        try {
            await Activity.get("nope");
            fail();
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************************** update */

describe("update", function () {
    const updateData = {
        description: "description added",
        comment: "comment changed",
    };

    test("works", async function () {
        let activity = await Activity.update("101", updateData);
        expect(activity).toEqual({
            activityId: "101",
            activityName: "hang around",
            description: "description added",
            startTime: "2021-01-23 10:00:00",
            endTime: "2021-01-23 11:00:00",
            location: "green belt",
            latitude: "100.01",
            longitude: "45.02",
            comment: "comment changed",
        });
    });

    test("not found if no such activity", async function () {
        try {
            await Activity.update("-1", updateData);
            fail();
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request if no data", async function () {
        expect.assertions(1);
        try {
            await Activity.update("102", {});
            fail();
        } catch (e) {
            expect(e instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** remove */

describe("remove", function () {
    test("works", async function () {
        await Activity.remove("101");
        const res = await db.query(`SELECT * FROM trips WHERE trip_id='101'`);
        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such trip", async function () {
        try {
            await Activity.remove("-1");
            fail();
        } catch (e) {
            expect(e instanceof NotFoundError);
        }
    });
});
