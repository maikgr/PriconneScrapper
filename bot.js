const Discord = require('discord.js');
const fs = require('fs');
const db = require('./utilities/db_characters');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const prefix = process.env.DEFAULT_PREFIX;
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('.help', { type: "WATCHING" });
    db.initialize();
});

client.on('error', (err) => console.error(err));

client.on('message', (msg) => {
    if (!msg.content.startsWith(prefix)
        || msg.author.bot) return;

    const args = msg.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (command.ownerOnly && msg.author.id !== process.env.OWNER_ID) {
        return msg.reply(`you don't have permission to use this command.`);
    }

    if (command.args && !args.length) {
        let reply = "Incorrect command usage.";

        if (command.usage) {
            reply += `\nCommand syntax: \`${prefix}${commandName} ${command.usage}\``;
        }

        return msg.reply(reply);
    }

    try {
        command.execute(msg, args);
    } catch (error) {
        console.error(error);
        msg.reply("Error executing command!");
    };
});

client.login(process.env.BOT_TOKEN);