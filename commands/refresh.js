const db = require('../utilities/db_characters')
module.exports = {
    name: 'refresh',
    description: 'Refresh character list.',
    aliases: [],
    usage: '',
    cooldown: 1,
    globalCooldown: false,
    args: false,
    ownerOnly: false,
    sortIndex: 5
};

module.exports.execute = async function (message, args) {
    await db.initialize();
    message.channel.send('Refreshed character list.');
}