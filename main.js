const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const wanakana = require('wanakana');
const fs = require('fs');
const app = express();

const position = {
    '後衛': 'Rearguard',
    '中衛': 'Midguard',
    '前衛': 'Vanguard'
};

const attribute = {
    '物理': 'Physical',
    '魔法': 'Magical'
};

app.get('/', (req, res) => res.send('Welcome!'));

app.get('/charlist', function (req, res) {
    let url = 'https://appmedia.jp/priconne-redive/1058526';

    request(url, function (error, response, html) {
        if (error) throw error;
        else {
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
                    let id = 100 + i;
                    charList.push({
                        'id': id,
                        'name': name,
                        'alias': wanakana.toRomaji(name),
                        'image': img,
                        'details': link
                    });
                }
            }            
            fs.writeFile('charlist.json', JSON.stringify(charList), 'utf8', function(err) {
                if(err) throw error;
                res.send(charList);
            })
        }
    });
});

app.get('/chardetails', function(req, res) {
    fs.readFile('charlist.json', function (err, data) {
        if(err) throw error;
        
        let i = 16;
        let charList = JSON.parse(data);
        let char = charList[i];
        let charUrl = char.details;

        request(charUrl, function(error, response, html) {
            if(error) throw error;

            let $ = cheerio.load(html);
            let postContent = $('.post-content')[0];
            let tables = $(postContent).find('table');
            let overviewTable = $(tables[0]).find('td');
            
            let overview = {
                id: char.id,
                rank: $(overviewTable[0]).find('img').length,
                type: parseType($(overviewTable[1]).text()),
                questRank: $(overviewTable[2]).text(),
                arenaRank: $(overviewTable[3]).text()
            }

            let statusTable = $(tables[2]).find('td');

            let status = {
                id: char.id,
                hp: $(statusTable[0]).text(),
                patk: $(statusTable[1]).text(),
                matk: $(statusTable[2]).text(),
                pdef: $(statusTable[3]).text(),
                mdef: $(statusTable[4]).text()
            }

            let unionSkillTable = $(tables[4]).find('td');
            let skillOneTable = $(tables[5]).find('td');
            let skillTwoTable = $(tables[6]).find('td');
            let passiveSkillTable = $(tables[7]).find('td');
            let skills = [];

            skills.push({
                id: char.id,
                type: 'union',
                description: $(unionSkillTable[0]).text().replace('【説明】', '').trimLeft(),
                effect: $(unionSkillTable[1]).text().replace('【効果】', '').trimLeft()
            });

            skills.push({
                id: char.id,
                type: 'active',
                description: $(skillOneTable[0]).text().replace('【説明】', '').trimLeft(),
                effect: $(skillOneTable[1]).text().replace('【効果】', '').trimLeft()
            })
            
            skills.push({
                id: char.id,
                type: 'active',
                description: $(skillTwoTable[0]).text().replace('【説明】', '').trimLeft(),
                effect: $(skillTwoTable[1]).text().replace('【効果】', '').trimLeft()
            })

            skills.push({
                id: char.id,
                type: 'passive',
                description: $(passiveSkillTable[0]).text().replace('【説明】', '').trimLeft(),
                effect: $(passiveSkillTable[1]).text().replace('【EX+(才能開花★5で強化)】', '').replace('▶︎', '').replace('EXスキル+まとめはこちら', '').trimLeft()
            })

            res.send({
                overview: overview,
                status: status,
                skills: skills
            });
        });
    });
});

function parseType(text) {
    let type = text.split('・');
    
    return position[type[0]] + ' - ' + attribute[type[1]];
}

app.listen(8081, () => console.log('Listening to port 8081'));