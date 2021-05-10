require('dotenv').config()
const express = require("express");
const path = require("path");
const app = express();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken")
const cookieParser = require('cookie-parser')
const hbs = require("hbs")
const auth = require("./middleware/auth")
require("./db/conn");
const Register = require("./models/userRegister");
const port = process.env.PORT || 3000;
const staticPath = path.join(__dirname, "../public")
const templatePath = path.join(__dirname, "../templates/views")
const partialPath = path.join(__dirname, "../templates/partials")
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(express.static(staticPath))
app.use(cookieParser())
app.set("view engine", "hbs");
app.set("views", templatePath)
hbs.registerPartials(partialPath)

// console.log("Secret key", process.env.SECRET_KEY)
app.get("/", (req, res) => {
    res.render("index");
})
app.get("/secret", auth, (req, res) => {
    // console.log(`This is cookie ${req.cookies.jwt}`)
    res.render("secret");
})
app.get("/logout", auth, async(req, res) => {
    try {
        //for single logout
        console.log(req.user)
            // req.user.tokens = req.user.tokens.filter((item) => {
            //     return item.token !== req.token
            // })
        req.user.tokens = []
        res.clearCookie("jwt");
        console.log("LogOut Successfully")
        await req.user.save();
        res.render("login")
    } catch (error) {
        res.status(500).send(error)
    }
})
app.get("/register", (req, res) => {
    res.render("register");
})
app.get("/login", (req, res) => {
    res.render("login");
})
app.post("/register", async(req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        if (password === cpassword) {
            const registerEmployee = new Register({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: req.body.password,
                confirmpassword: req.body.confirmpassword,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age
            })

            console.log("the success part" + registerEmployee)
                //password hashing ---- middleware
            const token = await registerEmployee.generatAuthToken();
            console.log("the token part " + token)
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 60000),
                httpOnly: true
            })
            console.log(cookie)
            const registered = await registerEmployee.save();
            res.status(201).render("index")
        } else {
            res.send("Password are not matching")
        }
    } catch (e) {
        res.status(400).send(e);

    }
});

//login post

app.post("/login", async(req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userEmail = await Register.findOne({ email: email });
        const isMatch = await bcryptjs.compare(password, userEmail.password)
        const token = await userEmail.generatAuthToken();
        console.log("t he token part " + token)
        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 800000),
            httpOnly: true,
            secure: true
        })
        console.log("ismAtch", isMatch)
            // console.log(cookie)
        if (isMatch) {
            res.status(201).render("index")
        } else {
            res.send("Invalid Password Details")
        }

    } catch (e) {
        res.status(400).send("invalid login details");

    }
});


app.listen(port, () => {
    console.log(`connection established at ${port}`)
})