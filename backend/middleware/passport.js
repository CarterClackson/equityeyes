const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const User = require('../models/user');

require('dotenv').config();

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const existingUser = await User.findOne({ email: profile.emails[0].value });

        if (existingUser) {
            const googleAccount = existingUser.socialAccounts.find(account => account.provider === 'google');
            
            if (!googleAccount) {
                // If not linked, add the Google account to socialAccounts
                existingUser.socialAccounts.push({
                  provider: 'google',
                  socialId: profile.id,
                });
        
                await existingUser.save();
          }

          return done(null, existingUser);
        }
        
        //If user doesn't exist, create new in database
        const newUser = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            socialAccounts: [{
                provider: 'google',
                socialId: profile.id,
            }],
        });

        return done (null, newUser);
    } catch (error) {
        console.log(error);
        return done(error, null);
    }
}));

module.exports = {
    passport,
    initialize: passport.initialize(),
    session: passport.session(),
};