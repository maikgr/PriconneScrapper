const request = require('request-promise-native');
const sleep = require('system-sleep');
const db = require('../utilities/db_characters');
const appmedia = require('../utilities/appmedia_parser');

const mainPageUrl = "https://appmedia.jp/priconne-redive/1058526";

module.exports = {
    name: 'update-list',
    aliases: [],
    description: 'Check appmedia for new characters.',
    args: false,
    usage: '',
    cooldown: 5,
    ownerOnly: true,
    globalCooldown: true,
    sortIndex: 3
};

module.exports.execute = async function (message) {
    const sentMessage = await message.channel.send("Checking for update...");
    const pageHtml = await request(mainPageUrl);
    const currentCharList = db.characters();

    let charList = appmedia.charList(pageHtml);
    let currentCharIds = currentCharList.map(x => x.char_id);
    let newCharList = charList.filter(function (char) {
        return !currentCharIds.includes(char.char_id);
    });

    if (newCharList.length == 0) {
        return sentMessage.edit("Nothing to update.");
    } else {
        sentMessage.edit("New characters found, updating...")
        await addNewChars(newCharList);
        let charNames = newCharList.map(x => x.alias);
        db.initialize();
        return sentMessage.edit("Added " + charNames.join(", ") + ".");
    }
}

async function addNewChars(charList) {
    let i = 0;
    for (i; i < charList.length; ++i) {
        const char = charList[i];
        const charUrl = char.details;

        const html = await request(charUrl)
        const character = appmedia.charDetails(char, html);
        await db.addChar(character);
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