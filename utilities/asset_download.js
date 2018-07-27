const fs = require('fs');
const request = require('request-promise-native');
const sleep = require('system-sleep');

const db = require('./db_manager');
const directory = './assets/characters/';

db.getAllChar()
    .then((chars) => {
        let i = 0;
        for (i; i < chars.length; ++i) {
            let url = chars[i].image_mirror;
            let ext = url.split('.').pop();
            let filepath = directory + chars[i].char_id + '.' + ext;

            request(url)
                .on('error', (err) => console.error(err))
                .on('close', () => console.log(`Downloaded ${chars[i].alias[0]} image.`))
                .pipe(fs.createWriteStream(filepath));

            sleep(1500);
        }
    });
