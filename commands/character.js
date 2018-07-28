const db = require('../utilities/db_characters');

const appmediaUrl = "https://appmedia.jp/priconne-redive";
module.exports = {
    name: 'character',
    aliases: ['char', 'info'],
    description: 'Display a character\'s full info.',
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
                        "text": `ID ${char.char_id} - Information taken from ${appmediaUrl}`
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