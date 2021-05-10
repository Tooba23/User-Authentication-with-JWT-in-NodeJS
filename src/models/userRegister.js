const express = require("express");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    confirmpassword: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,

    },
    phone: {
        type: Number,
        required: true,
        unique: true

    },
    age: {
        type: Number,
        required: true,
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }]
})
employeeSchema.methods.generatAuthToken = async function() {
    try {
        const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY)
        this.tokens = this.tokens.concat({ token })
        await this.save();
        // console.log(token);
        return token
    } catch (e) {
        // res.send('the error' + e)
        console.log(`the error ${e} `)
    }
}
employeeSchema.pre("save", async function(next) {
    if (this.isModified("password")) {
        // const passwordHash = await bcrypt.hash(password, 10);
        // console.log(`The current password is ${this.password}`);
        this.password = await bcryptjs.hash(this.password, 10);
        this.confirmpassword = await bcryptjs.hash(this.password, 10);

        // console.log(`The current password is ${this.password}`);
        // this.confirmpassword = undefined;
    }
    next();
})
const Register = new mongoose.model("Register", employeeSchema);
module.exports = Register;