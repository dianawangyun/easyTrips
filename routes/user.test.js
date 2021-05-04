"use strict";
const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const User = require("../models/user");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    tokens,
    testTripIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GET /user/:username */

describe("GET /user/:username", function () {
    test("works for same user", async function () {
        const resp = await request(app)
            .get(`/user/u1`)
            .set("authorization", `Bearer ${tokens[0]}`);
        expect(resp.body).toEqual({
            user: {
                username: "u1",
                firstName: "U1F",
                lastName: "U1L",
                email: "user1@user.com",
                userId: expect.any(String),
                trips: [
                    {
                        tripId: testTripIds[0],
                        tripName: "Austin 1 Day",
                        startDate: "2020-01-23",
                        endDate: "2020-01-23",
                    },
                    {
                        tripId: testTripIds[1],
                        tripName: "Houston 1 Day",
                        startDate: "2021-01-01",
                        endDate: "2021-01-01",
                    },
                ],
            },
        });
    });

    test("unauth for other users", async function () {
        const resp = await request(app)
            .get(`/user/u1`)
            .set("authorization", `Bearer ${tokens[1]}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for anon", async function () {
        const resp = await request(app).get(`/user/u1`);
        expect(resp.statusCode).toEqual(401);
    });
});

/************************************** PATCH /users/:username */

describe("PATCH /users/:username", () => {
    test("works for same user", async function () {
        const resp = await request(app)
            .patch(`/user/u1`)
            .send({
                firstName: "New",
            })
            .set("authorization", `Bearer ${tokens[0]}`);
        expect(resp.body).toEqual({
            user: {
                username: "u1",
                firstName: "New",
                lastName: "U1L",
                email: "user1@user.com",
                userId: expect.any(String),
            },
        });
    });

    test("unauth if not same user", async function () {
        const resp = await request(app)
            .patch(`/user/u1`)
            .send({
                firstName: "New",
            })
            .set("authorization", `Bearer ${tokens[1]}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for anon", async function () {
        const resp = await request(app).patch(`/user/u1`).send({
            firstName: "New",
        });
        expect(resp.statusCode).toEqual(401);
    });

    test("bad request if invalid data", async function () {
        const resp = await request(app)
            .patch(`/user/u1`)
            .send({
                firstName: 42,
            })
            .set("authorization", `Bearer ${tokens[0]}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("works: can set new password", async function () {
        const resp = await request(app)
            .patch(`/user/u1`)
            .send({
                password: "new-password",
            })
            .set("authorization", `Bearer ${tokens[0]}`);
        expect(resp.body).toEqual({
            user: {
                username: "u1",
                firstName: "U1F",
                lastName: "U1L",
                email: "user1@user.com",
                userId: expect.any(String),
            },
        });
        const isSuccessful = await User.authenticate("u1", "new-password");
        expect(isSuccessful).toBeTruthy();
    });
});
