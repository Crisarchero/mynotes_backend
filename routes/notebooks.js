const router = require("express").Router()
const { default: mongoose } = require("mongoose")
const Notebook = require('../models/notebook-model')
const Pages = require('../models/page-model')
const Owner = require('../models/user-model')
const jwt = require('jsonwebtoken')
const { renderSync } = require("sass")
const validate = require("../server")

//Finding the notebooks that have a specific owner.

router.route('/owner/:id').get((req, res) => {
    
    Notebook.find({ 'owner': req.params.id })
        .populate("pages")
        .populate("owner")
        .then(notebooks => res.json(notebooks))
        .catch(err => res.status(400).json('Error: ' + err))
})


router.route('/add').post((req, res) => {
    const name = req.body.name
    const owner = req.body.owner
    const newNotebook = new Notebook({ owner, name })

    newNotebook.save()
        .then(() => {
            updateOwner(req.body.owner)
            res.json('Notebook added!')
        })
        .catch(err => res.status(400).json('Error: ' + err))

    Notebook.find()
        .populate("owner")
        .populate("pages")

})

//For when the user looks at a specific notebook.
router.route('/:id').get((req, res) => {
    Notebook.findById(req.params.id)
        .populate('pages')
        .then(notebook => res.json(notebook))
        .catch(err => res.status(400).json("Error: " + err))
})

//To delete a specific notebook and all the related pages.
router.route('/:id').delete((req, res) => {


    Pages.find({ 'notebook': req.params.id}, function (err, pages) {//Find all the pages of the current notebook.
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
    Notebook.findByIdAndDelete(req.params.id)
        .then(notebook => res.json("Notebook deleted."))
        .catch(err => res.status(400).json("Error: " + err))

})

//For editing the notebook
router.route('/edit/:id').put((req, res) => {


    Notebook.updateOne({ _id: req.params.id }, { 'name': req.body.name }, { new: true }, function (err) {
        if (err) {
            res.json(err)
        }
        else {
            res.json("Changed the notebook's name.")
        }
    })

})

function updateOwner(user) {

    Notebook.find({ 'owner': user }, function (err, notebooks) {//Find all the pages of the current notebook.
        if (err) {
            console.log(err)
        }
        else {
            let notebookIds = []
            notebooks.forEach(function (notebook) {//Build a list of all the pages of the notebook in question.
                notebookIds.push(notebook['_id'])
            }
            )

            Owner.updateOne({ _id: user }, { 'notebooks': notebookIds }, { new: true }, function (err) {
                if (err) {
                    console.log(err)
                }
                else {
                    console.log("Updated the owner's list of notebooks:  " + notebookIds)
                }
            })
        }
    })

}


module.exports = router;