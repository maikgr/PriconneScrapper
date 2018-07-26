const db = require('../db_manager');
const appmediaUrl = "https://appmedia.jp/priconne-redive";

module.exports = {
    name: 'rank',
    aliases: ['ranks', 'tier', 'tiers'],
    description: 'Display a character\'s rank/tier info.',
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
                            "name": "Arena Rank",
                            "value": char.overview.arenaRank,
                            "inline": true
                        },
                        {
                            "name": "Quest Rank",
                            "value": char.overview.questRank,
                            "inline": true
                        }
                    ]
                }
            });
        });
}