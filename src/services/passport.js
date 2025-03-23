// lets import some stuff
import passport from 'passport';
import LocalStrategy from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

// and import User
import User from '../models/user_model';

// options for local strategy, we'll use email AS the username
const localOptions = { usernameField: 'username' };

// options for jwt strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: process.env.AUTH_SECRET,
};

// username + password authentication strategy
const localLogin = new LocalStrategy(localOptions, async (username, password, done) => {
    try {
        // Use .exec() to return a promise instead of passing a callback directly.
        const user = await User.findOne({ username }).exec();

        if (!user) {
            return done(null, false);
        }

        // Wrap the comparePassword function in a Promise (assuming it uses a callback).
        const isMatch = await new Promise((resolve, reject) => {
            user.comparePassword(password, (err, match) => {
                if (err) return reject(err);
                resolve(match);
            });
        });

        if (!isMatch) {
            return done(null, false);
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
});

// jwt authentication strategy
const jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
        // Use .exec() to work with promises.
        const user = await User.findById(payload.sub).exec();

        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (err) {
        return done(err, false);
    }
});

// Tell passport to use these strategies
passport.use(jwtLogin);
passport.use(localLogin);

export const requireAuth = passport.authenticate('jwt', { session: false });
export const requireSignin = passport.authenticate('local', { session: false });
