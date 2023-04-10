const express = require('express')
const controller = require('../controllers/auth')
const router = express.Router()
const Joi = require("joi"); // Or any schema validator (must have a .validate() method)
const user = require("../models/User").user
const loginSchema = require("../models/User").loginShema;
const signupSchema = require('../models/User').signupSchema
const contract = require("express-contract").contract;

router.post('/login', contract(loginSchema), controller.login)

router.post('/register', contract(signupSchema), controller.signup)


module.exports = router