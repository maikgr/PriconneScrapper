const imgur = require('imgur-v2');
const db = require('./db_manager');

imgur.setClientId(process.env.IMGUR_ID);
imgur.setAPIUrl('https://api.imgur.com/3/');
imgur.setCredentials('fishthezombie', 'World.Execute(1mgur);', process.env.IMGUR_ID);

const albumId = 'HhE85PG';

async function updateCharsMirror() {
    let chars = await db.getAllChar();
    let i = 0;

    for (i; i < chars.length; ++i) {
        if (!chars[i].image_mirror) {
            console.log(`Updating ${chars[i].alias[0]}`)
            try {
                await updateImageUrl(chars[i]);
            } catch (error) {
                console.error(error);
            }
        }
    }
}

async function updateImageUrl(char) {
    try {
        let response = await imgur.uploadUrl(char.image, albumId);
        if (response.success) {
            await db.updateMirrorUrl(char, response.data.link);
            console.log(`Updated ${char.alias[0]}`);
        } else {
            console.log("Failed to update " + char.alias[0]);
        }
    } catch (error) {
        console.error(error);
    }
}