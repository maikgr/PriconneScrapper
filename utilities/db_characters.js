const mongoose = require('mongoose');
const Jimp = require('jimp');
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
    image: {},
    overview: {},
    status: {},
    skills: [{}]
});

const Character = mongoose.model('characters', charactersSchema);

module.exports.addChar = async function (char) {
    const image = await Jimp.read(char.image);
    image.resize(128, 128)
        .getBuffer(Jimp.AUTO, async function (err, imageBuffer) {
            const newChar = new Character({
                char_id: char.char_id,
                name: char.name,
                alias: [char.alias],
                image: {
                    src: char.image,
                    buffer: imageBuffer
                },
                overview: char.overview,
                status: char.status,
                skills: char.skills
            });
        
            newChar.save(function (err) {
                if (err) {
                    throw err;
                }
            });
        });
}

module.exports.getChar = function getChar(query) {
    return Character.findOne({ alias: new RegExp('^' + query, 'i') }).exec();
}

module.exports.getAllChar = function () {
    return Character.find().exec();
}

module.exports.updateAlias = function (char, newAlias) {
    char.alias.push(newAlias);
    let findPromise = Character.findOneAndUpdate({ char_id: char.char_id }, { alias: char.alias }).exec();
    this.initialize();
    return findPromise;
}

let characters = [];

module.exports.initialize = async function () {
    characters = await this.getAllChar();
}

module.exports.characters = function () {
    return characters;
}