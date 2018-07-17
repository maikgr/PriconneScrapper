const db = require('../db_manager');
const request = require('request-promise-native');
const appmedia = require('./appmedia_parser');

const mainPageUrl = "https://appmedia.jp/priconne-redive/1058526";
module.exports = {
    name: 'update',
    args: false,
    description: 'Check appmedia for new character and update database.',
    execute(message, args) {
        return updateDb(message);
    }
};

function updateDb(message) {
    Promise.all([
        message.channel.send("Checking for update..."),
        request(mainPageUrl),
        db.getAllChar()
    ])
        .then(result => {
            let sentMessage = result[0];
            let pageHtml = result[1];
            let currentCharList = result[2];

            let charList = appmedia.charList(pageHtml);
            let currentCharIds = currentCharList.map(x => x.char_id);
            let newCharList = charList.filter(function (char) {
                return !currentCharIds.includes(char.char_id);
            });

            if (newCharList.length == 0) {
                return sentMessage.edit("Nothing to update.");
            } else {
                sentMessage.edit("New characters found, updating...")
                addNewChars(newCharList);
                let charNames = newCharList.map(x => x.alias);
                return sentMessage.edit("Added " + charNames.join(", ") + ".");
            }
        })
        .catch(error => {
            console.error(error);
            throw error;
        });
}

function addNewChars(charList) {
    let i = 0;
    for (i; i < charList.length; ++i) {
        let char = charList[i];
        let charUrl = char.details;

        request(charUrl).then((html) => {
            let character = appmedia.charDetails(char, html);
            db.addChar(character);
        });
        let time = getRandomTime(10, 20);
        console.log("Sleeping for " + time + " ms");
        sleep(time);
    }
}

function getRandomTime(fromSeconds, toSeconds) {
    let from = fromSeconds * 1000;
    let to = toSeconds * 1000;
    return (Math.random(to - from) + from);
}