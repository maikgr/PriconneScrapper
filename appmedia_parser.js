const cheerio = require('cheerio');
const wanakana = require('wanakana');

const position = {
    '後衛': 'Rearguard',
    '中衛': 'Midguard',
    '前衛': 'Vanguard'
};
const attribute = {
    '物理': 'Physical',
    '魔法': 'Magical'
};

module.exports = {
    charList: parseCharlistPage,
    charDetails: parseCharDetailsPage
}

function parseCharlistPage(html) {
    let $ = cheerio.load(html);
    let postContent = $('.post-content')[0];
    let table = $(postContent).find('table')[1];
    let list = $(table).find('td');
    let charList = [];

    let i = 0;
    for (i; i < list.length; ++i) {
        if ($(list[i]).find('a').length > 0) {
            let value = list[i];
            let link = $(value).find('a').attr('href');
            let img = $(value).find('img').attr('src');
            let name = $(value).text();
            charList.push({
                'char_id': link.replace('https://appmedia.jp/priconne-redive/', ''),
                'name': name,
                'alias': capitalizeFirstLetter(wanakana.toRomaji(name)),
                'image': img,
                'details': link
            });
        }
    }

    return charList;
}

function parseCharDetailsPage(char, html) {
    let $ = cheerio.load(html);
    let postContent = $('.post-content')[0];
    let tables = $(postContent).find('table');
    let overviewTable = $(tables[0]).find('td');

    let overview = {
        rank: $(overviewTable[0]).find('img').length,
        type: parseType($(overviewTable[1]).text()),
        questRank: $(overviewTable[2]).text(),
        arenaRank: $(overviewTable[3]).text()
    }

    let statusTable = $(tables[2]).find('td');

    let status = {
        hp: $(statusTable[0]).text().replace('※調査中', '???'),
        patk: $(statusTable[1]).text().replace('※調査中', '???'),
        matk: $(statusTable[2]).text().replace('※調査中', '???'),
        pdef: $(statusTable[3]).text().replace('※調査中', '???'),
        mdef: $(statusTable[4]).text().replace('※調査中', '???')
    }

    let skillNames = $(postContent).find('h4');
    let unionSkillTable = $(tables[4]).find('td');
    let skillOneTable = $(tables[5]).find('td');
    let skillTwoTable = $(tables[6]).find('td');
    let passiveSkillTable = $(tables[7]).find('td');
    let skills = [];

    skills.push({
        name: $(skillNames[0]).text(),
        type: 'union',
        description: $(unionSkillTable[0]).text().replace('【説明】', '').trimLeft(),
        effect: $(unionSkillTable[1]).text().replace('【効果】', '').trimLeft()
    });

    skills.push({
        name: $(skillNames[1]).text(),
        type: 'active',
        description: $(skillOneTable[0]).text().replace('【説明】', '').trimLeft(),
        effect: $(skillOneTable[1]).text().replace('【効果】', '').trimLeft()
    })

    skills.push({
        name: $(skillNames[2]).text(),
        type: 'active',
        description: $(skillTwoTable[0]).text().replace('【説明】', '').trimLeft(),
        effect: $(skillTwoTable[1]).text().replace('【効果】', '').trimLeft()
    })

    skills.push({
        name: $(skillNames[3]).text(),
        type: 'passive',
        description: $(passiveSkillTable[0]).text().replace('【説明】', '').trimLeft(),
        effect: $(passiveSkillTable[1]).text().replace('【EX+(才能開花★5で強化)】', '').replace('▶︎', '').replace('EXスキル+まとめはこちら', '').trimLeft()
    })

    let character = {
        char_id: char.char_id,
        name: char.name,
        alias: char.alias,
        image: char.image,
        overview: overview,
        status: status,
        skills: skills
    }

    return character;
}

function parseType(text) {
    let type = text.split('・');
    return position[type[0]] + ' - ' + attribute[type[1]];
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}