import jwt from 'jwt-simple';
import dotenv from 'dotenv';
import User from '../models/user_model';

dotenv.config({ silent: true });

// Encodes a new token for a user object
function tokenForUser(user) {
    const timestamp = new Date().getTime();
    return jwt.encode({ sub: user.id, iat: timestamp }, process.env.AUTH_SECRET);
}

export const signin = (req, res, next) => {
    res.send({ token: tokenForUser(req.user) });
};

// Updated signup function using async/await
export const signup = async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(422).send('You must provide username and password');
    }

    try {
        // Check for an existing user with the same username
        const existingUsers = await User.find({ username }).exec();
        if (existingUsers.length !== 0) {
            return res.status(422).send('Username already exists.');
        }

        // Create a new user
        const user = new User({ username, password });

        // Save the user to the database
        await user.save();

        // Respond with a token for the new user
        return res.send({ token: tokenForUser(user) });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
    }
};

// req.body includes:
// 1. username
// 2. new page's ID
export const addPageToUser = (req, res) => {
    User.updateOne(
        { username: req.body.username },
        { $push: { pages: req.body.pageID } }
    )
        .then((result) => {
            res.json('Added page to user!');
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ error });
        });
};
