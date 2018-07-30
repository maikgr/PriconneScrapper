const db = require('../utilities/db_characters');

module.exports = {
    name: 'update-alias',
    description: 'Add new alias to a character.',
    args: true,
    usage: '[character name] [new alias]',
    cooldown: 5,
    ownerOnly: true,
    globalCooldown: true,
    sortIndex: 8,
    execute(message, args) {
        updateAlias(message, args);
    }
};

async function updateAlias(message, args) {
    let charToUpdate = args[0];
    let newAlias = args[1];
    let char = await db.getChar(charToUpdate);
    if (!char) return message.channel.send('Character not found.');
    await db.updateAlias(char, newAlias)
    return message.channel.send(`${char.alias[0]} updated.`);
}