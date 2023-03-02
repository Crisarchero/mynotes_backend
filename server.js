//Dependencies
require('dotenv').config()
const Users = require('./models/user-model')
const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')


//Pathing for routes.
const notebooksRouter = require('./routes/notebooks')
const pagesRouter = require('./routes/pages')
const userRouter = require('./routes/users')
//Setting up database.
const db = require('./db')
const app = express()
const apiPort = process.env.PORT

//Some set up
const saltRounds = 10;

app.use(cors())
app.use(express.json())

db.on('error', console.error.bind(console, 'MongoDB connection error:'))



///////////////////////////////////////////////


//Login
app.post('/users/login', (req, res) => {

    Users.findOne({
        name: req.body.name,
    })
        .then((user) => {
            if (user) {
                bcrypt.compare(req.body.password, user.password, (err, result) => {
                    if (result) {
                        const token = jwt.sign({
                            id: user._id,
                            name: req.body.name
                        }, 'secret')
                        return res.json({ status: 'ok', user: token })
                    }
                    else {
                        return res.json({ status: 'Wrong username or password', user: false })
                    }
                })

            }
            else {
                return res.json({ status: 'Wrong username or password', user: false })
            }
        })


})

//Sign Up
app.post('/users/add', (req, res) => {
    const name = req.body.name
    const password = req.body.password

    Users.findOne({ name: name })
        .then((otherUser) => {
            if (otherUser) {
                console.log(otherUser)
                res.status(400).json({ error: "That username is unavailable! Pick another!" })
            }
            else {
                try {

                    console.log("no other user.")


                    bcrypt.genSalt(saltRounds, (err, salt) => {
                        bcrypt.hash(password, salt, (err, hash) => {

                            let hashPassword = hash
                            console.log(hashPassword)
                            const newUser = new Users({ name: name, password: hashPassword })

                            newUser.save()
                                .then(() => {
                                    return res.status(200).json({ status: 'ok' })
                                })
                                .catch(err => res.status(400).json({ error: 'Error: ' + err }))
                        })
                    })


                }
                catch (err) {
                    return res.status(400).json({ error: "Error: " + err })
                }


            }
        })


})

//Routing
app.use('/notebooks', (req,res,next)=>{
    validate(req,res,next,'/notebooks', notebooksRouter)
})

app.use('/pages', (req,res,next)=>{
    validate(req,res,next,'/pages', pagesRouter)
})

app.use('/users', (req,res,next)=>{
    validate(req,res,next,'/users', userRouter)
})




function validate(req,res,next, route, router){
    console.log("validating...")

    if (req) {

        const token = req.headers['x-access-token']
        console.log(token)
        if (token) {

            try {
                const decode = jwt.verify(token, 'secret')
                if(decode){

                    app.use(route, router);
                    next()
                  
                }
                else{
                    res.status(401).json({ status: 'error', error: "Invalid token" })
                }
            }
            catch (error) {
                console.log(error)
                res.status(401).json({ status: 'error', error: "Invalid" })
            }

        }
        else {
            res.status(401).json("Validation failed")
        }
        
    }

}

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`))