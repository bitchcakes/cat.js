// imports
const strings = require('../strings/cat.json');
const { Guild } = require('../models/guild');
// internals
/**
 * Creates a new Cat
 * @constructor
 * @author: Ramona Prower
 * @this {Cat}
 */
class Cat {
	constructor() {
		this.mood = Math.floor(Math.random() * 10);
        /**
         * Updates to a new Random Mood
         * @this {Cat}
         */
		this.updateMood = function() {
			this.mood = Math.floor(Math.random() * 10);
		};
        /**
         * Gets the current mood
         * @this {Cat}
         * @returns {string} Emoji of mood
         */
		this.getMood = function() {
			if (this.mood <= 2) {return strings.meow.sad[Math.floor(Math.random() * strings.meow.sad.length)];}
			else if (this.mood <= 6) {return strings.meow.neutral[Math.floor(Math.random() * strings.meow.neutral.length)];}
			else {return strings.meow.happy[Math.floor(Math.random() * strings.meow.happy.length)];}
		};
        /**
         * Gets reaction to Pets
         * @this {Cat}
         * @param {number} userMood the cat's mood of the user
         * @returns {string} The mood, as an emoji string
         */
		this.getPetReaction = function(userMood) {
			const dice = Math.floor((Math.random() * 100) + 1);
			let overallMood = userMood;
			const happyStr = strings.pet.happy[Math.floor(Math.random() * strings.pet.happy.length)];
			const sadStr = strings.pet.sad[Math.floor(Math.random() * strings.pet.sad.length)];
			const angryStr = strings.pet.angry[Math.floor(Math.random() * strings.pet.angry.length)];
			if (this.mood >= 2) {
				overallMood--;
			}
			if (this.mood > 6) {
				overallMood++;
			}
			if (overallMood <= 0) {
				return angryStr;
			}
			if (overallMood <= 3) {
				if (dice <= 25) {
					return angryStr;
				}
				else if (dice <= 66) {
					return sadStr;
				}
				else {
					return happyStr;
				}
			}
			if (overallMood <= 6) {
				if (dice <= 66) {
					return sadStr;
				}
				else {
					return happyStr;
				}
			}
			else {
				return happyStr;
			}
		};
        /**
         * Gets reaction to user meowing
         * @this {Cat}
         * @param {number} userMood the cat's mood of the user
         * @returns {string} The mood, as an emoji string
         */
		this.getMeowReaction = function(userMood) {
			const dice = Math.floor((Math.random() * 100) + 1);
			const happyStr = strings.meow.happy[Math.floor(Math.random() * strings.meow.happy.length)];
			const neutralStr = strings.meow.neutral[Math.floor(Math.random() * strings.meow.neutral.length)];
			const sadStr = strings.meow.sad[Math.floor(Math.random() * strings.meow.sad.length)];
			let overallMood = userMood;
			if (this.mood >= 2) {
				overallMood--;
			}
			if (this.mood > 6) {
				overallMood++;
			}
			if (overallMood <= 0) {
				return sadStr;
			}
			if (overallMood <= 3) {
				if (dice <= 25) {
					return sadStr;
				}
				else if (dice <= 66) {
					return neutralStr;
				}
				else {
					return happyStr;
				}
			}
			if (overallMood <= 6) {
				if (dice <= 66) {
					return neutralStr;
				}
				else {
					return happyStr;
				}
			}
			else {
				return happyStr;
			}
		};
	}
}
/**
 * Creates a new Guild Cat
 * @author: Ramona Prower
 * @this {GuildCat}
 * @extends {Cat}
 */
class GuildCat extends Cat {
	constructor(search) {
		super();
		this.hunger = search.hunger;
		this.guild = search;
	}
	/**
	 * Creates/retrieves a new Guild cat (needs to be constructed this way because of async DB lookups)
	 * @constructor
	 * @param {guildID} guildId the ID of the guild that the cat lives in
	 */
	static async create(guildId) {
		let search = await Guild.checkGuild(guildId);
		if (!search) {
			const guild = new Guild({
				snowflake: guildId,
			});
			await guild.save();
			search = await Guild.checkGuild(guildId);
		}
		await search.updateHunger();
		return new GuildCat(search);
	}
	/**
	 * Gets the Hunger of the cat after construction
	 * @returns {string} the mood, as an emoji string
	 */
	getHunger() {
		function rand(i) {
			return Math.floor(Math.random() * i);
		}
		const hungryArr = strings.hunger.yes;
		const notHungryArr = strings.hunger.no;
		const hungryStr = hungryArr[rand(hungryArr.length)];
		const notHungryStr = notHungryArr[rand(notHungryArr.length)];
		if (this.hunger <= 4) return hungryStr;
		else return notHungryStr;
	}
	/**
	 * Feeds the cat
	 * @returns {string} the mood, as an emoji string
	 */
	feed() {
		function rand(i) {
			return Math.floor(Math.random() * i);
		}
		const notHungryArr = strings.hunger.no;
		const notHungryStr = notHungryArr[rand(notHungryArr.length)];
		const fedArr = strings.fed;
		const fedStr = fedArr[rand(fedArr.length)];
		if (this.hunger >= 4) {
			return notHungryStr;
		}
		else {
			this.guild.feed();
			return fedStr;
		}
	}
}
// exports
module.exports.Cat = Cat;
module.exports.GuildCat = GuildCat;
