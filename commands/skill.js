const db = require('../utilities/db_characters');

const appmediaUrl = "https://appmedia.jp/priconne-redive";

module.exports = {
    name: 'skill',
    aliases: ['skills', 'ability', 'abilities'],
    description: 'Display a character\'s skills info.',
    args: true,
    ownerOnly: false,
    cooldown: 3,
    globalCooldown: false,
    sortIndex: 1,
    usage: '[character name]',
    execute(message, args) {
        return findCharacter(message, args);
    }
};


function findCharacter(message, args) {
    db.getChar(args[0])
        .then(function (char) {
            if (!char) return message.channel.send('Character not found.');
            let skills = char.skills;
            if(char.skills_en.length > 0) {
                skills = char.skills_en;
            }

            const unionSkill = skills.find(s => s.type === 'union');
            const passiveSkill = skills.find(s => s.type === 'passive');
            const activeSkills = skills.filter(s => s.type === 'active');
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