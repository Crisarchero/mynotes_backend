const router = require("express").Router()
const Page = require('../models/page-model')
const Notebook = require('../models/notebook-model')

router.route('/').get((req,res) => {
    Page.find()
        .populate("notebook")
        .then(pages => res.json(pages))
        .catch(err => res.status(400).json('Error: ' + err))
})

//For when a page is added.
router.route('/add').post((req,res)=>{
    const name = req.body.name
    const notebook = req.body.notebook
    const summary = req.body.summary
    const content = req.body.content
    const newPage = new Page({name, notebook, summary, content})
    
   
    newPage.save()//Create the new page.
        .then(()=> res.json('Page added!'))
        .then((page) => updateNotebook(notebook))
        .catch(err => res.status(400).json('Error: ' + err)) 
        
   
})

//For when the user looks at a specific page.
router.route('/:id').get((req,res)=>{
    Page.findById(req.params.id)
        .then(page => res.json(page))
        .catch(err => res.status(400).json("Error: " + err))
})

//To delete a specific page.
router.route('/:id').delete((req,res)=>{
    Page.findByIdAndDelete(req.params.id)
        .then(page => res.json("Page Deleted"))
        .catch(err => res.status(400).json("Error: " + err))
})

//For editing the notebook
router.route('/edit/:id').post((req,res)=>{
    Page.findById(req.params.id)
        .then(page => {
            page.name = req.body.name
            page.notebook = req.body.notebook
            page.summary = req.body.summary
            page.content = req.body.content
         

            page.save()
                .then(()=> res.json('Page updated!'))
                .catch(err => res.status(400).json('Error: ' + err))
        
            updateNotebook(page.notebook)
        
            })
        .catch(err => res.status(400).json("Error: " + err))
})



function updateNotebook (notebook) {

    Page.find({'notebook': notebook}, function(err, pages){//Find all the pages of the current notebook.
        if (err) {
            console.log(err)
        }
        else{
            let pageIds = []
            pages.forEach(function(page){//Build a list of all the pages of the notebook in question.
                pageIds.push(page['_id'])
            }
            )
    
            Notebook.updateOne({_id:notebook},{'pages':pageIds}, {new:true}, function(err){
                if (err){
                    console.log(err)
                }
                else{
                    console.log("Updated the notebook with the list of pages: " + pageIds)
                }
                })
            }
        })

}

module.exports = router;