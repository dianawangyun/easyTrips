"use strict";
const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const Activity = require("../models/activity");

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

/************************************** POST /activity/:username/:tripid */

describe("POST /activity/:username/:tripid", function () {
    const newActivity = {
        activityName: "coding",
        startTime: "2021-01-23 15:00:00",
        endTime: "2021-01-23 17:00:00",
        location: "home",
        latitude: 100.01,
        longitude: 45.02,
        comment: "springboard",
    };

    test("ok for same user", async function () {
        const res = await request(app)
            .post(`/activity/u1/${testTripIds[0]}`)
            .send(newActivity)
            .set("authorization", `Bearer ${tokens[0]}`);
        expect(res.body).toEqual({
            activity: { activityId: expect.any(String) },
        });
    });

    test("nuauth for different user", async function () {
        const res = await request(app)
            .post(`/activity/u1/${testTripIds[0]}`)
            .send(newActivity)
            .set("authorization", `Bearer ${tokens[1]}`);
        expect(res.statusCode).toEqual(401);
    });

    test("nuauth for visitor", async function () {
        const res = await request(app)
            .post(`/activity/u1/${testTripIds[0]}`)
            .send(newActivity);
        expect(res.statusCode).toEqual(401);
    });

    test("bad request with wrong data", async function () {
        const res = await request(app)
            .post(`/activity/u1/${testTripIds[0]}`)
            .send({ name: "wrong info" })
            .set("authorization", `Bearer ${tokens[0]}`);
        expect(res.statusCode).toEqual(400);
    });
});

/************************************** GET /activity/:username/:activityid */

describe("GET /activity/:username/:activityid", function () {
    test("works for same user", async function () {
        const res = await request(app)
            .get(`/activity/u1/${testActivityIds[0]}`)
            .set("authorization", `Bearer ${tokens[0]}`);
        expect(res.body).toEqual({
            activity: {
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
        });
    });

    test("unauth for different user", async function () {
        const res = await request(app)
            .get(`/activity/u1/${testActivityIds[0]}`)
            .set("authorization", `Bearer ${tokens[1]}`);
        expect(res.statusCode).toEqual(401);
    });

    test("unauth for anon", async function () {
        const res = await request(app).get(
            `/activity/u1/${testActivityIds[0]}`
        );
        expect(res.statusCode).toEqual(401);
    });
});

/************************************** PATCH /activity/:username/:activityid */

describe("PATCH /activity/:username/:activityid", function () {
    test("works for same user", async function () {
        const res = await request(app)
            .patch(`/activity/u1/${testActivityIds[0]}`)
            .send({
                description: "description",
            })
            .set("authorization", `Bearer ${tokens[0]}`);
        expect(res.body).toEqual({
            activity: {
                activityId: testActivityIds[0],
                activityName: "Eat Breakfast",
                description: "description",
                startTime: "2021-01-23 09:00:00",
                endTime: "2021-01-23 09:30:00",
                location: "hotel",
                latitude: "100.00",
                longitude: "45.00",
                comment: "no bacon",
            },
        });
    });
    test("unauth for different user", async function () {
        const res = await request(app)
            .patch(`/activity/u1/${testActivityIds[0]}`)
            .send({
                description: "description",
            })
            .set("authorization", `Bearer ${tokens[1]}`);
        expect(res.statusCode).toEqual(401);
    });

    test("unauth for anon", async function () {
        const res = await request(app)
            .patch(`/activity/u1/${testActivityIds[0]}`)
            .send({
                description: "description",
            });
        expect(res.statusCode).toEqual(401);
    });

    test("not found activity", async function () {
        const res = await request(app)
            .patch(`/activity/u1/nope`)
            .send({
                description: "description",
            })
            .set("authorization", `Bearer ${tokens[0]}`);
        expect(res.statusCode).toEqual(404);
    });

    test("bad request on wrong info change attempt", async function () {
        const res = await request(app)
            .patch(`/activity/u1/${testActivityIds[0]}`)
            .send({
                illegal: "nice try",
            })
            .set("authorization", `Bearer ${tokens[0]}`);
        expect(res.statusCode).toEqual(400);
    });
});

/************************************** DELETE /activity/:username/:activityid */

describe("DELETE /activity/:username/:activityid", function () {
    test("works for same user", async function () {
        const res = await request(app)
            .delete(`/activity/u1/${testActivityIds[1]}`)
            .set("authorization", `Bearer ${tokens[0]}`);
        expect(res.body).toEqual({ deleted: testActivityIds[1] });
    });

    test("unauth for different user", async function () {
        const res = await request(app)
            .delete(`/activity/u1/${testActivityIds[1]}`)
            .set("authorization", `Bearer ${tokens[1]}`);
        expect(res.statusCode).toEqual(401);
    });

    test("unauth for visitor", async function () {
        const res = await request(app).delete(
            `/activity/u1/${testActivityIds[1]}`
        );
        expect(res.statusCode).toEqual(401);
    });

    test("not found for no such activity", async function () {
        const res = await request(app)
            .delete(`/activity/u1/nope`)
            .set("authorization", `Bearer ${tokens[0]}`);
        expect(res.statusCode).toEqual(404);
    });
});
