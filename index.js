const Discord = require('discord.js');
const config = require('./config.json');
const { Cat } = require('./utils/cat');
const { AwaitHandler } = require('./utils/await');
const mongoose = require('mongoose');
const client = new Discord.Client;
let globalCat;
const { GuildSettings } = require('./utils/guild');
const guildSettings = new GuildSettings;
const commandList = require('./commands/command');

// this is just a bunch of including the commands
// adding them dynamically is easier but SOMEONE keeps saying it's bad practice so
// this is on her
// this also makes the game easier as i can add the file for both collections needed

client.admin = new Discord.Collection();
const adminComms = commandList.admin;
for (const file of adminComms) {
	client.admin.set(file.settings.tag, file);
}

client.commands = new Discord.Collection();
const commandsComms = commandList.commands;
for (const file of commandsComms) {
	client.commands.set(file.settings.tag, file);
}

client.triggers = new Discord.Collection();
const triggerFiles = commandList.triggers;
for (const file of triggerFiles) {
	client.triggers.set(file.settings.tag, file);
}

client.special = new Discord.Collection();
const specialFiles = commandList.special;
for (const file of specialFiles) {
	client.special.set(file.settings.tag, file);
}

const awaitHandler = new AwaitHandler();

client.on('ready', () => {
	console.log(`I'm up, and i'm part of ${client.guilds.size} servers`);
	const db = config.db;
	mongoose.connect(db, { useNewUrlParser: true })
		.then(() => {
			console.log('connected Succesfully to Database');
		})
		.catch(console.error);
	globalCat = new Cat();
	console.log(globalCat.mood);
	setInterval(updateCat, 3600000);
});

function updateCat() {
	globalCat.updateMood();
	console.log(globalCat.mood);
}


client.on('message', async message => {
	// ignoring bot commands
	if (message.author.bot) return;
	// checking for server outages
	if (message.guild.available === false) return;
	let dice;
	// storing the results of if is mentioned, and the settings of the guild
	const mentioned = message.isMentioned(client.user);
	const thisGuildSettings = await guildSettings.getSettings(message.guild.id);

	// pre-verification admin/info ops
	if (mentioned === true) {
		for (const [key, value] of client.admin) {
			if (value.settings.regexp.test(message.content)) {
				if (value.settings.guildSettings) {
					value.execute(message, guildSettings);
				}
				else {
					value.execute(message, globalCat);
				}
				return;
			}
		}
	}
	if (thisGuildSettings.twitter === true) {
		if (commandList.twitter.settings.regexp.test(message.content)) {
			commandList.twitter.execute(message);
			return;
		}
	}
	if (mentioned === true) {
		for (const [key, value] of client.commands) {
			if (value.settings.regexp.test(message.content)) {
				// console.log('found ' + value.info.name);
				if (!value.settings.sim || value.settings.sim === true && thisGuildSettings.sim === true) {
					if (value.settings.await) {
						value.execute(message, awaitHandler);
						return;
					}
					else {
						value.execute(message, globalCat);
						return;
					}
				}
				return;
			}
		}
	}
	if (config.dev === true) {
		dice = 1;
	}
	else {
		dice = Math.floor((Math.random() * 100) + 1);
	}
	// reg rework done up to here
	for (const [key, value] of client.triggers) {
		if (value.settings.regexp.test(message.content) && dice <= value.settings.chance) {
			if (config.dev === true) {console.log('found ' + value.info.name);}
			if (value.settings.await) {
				if (awaitHandler.isPaused(message.channel.id) === false) {
					value.execute(message, awaitHandler);
					return;
				}
			}
			else {
				value.execute(message, globalCat);
			}
			return;
		}
	}
	if (mentioned === true) {
		if (thisGuildSettings.sim === true) {
			client.commands.get('pet_cat').execute(message, globalCat);
			return;
		}
		else {
			client.special.get('pet_cat').execute(message);
			return;
		}
	}
});

client.on('error', data => {
	console.error('Connection Error', data.message);
});

client.login(config.token)
	.then(console.log('Logged In'))
	.catch(console.error);

process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));