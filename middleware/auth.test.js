"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
    authenticateJWT,
    ensureLoggedIn,
    ensureCorrectUser,
} = require("./auth");

const { SECRET_KEY } = require("../config");
const { text } = require("express");
const testJwt = jwt.sign({ username: "test" }, SECRET_KEY);
const badJwt = jwt.sign({ username: "wrong" }, "wrong");

describe("authenticateJWT", function () {
    test("works: via header", function () {
        expect.assertions(2);
        const req = { headers: { authorization: `Bearer ${testJwt}` } };
        const res = { locals: {} };
        const next = function (e) {
            expect(e).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({
            user: {
                iat: expect.any(Number),
                username: "test",
            },
        });
    });

    test("works: no header", function () {
        expect.assertions(2);
        const req = {};
        const res = { locals: {} };
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({});
    });

    test("works: invalid token", function () {
        expect.assertions(2);
        const req = { headers: { authorization: `Bearer ${badJwt}` } };
        const res = { locals: {} };
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({});
    });
});

describe("ensureLoggedIn", function () {
    test("works", function () {
        expect.assertions(1);
        const req = {};
        const res = { locals: { user: { username: "test" } } };
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        ensureLoggedIn(req, res, next);
    });

    text("unauth if no login", function () {
        expect.assertions(1);
        const req = {};
        const res = { locals: {} };
        const next = function (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        };
        ensureLoggedIn(req, res, next);
    });
});

describe("ensureCorrectUser", function () {
    test("works", function () {
        expect.assertions(1);
        const req = { params: { username: "test" } };
        const res = { locals: { user: { username: "test" } } };
        const next = function (e) {
            expect(e).toBeFalsy();
        };
        ensureCorrectUser(req, res, next);
    });

    test("unauth: not same user", function () {
        expect.assertions(1);
        const req = { params: { username: "wrong" } };
        const res = { locals: { user: { username: "test" } } };
        const next = function (e) {
            expect(e instanceof UnauthorizedError).toBeTruthy();
        };
        ensureCorrectUser(req, res, next);
    });

    test("unauth: if anon", function () {
        expect.assertions(1);
        const req = { params: { username: "test" } };
        const res = { locals: {} };
        const next = function (e) {
            expect(e instanceof UnauthorizedError).toBeTruthy();
        };
        ensureCorrectUser(req, res, next);
    });
});
