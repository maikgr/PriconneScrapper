const prefix = process.env.DEFAULT_PREFIX;

module.exports = {
    name: 'help',
    description: 'List all of available commands.',
    aliases: ['commands'],
    usage: '',
    cooldown: 5,
    globalCooldown: false,
    args: false,
    ownerOnly: false,
    sortIndex: 4
};

module.exports.execute = function (message, args) {
    const commands = message.client.commands;
    let commandFields = [];

    let i = 0;
    for (i; i < commands.size; ++i) {
        let command = commands.find(cmd => cmd.sortIndex === i);
        if (command) {
            let aliases = command.aliases.length > 0 ? '(' + prefix + command.aliases.join(`, ${prefix}`) + ')' : null;
            commandFields.push({
                "name": `${prefix}${command.name} ${command.args ? command.usage : ''} ${aliases ? aliases : ''}`,
                "value": command.description
            });
        }
    }

    return message.channel.send({
        "embed": {
            "title": `Commands`,
            "color": 51283,
            "fields": commandFields
        }
    })

}