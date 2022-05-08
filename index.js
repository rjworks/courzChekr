require('dotenv').config()
const cron = require('cron');
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require('fs');
const {Client, Intents} = require('discord.js');
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});

let urls = [];
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({activities: [{name: 'eEe', type: 'WATCHING'}]});

    let rawdata = fs.readFileSync('urls.json');
    urls = JSON.parse(rawdata);
    console.log(urls.length)
});

async function scrape() {
    try {

    } catch(err) {
        console.error(err);
    }
}

let scheduledCheck = new cron.CronJob('*/5 * * * *', () => {
    // */5 * * * *
    // This runs every 5th minute // https://crontab.guru/every-5-minutes
    scrape();
}, null, true, 'America/Vancouver');

client.on('messageCreate', msg => {
    if(msg.content === `<@!${client.user.id}>`) {
        msg.reply('Hi there')
        return;
    }
    if(msg.content.startsWith(process.env.PREFIX)) {
        const args = msg.content.slice(process.env.PREFIX.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        switch(command) {
            case "add":
                msg.reply(saveUrls(args[0]));
                break;
            case "checklist":
                let checklist = "";
                for(const course of urls) {
                    checklist += `Checklist: \n\n[ID: ${course.id}] ` + course.course + " - " + course.url
                }
                msg.reply(checklist)
                break;
        }
    }
});

const saveUrls = (newUrl) => {
    for(const url of urls) {
        if(url.url === newUrl) {
            return 'This course is already in the checklist!';
        }
    }
    let arr = newUrl.split('=');
    let course = arr[8];
    let code = arr[6].split('&')[0];
    let section = arr[7].split('&')[0];

    urls.push({
        "id": urls.length + 1,
        "course": `${course} ${code} ${section}`,
        "url": newUrl
    });

    console.log(urls)
    fs.writeFile("urls.json", JSON.stringify(urls), function(err) {
            if(err) throw err;
        }
    );
    return 'Success :]'
}

client.login(process.env.TOKEN);