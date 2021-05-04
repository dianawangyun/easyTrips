"use strict";

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");

const User = require("../models/user");

const userUpdateSchema = require("../schemas/userUpdate.json");
// const { user } = require("../db");

const router = express.Router();

/* GET /[username] => {user} 
    Returns {username, firstName, lastName, trips}

    where trips would be a list

    Authorization required: same user
*/

router.get("/:username", ensureCorrectUser, async function (req, res, next) {
    try {
        const user = await User.get(req.params.username);
        return res.json({ user });
    } catch (e) {
        return next(e);
    }
});

/* PATCH / [username] {user} => {user} 

    Data can include:
    {firstName, lastName, password, email}

    Returns {username, firstName, lastName, email}

    Authorization required: same user
*/

router.patch("/:username", ensureCorrectUser, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map((e) => e.stack);
            throw new BadRequestError(errs);
        }

        const user = await User.update(req.params.username, req.body);
        return res.json({ user });
    } catch (e) {
        return next(e);
    }
});

/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: same user
 **/

router.delete("/:username", ensureCorrectUser, async function (req, res, next) {
    try {
        const msg = await User.remove(req.params.username);
        return res.json(msg);
    } catch (err) {
        return next(err);
    }
});

/* POST /[username]/trips/[id] {state} => {trip}

    Returns {"added": tripName}

    Authorization required: same user
*/
// added later

module.exports = router;
