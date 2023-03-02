const router = require("express").Router()
const { default: mongoose } = require("mongoose")
const Users = require('../models/user-model')
const Notebooks = require('../models/notebook-model')
const Pages = require('../models/page-model')
const jwt = require('jsonwebtoken')

router.route('/').get((req, res) => {
    Users.find()
        .populate('notebooks')
        .then(users => res.json(users))
        .catch(err => res.status(400).json('Error: ' + err))
})



//To get a specific user.
router.route('/:id').get((req, res) => {
    Users.findById(req.params.id)
        .populate("notebooks")
        .then(users => res.json(user))
        .catch(err => res.status(400).json("Error: " + err))
})

//To delete a specific user and everything the user has.
router.route('/:id').delete((req, res) => {
    Notebooks.find({ 'owner': req.params.id })
        .then(notebooks => {
            notebooks.forEach(function (notebook) {
                Pages.find({ 'notebook': notebook._id }, function (err, pages) {//Find all the pages of the current notebook.
                    if (err) {
                        console.log(err)
                    }
                    else {
                        pages.forEach(function (page) {//Delete all the pages.
                            Pages.findByIdAndDelete(page)
                                .catch(err => res.status(400).json("Error: " + err))
                        }
                        )

                    }
                })
                Notebooks.findByIdAndDelete(notebook._id)
                    .catch(err => res.status(400).json("Error: " + err))
            })
        })

    Users.findByIdAndDelete(req.params.id)
        .then(page => res.json("Account deleted."))
        .catch(err => res.status(400).json("Error: " + err))
})

//For editing the user's information.
router.route('/edit/:id').put((req, res) => {

    Users.findOne({ 'name': req.body.name })
        .then((other_user) => {
            if (other_user) {
                res.status(400).json({ status: 'error', error: "That username is already taken!" })
            }
            else {
                Users.updateOne({ _id: req.params.id }, { 'name': req.body.name }, { new: true }, function (err) {
                    if (err) {
                        res.json(err)
                    }
                    else {
                        res.json("Changed the user's information.")
                    }
                })
            }
        }
        )


})


module.exports = router;