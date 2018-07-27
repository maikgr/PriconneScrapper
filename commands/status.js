const db = require('../utilities/db_manager');

const appmediaUrl = "https://appmedia.jp/priconne-redive";

module.exports = {
    name: 'status',
    aliases: ['stat', 'stats'],
    description: 'Display a character\'s status info.',
    args: true,
    ownerOnly: false,
    cooldown: 3,
    globalCooldown: false,
    usage: '<character name in alphabet>',
    execute(message, args) {
        return findCharacter(message, args);
    }
};

function findCharacter(message, args) {
    db.getChar(args[0])
        .then(function (char) {
            if (!char) return message.channel.send('Character not found.');

            return message.channel.send({
                "embed": {
                    "url": `${appmediaUrl}/${char.char_id}`,
                    "title": `${char.overview.rank}★ ${char.alias[0]} (${char.name})`,
                    "color": 16737945,
                    "description": char.overview.type,
                    "footer": {
                        "text": `ID ${char.char_id} - Information taken from ${appmediaUrl}`
                    },
                    "thumbnail": {
                        "url": char.image
                    },
                    "fields": [
                        {
                            "name": "Max HP",
                            "value": char.status.hp
                        },
                        {
                            "name": "P. Atk",
                            "value": char.status.patk,
                            "inline": true
                        },
                        {
                            "name": "P. Def",
                            "value": char.status.pdef,
                            "inline": true
                        },
                        {
                            "name": "M. Atk",
                            "value": char.status.matk,
                            "inline": true
                        },
                        {
                            "name": "M. Def",
                            "value": char.status.mdef,
                            "inline": true
                        }
                    ]
                }
            });
        });
}