const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const db = mongoose.connection;

let charactersSchema = new Schema({
    char_id: String,
    name: String,
    alias: [String],
    image: String,
    overview: {},
    status: {},
    skills: [{}]
});

let Character = mongoose.model('Character', charactersSchema);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
db.on('error', console.error.bind(console, 'connection error:'));

module.exports = {
    addChar: addChar,
    getChar: getChar,
    getAllChar: getAllChar
}

function addChar(char) {
    let newChar = new Character({
        char_id: char.char_id,
        name: char.name,
        alias: [char.alias],
        image: char.image,
        overview: char.overview,
        status: char.status,
        skills: char.skills
    });

    newChar.save(function (err) {
        if (err) {
            throw err;
        }
        console.log("Saved " + char.alias[0]);
    })
}

function getChar(query) {
    return Character.find({alias: new RegExp('^' + query, 'i')}).exec();
}

function getAllChar() {
    return Character.find().exec();
}