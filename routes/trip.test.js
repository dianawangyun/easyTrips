"use strict";
const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const Trip = require("../models/trip");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    tokens,
    testUserIds,
    testActivityIds,
    testTripIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /trip/:username */

describe("POST /trip/:username", function () {
    const newTrip = {
        tripName: "new trip",
        startDate: "2021-05-01",
        endDate: "2021-05-03",
    };
    test("ok for same user", async function () {
        const res = await request(app)
            .post("/trip/u2")
            .send(newTrip)
            .set("authorization", `Bearer ${tokens[1]}`);
        expect(res.body).toEqual({ trip: { tripId: expect.any(String) } });
    });

    test("unauth for different user", async function () {
        const res = await request(app)
            .post("/trip/u2")
            .send(newTrip)
            .set("authorization", `Bearer ${tokens[0]}`);
        expect(res.statusCode).toEqual(401);
    });

    test("unauth for visitor", async function () {
        const res = await request(app).post("/trip/u2").send(newTrip);
        expect(res.statusCode).toEqual(401);
    });

    test("bad request with missing data", async function () {
        const res = await request(app)
            .post("/trip/u2")
            .send({
                tripName: "new trip",
                startDate: "2021-05-01",
            })
            .set("authorization", `Bearer ${tokens[1]}`);
        expect(res.statusCode).toEqual(400);
    });
});

/************************************** GET /trip/:username/:tripid */

describe("GET /trip/:username/:tripid", function () {
    test("works for same user", async function () {
        const res = await request(app)
            .get(`/trip/u1/${testTripIds[0]}`)
            .set("authorization", `Bearer ${tokens[0]}`);
        expect(res.body).toEqual({
            trip: {
                userId: testUserIds[0],
                tripName: "Austin 1 Day",
                startDate: "2020-01-23",
                endDate: "2020-01-23",
                activities: [
                    {
                        activityId: testActivityIds[0],
                        activityName: "Eat Breakfast",
                        description: null,
                        startTime: "2021-01-23 09:00:00",
                        endTime: "2021-01-23 09:30:00",
                        location: "hotel",
                        latitude: "100.00",
                        longitude: "45.00",
                        comment: "no bacon",
                    },
                    {
                        activityId: testActivityIds[1],
                        activityName: "hang around",
                        description: null,
                        startTime: "2021-01-23 10:00:00",
                        endTime: "2021-01-23 11:00:00",
                        location: "green belt",
                        latitude: "100.01",
                        longitude: "45.02",
                        comment: "take a walk",
                    },
                ],
            },
        });
    });
    test("works for anon", async function () {
        const res = await request(app).get(`/trip/u2/${testTripIds[2]}`);

        expect(res.body).toEqual({
            trip: {
                userId: testUserIds[1],
                tripName: "NY 2 Days",
                startDate: "2020-08-30",
                endDate: "2020-08-31",
                activities: [],
            },
        });
    });
});

/************************************** PATCH /trip/:username/:tripid */

describe("PATCH /trip/:username/:tripid", function () {
    test("works for same user", async function () {
        const res = await request(app)
            .patch(`/trip/u1/${testTripIds[0]}`)
            .send({
                tripName: "new name",
            })
            .set("authorization", `Bearer ${tokens[0]}`);
        expect(res.body).toEqual({
            trip: {
                tripId: testTripIds[0],
                userId: testUserIds[0],
                tripName: "new name",
                startDate: "2020-01-23",
                endDate: "2020-01-23",
            },
        });
    });

    test("unauth for different user", async function () {
        const res = await request(app)
            .patch(`/trip/u2/${testTripIds[2]}`)
            .send({
                tripName: "new name",
            })
            .set("authorization", `Bearer ${tokens[0]}`);
        expect(res.statusCode).toEqual(401);
    });

    test("unauth for visiter", async function () {
        const res = await request(app)
            .patch(`/trip/u2/${testTripIds[2]}`)
            .send({
                tripName: "new name",
            });
        expect(res.statusCode).toEqual(401);
    });

    test("not found trip", async function () {
        const res = await request(app)
            .patch(`/trip/u1/nope`)
            .send({
                tripName: "new name",
            })
            .set("authorization", `Bearer ${tokens[0]}`);
        expect(res.statusCode).toEqual(404);
    });

    test("bad request on userId change attempt", async function () {
        const res = await request(app)
            .patch(`/trip/u1/${testTripIds[0]}`)
            .send({
                tripName: "new name",
                username: "new name",
            })
            .set("authorization", `Bearer ${tokens[0]}`);
        expect(res.statusCode).toEqual(400);
    });
});

/************************************** DELETE /trip/:username/:tripid */

describe("DELETE /trip/:username/:tripid", function () {
    test("works for same user", async function () {
        const res = await request(app)
            .delete(`/trip/u1/${testTripIds[1]}`)
            .set("authorization", `Bearer ${tokens[0]}`);
        expect(res.body).toEqual({ deleted: testTripIds[1] });
    });

    test("unauth for different user", async function () {
        const res = await request(app)
            .delete(`/trip/u1/${testTripIds[1]}`)
            .set("authorization", `Bearer ${tokens[1]}`);
        expect(res.statusCode).toEqual(401);
    });

    test("unauth for visitor", async function () {
        const res = await request(app).delete(`/trip/u1/${testTripIds[1]}`);
        expect(res.statusCode).toEqual(401);
    });

    test("not found for no such trip", async function () {
        const res = await request(app)
            .delete(`/trip/u1/nope`)
            .set("authorization", `Bearer ${tokens[0]}`);
        expect(res.statusCode).toEqual(404);
    });
});
