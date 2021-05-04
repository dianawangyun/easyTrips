"use strict";

const jsonschema = require("jsonschema");

const Activity = require("../models/activity");
const express = require("express");
const { ensureCorrectUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");

const activityUpdateSchema = require("../schemas/activityUpdate.json");
const activityCreateSchema = require("../schemas/activityCreate.json");

const router = express.Router();

/** POST /activity/[username]/[tripid] {activity}=>{activity}
 *
 * activity must include {trip_id, activity_name }
 *
 * return activity id
 *
 * Authorization required: same user
 */

router.post(
    "/:username/:tripid",
    ensureCorrectUser,
    async function (req, res, next) {
        try {
            req.body.tripId = req.params.tripid;
            const validator = jsonschema.validate(
                req.body,
                activityCreateSchema
            );
            if (!validator.valid) {
                const errs = validator.errors.map((e) => e.stack);
                throw new BadRequestError(errs);
            }

            const activity = await Activity.create(req.body);

            return res.status(201).json({ activity });
        } catch (e) {
            return next(e);
        }
    }
);

/** GET /[username]/[activityid] => {activity}
 *
 * Returns { activityId, activityName, description, startTime, endTime, location, latitude, longitude, comment }
 *
 * Authorization required: same user
 */

router.get(
    "/:username/:activityid",
    ensureCorrectUser,
    async function (req, res, next) {
        try {
            const activity = await Activity.get(req.params.activityid);
            return res.json({ activity });
        } catch (e) {
            return next(e);
        }
    }
);

/** PATCH /[username]/[activityid] {fld1, fld2, ... } => { activity }
 *
 * Patches activity data
 *
 * fields can be: { activityName, description, startTime, endTime, location, latitude, longitude, comment }
 *
 * Returns { activityId, activityName, description, startTime, endTime, location, latitude, longitude, comment }
 *
 * Authorization required: same user
 */

router.patch(
    "/:username/:activityid",
    ensureCorrectUser,
    async function (req, res, next) {
        try {
            const validator = jsonschema.validate(
                req.body,
                activityUpdateSchema
            );
            if (!validator.valid) {
                const errs = validator.errors.map((e) => e.stack);
                throw new BadRequestError(errs);
            }
            const activity = await Activity.update(
                req.params.activityid,
                req.body
            );
            return res.json({ activity });
        } catch (e) {
            return next(e);
        }
    }
);

/** DELETE /[username]/[activityid] => {deleted: activityid}
 *
 * Authorization: same user
 */

router.delete(
    "/:username/:activityid",
    ensureCorrectUser,
    async function (req, res, next) {
        try {
            await Activity.remove(req.params.activityid);
            return res.json({ deleted: req.params.activityid });
        } catch (e) {
            return next(e);
        }
    }
);

module.exports = router;
