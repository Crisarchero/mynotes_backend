const mongoose = require('mongoose')

mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true })
    .catch(e => {
        console.error('Connection error', e.message)
    })


const db = mongoose.connection
db.once('open',() => {console.log("The database connection was established.")})

module.exports = db