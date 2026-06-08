const router = require('express').Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const {register , login, getMe }= require('../controllers/authController')
const auth = require('../middleware/protect')

router.post('/register',register)
router.post('/login',login)
router.get('/me', auth, getMe)


router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`)
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    return res.redirect(`${process.env.FRONTEND_URL}/oauth?token=${token}`)
  })(req, res, next)
})

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }))

router.get('/github/callback', (req, res, next) => {
  passport.authenticate('github', { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`)
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    return res.redirect(`${process.env.FRONTEND_URL}/oauth?token=${token}`)
  })(req, res, next)
})

module.exports = router