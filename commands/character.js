const db = require('../db_manager');
const appmediaUrl = "https://appmedia.jp/priconne-redive";
module.exports = {
    name: 'character',
    aliases: ['char', 'find', 'info'],
    description: 'Search and display character info.',
    args: true,
    cooldown: 3,
    globalCooldown: false,
    usage: '<character name in alphabet>',
    execute(message, args) {
        return findCharacter(message, args);
    }
};

function findCharacter(message, args) {
    if (args.length > 1) {
        message.channel.send('Sorry, multiple character search is not supported yet.');
    } else {
        db.getChar(args[0])
            .then(function (chars) {
                if (chars.length == 0) return message.channel.send('Character not found.');

                const char = chars[0];
                const unionSkill = char.skills.find(s => s.type === 'union');
                const passiveSkill = char.skills.find(s => s.type === 'passive');
                const activeSkills = char.skills.filter(s => s.type === 'active');
                return message.channel.send({
                    "embed": {
                        "url": `${appmediaUrl}/${char.char_id}`,
                        "title": `${char.overview.rank}★ ${char.alias[0]} (${char.name})`,
                        "color": 16737945,
                        "description": char.overview.type,
                        "footer": {
                            "text": `Information taken from ${appmediaUrl}`
                        },
                        "thumbnail": {
                            "url": char.image
                        },
                        "fields": [
                            {
                                "name": "Quest Rank",
                                "value": `${char.overview.questRank}`,
                                "inline": true
                            },
                            {
                                "name": "Arena Rank",
                                "value": `${char.overview.arenaRank}`,
                                "inline": true
                            },
                            {
                                "name": "Status",
                                "value": `Max HP: ${char.status.hp}\nP. Atk: ${char.status.patk}\nP. Def: ${char.status.pdef}\nM. Atk: ${char.status.matk}\nM. Def: ${char.status.mdef}`
                            },
                            {
                                "name": `${unionSkill.name} (Union Burst)`,
                                "value": unionSkill.description
                            },
                            {
                                "name": `${activeSkills[0].name} (Active)`,
                                "value": activeSkills[0].description
                            },
                            {
                                "name": `${activeSkills[1].name} (Active)`,
                                "value": activeSkills[1].description
                            },
                            {
                                "name": `${passiveSkill.name} (Passive)`,
                                "value": passiveSkill.description
                            }
                        ]
                    }
                });
            });
    }
}