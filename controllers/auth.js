const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const keys = require('../config/keys')
// const errorHandler = require('../utils/errorHandler')


module.exports.login = async function (req, res) {
  const candidate = await User.findOne({ email: req.body.email })

  if (candidate) {
    const passwordResult = bcrypt.compareSync(req.body.password, candidate.password)
    if (passwordResult) {
      const accessToken = jwt.sign({
        email: candidate.email,
        id: candidate._id,
        name: candidate.name,
        username: candidate.username
      }, keys.jwt, { expiresIn: 3600 })

      res.status(200).json({
        accessToken
      })
    } else {
      res.status(401).json({
        message: 'The password is incorrect.'
      })
    }
  } else {
    res.status(404).json({
      message: 'User not found.'
    })
  }
}


module.exports.signup = async function (req, res) {

  const candidate = await User.findOne({ email: req.body.email })

  if (candidate) {
    res.status(409).json({
      message: 'Email is already taken. Try to use another one.'
    })
  }
  else {
    const salt = bcrypt.genSaltSync(10)
    const password = req.body.password
    const user = new User({
      email: req.body.email,
      password: bcrypt.hashSync(password, salt),
      name: req.body.name,
      username: req.body.username
    })

    try {
      const savedUser = await user.save()

      const accessToken = jwt.sign({
        email: savedUser.email,
        id: savedUser._id,
        name: savedUser.name,
        username: savedUser.username
      }, keys.jwt, { expiresIn: 3600 })

      res.status(201).json({ accessToken })
    } catch (e) {
      // errorHandler(res, e)
      console.log(e)
    }
  }
}