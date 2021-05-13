const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/* sign and return the token */
function createToken(user) {
    let payload = { userId: user.userId, username: user.username };
    return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
