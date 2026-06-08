const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require("../models/User")
const register = async ( req,res) => {
    try{
        const { name,email,password} = req.body
        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.status(400).json({message: 'User already exists'})
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({ name, email, passwordHash: hashedPassword })
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } })
    }catch(error){
        res.status(500).json({ message: error.message })
    }
}
const login = async( req, res) =>{
    try{
        const {email , password} = req.body
        const user = await User.findOne({email})
        if (!user) {
            return res.status(400).json({ message: 'User not found' })
        }
        const comparePassword = await bcrypt.compare(password, user.passwordHash)
        if (!comparePassword) {
            return res.status(400).json({ message: 'Wrong password' })
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } })
    }catch(error){
        res.status(500).json({ message: error.message })
    }
}
const getMe = async ( req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-passwordHash')
        res.json({ user })
    }catch(error){
        res.status(500).json({ message: error.message })
    }
}
module.exports = { register , login , getMe}