const Discord = require('discord.js');
const fs = require('fs');

const client = new Discord.Client();
const cooldowns = new Discord.Collection();
client.commands = new Discord.Collection();

const prefix = ".";
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('Reppi', { type: "WATCHING" });
});

client.on('message', (msg) => {
    if (!msg.content.startsWith(prefix)
        || msg.author.bot) return;

    const args = msg.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (command.args && !args.length) {
        let reply = "Incorrect command usage.";

        if (command.usage) {
            reply += `\nCommand syntax: \`${prefix}${commandName} ${command.usage}\``;
        }

        return msg.reply(reply);
    }

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }
    
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;
    const cooldownKey = command.globalCooldown ? "global" : message.author.id;
    
    if (!timestamps.has(cooldownKey)) {
        timestamps.set(cooldownKey, now);
        setTimeout(() => timestamps.delete(cooldownKey), cooldownAmount);
    }
    else {
        const expirationTime = timestamps.get(cooldownKey) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }

        timestamps.set(cooldownKey, now);
        setTimeout(() => timestamps.delete(cooldownKey), cooldownAmount);
    }

    try {
        command.execute(msg, args);
    } catch (error) {
        console.error(error);
        msg.reply("Error executing command!");
    };
});

client.login(process.env.BOT_TOKEN);