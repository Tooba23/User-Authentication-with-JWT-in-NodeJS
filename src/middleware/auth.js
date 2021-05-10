const jwt = require("jsonwebtoken");
const Register = require("../models/userRegister");
const auth = async(req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        console.log("verifyuser", verifyUser);
        const user = await Register.findOne({ _id: verifyUser._id })
        console.log("user", user.firstName)
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send(error)
    }
}
module.exports = auth;