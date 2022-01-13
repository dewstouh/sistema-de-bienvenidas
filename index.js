const Discord = require('discord.js');
const config = require('./config/config.json');
const Enmap = require('enmap');

const client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
    ]
})

client.login(config.token)

client.on("ready", () => {
    console.log(`Conectado como ${client.user.tag}`)
});

client.setups = new Enmap({
    name: "setups",
    dataDir: "./databases"
})

client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild || !message.channel) return;
    client.setups.ensure(message.guild.id, {
        welcomechannel: "",
        welcomemessage: "",
    });
    const args = message.content.slice(config.prefix.length).trim().split(" ")
    const command = args.shift()?.toLowerCase();

    if (command == "ping") {
        return message.reply(`El ping del bot es de \`${client.ws.ping}ms\``)
    }

    if (command == "setup-welcome") {
        const channel = message.guild.channels.cache.get(args[0]) || message.mentions.channels.first();
        if (!channel) return message.reply(`El CANAL que has mencionado NO EXISTE!\n**Uso:** \`${config.prefix}setup-welcome <#CANAL O ID> <MENSAJE DE BIENVENIDA>\``);
        if (!args.slice(1).join(" ")) return message.reply(`No has especificado el MENSAJE DE BIENVENIDA!\n**Uso:** \`${config.prefix}setup-welcome <#CANAL O ID> <MENSAJE DE BIENVENIDA>\``);
        let obj = {
            welcomechannel: channel.id,
            welcomemessage: args.slice(1).join(" "),

        }
        client.setups.set(message.guild.id, obj)
        return message.reply(`✅ Se ha configurado correctamente el canal de bienvenida\n**Canal:** ${channel}\n**Mensaje de Bienvenida:** ${args.slice(1).join(" ")}`)
    }
})

client.on("guildMemberAdd", async (member) => {
    client.setups.ensure(member.guild.id, {
        welcomechannel: "",
        welcomemessage: "",
    });

    try {
        const data = client.setups.get(member.guild.id);
        if(data) {
            if(member.guild.channels.cache.get(data.welcomechannel)){
                const channel = member.guild.channels.cache.get(data.welcomechannel)
                const attachment = new Discord.MessageAttachment('https://i.imgur.com/wGO8KCd.png')
                channel.send({content: data.welcomemessage.replace(/{usuario}/, member), files: [attachment]})
            }
        }
    } catch (e){console.log(e)}
})