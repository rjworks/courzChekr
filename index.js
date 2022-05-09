require('dotenv').config();
const cron = require('cron');
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require('fs');
const {Client, Intents} = require('discord.js');
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});

let courses = [];
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({activities: [{name: 'eEe', type: 'WATCHING'}]});

    let rawdata = fs.readFileSync('courses.json');
    courses = JSON.parse(rawdata);
    console.log(courses.length)
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
        msg.reply('Hi there');
        return;
    }
    if(msg.content.startsWith(process.env.PREFIX)) {
        const args = msg.content.slice(process.env.PREFIX.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        switch(command) {
            case "add":
                msg.reply(addCourse(args[0]));
                break;
            case "remove":
                if(args[0] === undefined) {
                    return msg.reply("Enter course ID. Example: !remove 2 \n\nType !checklist to check course ID")
                }
                msg.reply(removeCourse(parseInt(args[0])));
                break;
            case "checklist":
                let checklist = "";
                if(courses.length === 0) return msg.reply("The checklist is empty.");
                for(const course of courses) {
                    checklist += `Checklist: \n\n[ID: ${course.id}] ` + course.course + " - " + course.url;
                }
                msg.reply(checklist);
                break;
        }
    }
});

const addCourse = (courseUrl) => {
    for(const course of courses) {
        if(course.url === courseUrl) {
            return 'This course is already in the checklist!';
        }
    }

    let arr = courseUrl.split('=');
    let course = arr[8];
    let code = arr[6].split('&')[0];
    let section = arr[7].split('&')[0];

    course = `${course} ${code} ${section}`;
    courses.push({
        "id": courses.length + 1,
        "course": course,
        "url": courseUrl
    });

    saveCourses();

    return `Successfully added ${course}`;
}

const removeCourse = (courseId) => {
    console.log(courseId);
    for(const course of courses) {
        if(course.id === courseId) {
            courses = courses.filter((el) => el.id !== courseId);
            saveCourses();
            return `Successfully removed ${course.course}`;
        }
    }
    return "The given course ID could not be found.";
}
const saveCourses = () => {
    if(courses.length === 0) return;
    fs.writeFile("courses.json", JSON.stringify(courses), function(err) {
            if(err) throw err;
        }
    );
    // return 'Successfully saved courses.'
}

client.login(process.env.TOKEN);