const request = require('request-promise-native');
const sleep = require('system-sleep');

const db = require('../utilities/db_manager');
const appmedia = require('../utilities/appmedia_parser');


const mainPageUrl = "https://appmedia.jp/priconne-redive/1058526";
const argsMap = {
    '-list': { execute: updateCharList, description: 'Check for new character and update the db if there\'s any.' },
    '-alias':  { execute: updateAlias, description: 'Add a new alias to a character. Usage `-alias <character>`' },
    '-info':  { execute: updateInfo, description: 'Update character rank from appmedia. Usage `-info <character(optional)>`' }
}

module.exports = {
    name: 'update',
    description: 'Update the database. Type `.update -help` to check list of command options',
    args: true,
    usage: '<option> [<value>]',
    cooldown: 5,
    ownerOnly: true,
    globalCooldown: true,
    execute(message, args) {
        let option = args[0];
        if(argsMap.hasOwnProperty(option)) {
            return argsMap[option].execute(message, args);
        }
    }
};

function updateCharList(message, args) {
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

async function updateAlias(message, args) {
    let charToUpdate = args[1];
    let newAlias = args[2];
    let char = await db.getChar(charToUpdate);
    if (!char) return message.channel.send('Character not found.');
    await db.updateAlias(char, newAlias)
    return message.channel.send(`${char.alias[0]} updated.`);
}

async function updateInfo(message, args) {
    if (args[1]) {
        let char = await db.getChar(args[1]);
        if (!char) return message.channel.send('Character not found.');
        return await updateCharInfo(message, char);
    } else {
        return await updateAllCharInfo(message);
    }
}

async function updateAllCharInfo(message) {
    let chars = await db.getAllChar();
    if(chars.length === 0) return message.channel.send('Character list is empty.');
    message.channel.send(`Checking ${chars.length} characters for update...`);

    let i = 0;
    for (i; i < chars.length; ++i) {
        await updateCharInfo(message, chars[i]);
        sleep(getRandomTime(10, 20));
    }    
    return message.channel.send(`Finished update.`);
}

async function updateCharInfo(message, char) {
    let html = await request(`https://appmedia.jp/priconne-redive/${char.char_id}`);
    let parsedChar = await appmedia.charDetails(char, html);
    let updatedInfos = [];

    if(char.image !== parsedChar.image) {
        await db.updateImageUrl(char, parsedChar.image);
        updatedInfos.push('image');
    }
    if(char.overview.questRank !== parsedChar.overview.questRank
        || char.overview.arenaRank !== parsedChar.overview.arenaRank) {
        console.log(char.overview);
        console.log(parsedChar.overview);
        await db.updateOverview(char, parsedChar.overview);
        updatedInfos.push('rank');
    }
    if(char.status.hp !== parsedChar.status.hp
        || char.status.patk !== parsedChar.status.patk
        || char.status.matk !== parsedChar.status.matk
        || char.status.pdef !== parsedChar.status.pdef
        || char.status.mdef !== parsedChar.status.mdef) {
        console.log(char.status);
        console.log(parsedChar.status);
        await db.updateStatus(char, parsedChar.status);
        updatedInfos.push('status');
    }

    if(updatedInfos.length === 0) {
        return message.channel.send(`Nothing to update for ${char.alias[0]}`);
    }
    return message.channel.send(`Updated ${updatedInfos.join(', ')} for ${char.alias[0]}`)
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