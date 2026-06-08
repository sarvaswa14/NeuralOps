const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const GitHubStrategy = require('passport-github2').Strategy
const User = require('../models/User')
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id })
      
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          email: profile.emails ? profile.emails[0].value : null,
          name: profile.displayName
        })
      }
      
      return done(null, user)
    } catch (error) {
      return done(error, null)
    }
  }
))
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id })
      
      if (!user) {
        user = await User.create({
          githubId: profile.id,
          email: profile.emails ? profile.emails[0].value : null,
          name: profile.displayName || profile.username
        })
      }
      
      return done(null, user)
    } catch (error) {
      return done(error, null)
    }
  }
))
module.exports = passport