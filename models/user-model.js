const mongoose = require('mongoose')
const Schema = mongoose.Schema



const userSchema = new Schema(
    {
        name: { type: String, required: true, unique:true},
        password: { type: String, required: true},
        notebooks:[{type: Schema.Types.ObjectId, ref: 'Notebook', required: true}],
    }
   
)

const User = mongoose.model('User', userSchema)

module.exports = User
