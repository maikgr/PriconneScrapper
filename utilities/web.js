const express = require('express');
const request = require('request');
const fs = require('fs');
const sleep = require('system-sleep');
const appmedia = require('./appmedia_parser');
const db = require('./db_characters');
const app = express();
const mainPageUrl = 'https://appmedia.jp/priconne-redive/1058526';

app.get('/', (req, res) => {
    res.send('Welcome!');
});

app.get('/charlist', function (req, res) {
    request(mainPageUrl, function (error, response, html) {
        if (error) throw error;
        charList = appmedia.charList(html);
        fs.writeFile('charlist.json', JSON.stringify(charList), 'utf8', function (err) {
            if (err) throw error;
            res.send(charList);
        });
    });
});

app.get('/update', function (req, res) {
    request(mainPageUrl, function (error, response, html) {
        if (error) throw error;
        db.getAllChar()
            .then(function (currentCharList) {
                let charList = appmedia.charList(html);
                let currentCharIds = currentCharList.map(x => x.char_id);
                let newCharList = charList.filter(function (char) {
                    return !currentCharIds.includes(char.char_id);
                });

                if (newCharList.length == 0) {
                    res.send("Nothing to update.");
                } else {
                    addNewChars(newCharList);
                    let charNames = newCharList.map(x => x.alias);
                    res.send("Added " + charNames.join(", ") + ".");
                }
            });

    });
});

app.get('/char', function (req, res) {
    let name = req.query.name;
    if (name.length > 1) {
        db.getChar(name)
            .then(function (result) {
                res.send(result);
            });
    } else {
        res.send("Name too short!");
    }
});

app.listen(8081, () => console.log('Listening to port 8081'));

function getRandomTime(fromSeconds, toSeconds) {
    let from = fromSeconds * 1000;
    let to = toSeconds * 1000;
    return (Math.random(to - from) + from);
}

function addNewChars(charList) {
    let i = 0;
    for (i; i < charList.length; ++i) {
        let char = charList[i];
        let charUrl = char.details;

        request(charUrl, function (error, response, html) {
            if (error) throw error;

            let character = appmedia.charDetails(char, html);
            db.addChar(character);
        });
        let time = getRandomTime(10, 20);
        console.log("Sleeping for " + time + " ms");
        sleep(time);
    }
}