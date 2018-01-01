var https = require('https');
const convert = require('xml-js');
const EventEmitter = require('events');

var Post = require('../src/Post');

class Emitter extends EventEmitter {}

class ChiefDelphi {
    /**
     * @constructor
     */
    constructor() {
        this.url = "https://www.chiefdelphi.com/forums/cdspy.php?do=xml";
        this.events = new Emitter();
        this.eventSetup();
    }

    async getRawForumData() {
        var url = this.url;
        var xml = "";

        return new Promise(function(resolve, reject) {
            https.get(url, function(res) {

                if (res.statusCode >= 200 && res.statusCode < 400) {
                    res.on('data', function(data) { xml += data.toString() });
                    res.on('end', function() { resolve(xml) });
                }

            });
        });
    }

    async getForumData() {
        var data = await this.getRawForumData();
        return JSON.parse(convert.xml2json(data, {compact: true, spaces: 4}));
    }

    async eventToObject(event) {
        if (event.what._text === "New Post" || event.what._text === "New Thread") {
            var post = new Post(event);
            return(await post.json());
        } else {
            return JSON.parse("{\"err\": \"Unknown data type\"}")
        }
    }

    async getLatestPost() {
        var data = await this.getForumData();
        var latestEvent = data.events.event[0];
        return await this.eventToObject(latestEvent);
    }

    async checkForNewPost() {
        var data = await this.getForumData();
        if (data.events.event[0].postid._text != this.latestpostid && this.latestpostid != undefined) {
            this.events.emit('post', await this.getLatestPost());
        }
        this.latestpostid = data.events.event[0].postid._text;
    }

    eventSetup() {
        var cd = this;
        setInterval(function() { 
            cd.checkForNewPost();
        }, 1000);
        
    }

    

}

module.exports = ChiefDelphi;