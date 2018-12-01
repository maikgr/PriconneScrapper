const request = require('request-promise-native');
const sleep = require('system-sleep');

const db = require('../utilities/db_characters');
const appmedia = require('../utilities/appmedia_parser');

module.exports = {
    name: 'update-info',
    aliases: [],
    description: 'Update all characters/specific character info from appmedia.',
    args: false,
    usage: '[character?]',
    ownerOnly: true,
    globalCooldown: true,
    sortIndex: 2,
    execute(message, args) {
        updateInfo(message, args);
    }
};

async function updateInfo(message, args) {
    if (args[0]) {
        let char = await db.getChar(args[0]);
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

function getRandomTime(fromSeconds, toSeconds) {
    let from = fromSeconds * 1000;
    let to = toSeconds * 1000;
    return (Math.random(to - from) + from);
}