const db = require('../utilities/db_characters');

const appmediaUrl = "https://appmedia.jp/priconne-redive";

module.exports = {
    name: 'skill',
    aliases: ['skills'],
    description: 'Display a character\'s skills info.',
    args: true,
    ownerOnly: false,
    cooldown: 3,
    globalCooldown: false,
    sortIndex: 1,
    usage: '[character name]'
};


module.exports.execute = async function (message, args) {
    const characters = db.characters();
    const query = args[0];
    const char = characters.find(c => {
        let i = 0;
        for (i; i < c.alias.length; ++i) {
            if (c.alias[i].toUpperCase() === query.toUpperCase()) {
                return true;
            }
        }
        return false;
    });
    
    if (!char) {
        return message.channel.send('Character not found.');
    }
    
    const unionSkill = char.skills.find(s => s.type === 'union');
    const passiveSkill = char.skills.find(s => s.type === 'passive');
    const activeSkills = char.skills.filter(s => s.type === 'active');
    let embed = {
        "embed": {
            "url": `${appmediaUrl}/${char.char_id}`,
            "title": `${char.overview.rank}★ ${char.alias[0]} (${char.name})`,
            "color": 16737945,
            "description": char.overview.type,
            "footer": {
                "text": `ID ${char.char_id} - Information taken from ${appmediaUrl}`
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
    };

    if (char.image.src) {
        embed.embed.thumbnail = {
            "url": char.image.src
        };
    };

    return message.channel.send(embed);
}