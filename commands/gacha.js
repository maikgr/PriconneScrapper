const Jimp = require('jimp');
const seedRandom = require('seedrandom');

const dbChar = require('../utilities/db_characters');
const dbGacha = require('../utilities/db_gacha');
const assetPath = './assets/characters';
const gachaBg = './assets/gachabg.png';

module.exports = {
    name: 'standardgacha',
    aliases: ['standard', 'sgacha', 'gacha'],
    description: 'Simulate standard gacha.',
    args: false,
    ownerOnly: false,
    cooldown: 3,
    globalCooldown: false,
    usage: '',
    sortIndex: 4,
    execute(message, args) {
        return startGacha(message);
    }
};

async function startGacha(message) {
    const gachaResult = await getGachaResult();
    compositeImages(gachaResult).then(image => {
        image.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
            if (err) console.error(err);
            message.reply('', { files: [buffer] });
        });
    });
}

async function getGachaResult() {
    const gachaInfo = await dbGacha.getGachaInfo();
    const chars = await dbChar.getAllChar();
    const rank1List = chars.filter(char => gachaInfo.rank1.includes(char.name));
    const rank2List = chars.filter(char => gachaInfo.rank2.includes(char.name));
    const rank3List = chars.filter(char => gachaInfo.rank3.includes(char.name));
    const rank2DrawRate = gachaInfo.rank2_rate;
    const rank3DrawRate = gachaInfo.rank3_rate;

    let i = 0;
    let gachaResult = [];
    for (i; i < 10; ++i) {
        let gachaChar = null;

        gachaChar = drawGacha(rank3DrawRate, rank3List);
        if (!gachaChar) gachaChar = drawGacha(rank2DrawRate, rank2List);

        if (i < 9 && !gachaChar) {
            gachaChar = getRandomChar(rank1List);
        } else if (!gachaChar) {
            gachaChar = getRandomChar(rank2List);
        }

        gachaResult.push(loadLocalImage(gachaChar.char_id));
    }

    return gachaResult;
}

function drawGacha(successRate, drawList) {
    if (getRandomNumber() <= successRate) {
        return getRandomChar(drawList);
    }
    return null;
}

function loadLocalImage(charId) {
    return Jimp.read(`${assetPath}/${charId}.jpg`);
}

function compositeImages(charImagePromises) {
    charImagePromises.push(Jimp.read(gachaBg));
    return Promise.all(charImagePromises)
        .then((images) => {
            let bgIndex = charImagePromises.length - 1;
            let bg = images[bgIndex];
            const colCount = 5;
            const rowCount = 2;
            const xStart = 250, yStart = 100;
            const xStep = 130, yStep = 130;

            let assetIndex = 0;
            let xPos = xStart, yPos = yStart;
            for (yPos; yPos <= (rowCount + 1) * yStep; yPos += yStep) {
                xPos = xStart;
                for (xPos; xPos <= (colCount + 1) * xStep; xPos += xStep) {
                    if (assetIndex == bgIndex) {
                        break;
                    }
                    let charAsset = images[assetIndex++].resize(100, 100);
                    bg.composite(charAsset, xPos, yPos);
                }
            }

            return bg;
        });
}

function getRandomChar(list) {
    let randomIndex = getRandomIndex(list.length);
    return list[randomIndex];
}

function getRandomNumber() {
    Math.seedrandom();
    return Math.random();
}

function getRandomIndex(arrayLength) {
    Math.seedrandom();
    return Math.floor(Math.random() * (arrayLength));
}

getGachaResult();