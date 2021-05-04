"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testTripIds,
} = require("./_testCommon");
const Trip = require("./trip.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create a new trip", function () {
    const newTrip = {
        tripName: "Houston 1 Day",
        startDate: "2021-01-01",
        endDate: "2021-01-01",
        userId: "u1id",
    };
    test("works", async function () {
        const trip = await Trip.create(newTrip);
        expect(trip).toEqual({
            tripId: expect.any(String),
        });
        const found = await db.query(
            "SELECT * FROM trips WHERE trip_name='Houston 1 Day'"
        );
        expect(found.rows.length).toEqual(1);
    });
});

/************************************** findALl */

describe("findAll", function () {
    test("works", async function () {
        const trips = await Trip.findAll("u1id");
        expect(trips.length).toEqual(2);
        expect(trips).toEqual([
            {
                tripId: expect.any(String),
                tripName: "Austin 1 Day",
                startDate: "2020-01-23",
                endDate: "2020-01-23",
            },
            {
                tripId: expect.any(String),
                tripName: "Dallas 2 Days",
                startDate: "2020-02-20",
                endDate: "2020-02-21",
            },
        ]);
    });

    test("would return empty array if no such user", async function () {
        const trips = await Trip.findAll("nope");
        expect(trips).toEqual([]);
    });
});

/************************************** get */

describe("get", function () {
    test("works", async function () {
        let trip = await Trip.get(testTripIds[0]);
        expect(trip).toEqual({
            userId: "u1id",
            tripName: "Austin 1 Day",
            startDate: "2020-01-23",
            endDate: "2020-01-23",
            activities: [
                {
                    activityId: expect.any(String),
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
                    activityId: expect.any(String),
                    activityName: "brunch",
                    description: null,
                    startTime: "2021-01-23 11:30:00",
                    endTime: "2021-01-23 12:30:00",
                    location: "green belt",
                    latitude: "100.01",
                    longitude: "45.20",
                    comment: "chipotle",
                },
            ],
        });
    });

    test("not found if no such trip", async function () {
        try {
            await Trip.get(-1);
            fail();
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************************** update */

describe("update", function () {
    const updateData = {
        trip_name: "Austin 1 night",
        startDate: "2021-01-23",
        endDate: "2021-01-23",
    };

    test("works", async function () {
        let trip = await Trip.update(testTripIds[0], updateData);
        expect(trip).toEqual({
            tripId: expect.any(String),
            userId: "u1id",
            tripName: "Austin 1 night",
            startDate: "2021-01-23",
            endDate: "2021-01-23",
        });
    });

    test("not found if no such trip", async function () {
        try {
            await Trip.update(-1, updateData);
            fail();
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request if no data", async function () {
        expect.assertions(1);
        try {
            await Trip.update(testTripIds[0], {});
            fail();
        } catch (e) {
            expect(e instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** remove */

describe("remove", function () {
    test("works", async function () {
        await Trip.remove(testTripIds[1]);
        const res = await db.query(
            `SELECT * FROM trips WHERE trip_id='${testTripIds[1]}'`
        );
        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such trip", async function () {
        try {
            await Trip.remove(-1);
            fail();
        } catch (e) {
            expect(e instanceof NotFoundError);
        }
    });
});
