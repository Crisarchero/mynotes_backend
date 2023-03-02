const mongoose = require('mongoose')
const Schema = mongoose.Schema

const pageSchema = new Schema(
    {
        name: { type: String, required: true},
        notebook:{type: Schema.Types.ObjectId, ref: 'Notebook', required: true},
        summary:{type: String, required: true},
        content:[{header: String,
                  paragraph: String}] 
        

    },
    {timestamps:true}
)

const Page = mongoose.model('Page', pageSchema)

module.exports = Page