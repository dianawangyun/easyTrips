"use strict";

const jsonschema = require("jsonschema");

const Trip = require("../models/trip");
const express = require("express");
const { ensureCorrectUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");

const tripUpdateSchema = require("../schemas/tripUpdate.json");
const tripCreateSchema = require("../schemas/tripCreate.json");

const router = express.Router();

/** POST /trip/[username] {trip} => {trip}
 *
 * trip must include {userId, tripName, startDate, endDate}
 *
 * returns trip id
 *
 * Authorization required: same user
 */

router.post("/:username", ensureCorrectUser, async function (req, res, next) {
    try {
        req.body.userId = res.locals.user.userId;
        const validator = jsonschema.validate(req.body, tripCreateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map((e) => e.stack);
            throw new BadRequestError(errs);
        }
        const trip = await Trip.create(req.body);
        return res.status(201).json({ trip });
    } catch (e) {
        return next(e);
    }
});

/* GET /[username]/[tripid] => {trip} 
    Returns {userId, tripName, startDate, endDate, activities}

    where activities would be a list

    Authorization required: same user
*/

router.get("/:username/:tripid", async function (req, res, next) {
    try {
        const trip = await Trip.get(req.params.tripid);
        return res.json({ trip });
    } catch (e) {
        return next(e);
    }
});

/** PATCH /[username]/[tripid] {fld1, fld2, ... } => { trip }
 *
 * Patches trip data
 *
 * fields can be: { tripName, startDate, endDate }
 *
 * Returns { tripId, tripName, startDate, endDate }
 *
 * Authorization required: same user
 */

router.patch(
    "/:username/:tripid",
    ensureCorrectUser,
    async function (req, res, next) {
        try {
            const validator = jsonschema.validate(req.body, tripUpdateSchema);
            if (!validator.valid) {
                const errs = validator.errors.map((e) => e.stack);
                throw new BadRequestError(errs);
            }

            const trip = await Trip.update(req.params.tripid, req.body);
            return res.json({ trip });
        } catch (e) {
            return next(e);
        }
    }
);

/** DELETE /[username]/[tripid] => {deleted: tripid}
 *
 * Authorization: same user
 */

router.delete(
    "/:username/:tripid",
    ensureCorrectUser,
    async function (req, res, next) {
        try {
            await Trip.remove(req.params.tripid);
            return res.json({ deleted: req.params.tripid });
        } catch (e) {
            return next(e);
        }
    }
);

module.exports = router;
