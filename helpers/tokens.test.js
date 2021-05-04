const jwt = require("jsonwebtoken");
const { createToken } = require("./tokens");
const { SECRET_KEY } = require("../config");

describe("createToken", function () {
    test("works", function () {
        const token = createToken({ userId: "u1id", username: "u1n" });
        const payload = jwt.verify(token, SECRET_KEY);
        expect(payload).toEqual({
            iat: expect.any(Number),
            userId: "u1id",
            username: "u1n",
        });
    });
});
