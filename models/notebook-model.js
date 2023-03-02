const mongoose = require('mongoose')
const Schema = mongoose.Schema



const notebookSchema = new Schema(
    {
        owner:{type: Schema.Types.ObjectId, ref: 'User', required: true},
        name: { type: String, required: true},
        pages:[{type: Schema.Types.ObjectId, ref: 'Page'}]
    },
    {timestamps:true}
)

const Notebook = mongoose.model('Notebook', notebookSchema)

module.exports = Notebook
