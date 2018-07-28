const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const db = mongoose.connection;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
db.on('error', console.error.bind(console, 'gacha connection error:'));
db.on('connected', () => console.log('connected to gacha database.'));
db.on('disconnected', () => console.log('disconnected from gacha database.'));

process.on('SIGINT', () => {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

const gachaSchema = new Schema({
    rank3up_rate: Number,
    rank2up_rate: Number,
    rank3_rate: Number,
    rank2_rate: Number,
    rank3up: [],
    rank2up: [],
    rank3: [],
    rank2: [],
    rank1: []
});

const Gacha = mongoose.model('Gacha', gachaSchema, 'gacha');

module.exports = {
    getGachaInfo: getGachaInfo
}

function getGachaInfo() {
    return Gacha.findOne().exec();
}