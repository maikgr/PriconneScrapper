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
    sortIndex: 7,
    execute(message, args) {
        showAllCommands(message);
    },
};

function showAllCommands(message) {
    const commands = message.client.commands;
    let commandFields = [];

    let i = 0;
    for (i; i < commands.size; ++i) {
        let command = commands.find(cmd => cmd.sortIndex === i);
        let aliases = command.aliases ? '(' + prefix + command.aliases.join(`, ${prefix}`) + ')' : null;
        commandFields.push({
            "name": `${prefix}${command.name} ${command.args ? command.usage : ''} ${aliases ? aliases : ''}`,
            "value": command.description
        });
    }

    return message.channel.send({
        "embed": {
            "title": `Commands`,
            "color": 51283,
            "fields": commandFields
        }
    })

}