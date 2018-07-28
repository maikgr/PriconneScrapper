const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const db = mongoose.connection;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
db.on('error', console.error.bind(console, 'character db connection error:'));
db.on('connected', () => console.log('connected to character database.'));
db.on('disconnected', () => console.log('disconnected from character database.'));

process.on('SIGINT', () => {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

const charactersSchema = new Schema({
    char_id: String,
    name: String,
    alias: [String],
    image: String,
    image_mirror: String,
    overview: {},
    status: {},
    skills: [{}],
    skills_en: [{}]
});

const Character = mongoose.model('characters', charactersSchema);

module.exports = {
    addChar: addChar,
    getChar: getChar,
    getAllChar: getAllChar,
    updateAlias: updateAlias,
    updateImageUrl: updateImageUrl,
    updateOverview: updateOverview,
    updateStatus: updateStatus,
    updateMirrorUrl: updateMirrorUrl
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
    })
}

function getChar(query) {
    return Character.findOne({ alias: new RegExp('^' + query, 'i') }).exec();
}

function getCharById(charId) {
    return Character.findOne({ char_id: charId }).exec();
}

function getAllChar() {
    return Character.find().exec();
}

function updateAlias(char, newAlias) {
    let aliasList = char.alias;
    aliasList.push(newAlias);
    return Character.findOneAndUpdate({ char_id: char.char_id }, { alias: aliasList }).exec();
}

function updateImageUrl(char, newImageUrl) {
    return Character.findOneAndUpdate({ char_id: char.char_id }, { image: newImageUrl }).exec();
}

function updateOverview(char, newOverview) {
    return Character.findOneAndUpdate({ char_id: char.char_id }, { overview: newOverview }).exec();
}

function updateStatus(char, newStatus) {
    return Character.findOneAndUpdate({ char_id: char.char_id }, { status: newStatus }).exec();
}

function updateMirrorUrl(char, newMirrorUrl) {
    return Character.findOneAndUpdate({ char_id: char.char_id }, { image_mirror: newMirrorUrl }).exec();
}