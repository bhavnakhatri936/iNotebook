const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const JWT_SECRET = "mysecretjwt";
var jwt = require("jsonwebtoken");
var fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");

// Create a user using: POST "/api/auth/createuser". No login required
router.post(
    "/createuser",
    [
        body("email", "Enter a valid email").isEmail(),
        body("name").isLength({ min: 3 }),
        body("password").isLength({ min: 5 }),
    ],
    async (req, res) => {
        // If there are errorrs return bad req and errorrs
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Check whether the user with the same email exists already
        try {
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                return res.status(400).json({
                    error: "sorry a user with this same email already exists",
                });
            }

            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt);

            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: secPass,
            });
            const data = {
                user: {
                    id: user.id,
                },
            };
            const authToken = jwt.sign(data, JWT_SECRET);
            console.log(authToken);
            res.json({ authToken });
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error");
        }
    }
);
// Route : 2 Authenticate a user using: POST "/api/auth/login". No login required

router.post(
    "/login",
    [
        body("email", "Enter a valid email").isEmail(),
        body("password", "Password cannot be blank").exists(),
    ],
    async (req, res) => {
        // If there are errorrs return bad req and errorrs
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({
                    error: "Please try to login with correct credentials",
                });
            }

            const passwordCompare = await bcrypt.compare(
                password,
                user.password
            );
            if (!passwordCompare) {
                return res.status(400).json({
                    error: "Please try to login with correct credentials",
                });
            }

            const data = {
                user: {
                    id: user.id,
                },
            };
            const authToken = jwt.sign(data, JWT_SECRET);
            //   console.log(authToken);
            res.json({ authToken });
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error");
        }
    }
);

// Route : 3 Get loggedin User Details using: POST "/api/auth/getuser". Login required
router.post(
    "/getuser",fetchuser,
    async (req, res) => {
        try {
            const userID = req.user.id;
            const user = await User.findById(userID).select("-password");
            res.send(user);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error");
        }
    }
);

module.exports = router;
