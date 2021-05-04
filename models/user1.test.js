"use strict";

const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const User = require("./user.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** authenticate */

describe("authenticate", function () {
    test("works", async function () {
        const user = await User.authenticate("u1", "password1");
        expect(user).toEqual({
            userId: "u1id",
            username: "u1",
            firstName: "U1F",
            lastName: "U1L",
            email: "u1@email.com",
        });
    });

    test("unauth if no such user", async function () {
        try {
            await User.authenticate("nope", "password");
            fail();
        } catch (e) {
            expect(e instanceof UnauthorizedError).toBeTruthy();
        }
    });

    test("unauth if wrong password", async function () {
        try {
            await User.authenticate("u1", "wrong");
            fail();
        } catch (e) {
            expect(e instanceof UnauthorizedError).toBeTruthy();
        }
    });
});

/************************************** 
register */

describe("register", function () {
    const newUser = {
        username: "new",
        firstName: "Test",
        lastName: "Tester",
        email: "test@test.com",
    };

    test("works", async function () {
        let user = await User.register({
            ...newUser,
            password: "password",
        });
        expect(user).toEqual({ ...newUser, userId: expect.any(String) });
        const found = await db.query(
            "SELECT * FROM users WHERE username = 'new'"
        );
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("bad request with dup data", async function () {
        try {
            await User.register({
                ...newUser,
                password: "password",
            });
            await User.register({
                ...newUser,
                password: "password",
            });
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

// /************************************** findAll */

describe("findAll", function () {
    test("works", async function () {
        const users = await User.findAll();
        expect(users).toEqual([
            {
                username: "u1",
                firstName: "U1F",
                lastName: "U1L",
                userId: "u1id",
                email: "u1@email.com",
            },
            {
                username: "u2",
                firstName: "U2F",
                lastName: "U2L",
                userId: "u2id",
                email: "u2@email.com",
            },
        ]);
    });
});

/************************************** get */

describe("get", function () {
    test("works", async function () {
        let user = await User.get("u1");
        expect(user).toEqual({
            username: "u1",
            firstName: "U1F",
            lastName: "U1L",
            userId: "u1id",
            email: "u1@email.com",
            trips: [
                {
                    endDate: expect.any(String),
                    startDate: expect.any(String),
                    tripId: expect.any(String),
                    tripName: "Austin 1 Day",
                },
                {
                    endDate: expect.any(String),
                    startDate: expect.any(String),
                    tripId: expect.any(String),
                    tripName: "Dallas 2 Days",
                },
            ],
        });
    });

    test("not found if no such user", async function () {
        try {
            await User.get("nope");
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************************** update */

describe("update", function () {
    const updateData = {
        username: "newname",
        firstName: "NewF",
        lastName: "NewF",
        email: "new@email.com",
    };

    test("works", async function () {
        let job = await User.update("u1", updateData);
        expect(job).toEqual({
            userId: "u1id",
            ...updateData,
        });
    });

    test("works: set password", async function () {
        let job = await User.update("u1", {
            password: "new",
        });
        expect(job).toEqual({
            userId: "u1id",
            username: "u1",
            firstName: "U1F",
            lastName: "U1L",
            email: "u1@email.com",
        });
        const found = await db.query(
            "SELECT * FROM users WHERE username = 'u1'"
        );
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("not found if no such user", async function () {
        try {
            await User.update("nope", {
                firstName: "test",
            });
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request if no data", async function () {
        expect.assertions(1);
        try {
            await User.update("c1", {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** remove */

describe("remove", function () {
    test("works", async function () {
        await User.remove("u1");
        const res = await db.query("SELECT * FROM users WHERE username='u1'");
        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such user", async function () {
        try {
            await User.remove("nope");
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});