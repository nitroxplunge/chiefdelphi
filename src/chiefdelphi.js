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
        this.emitter = new Emitter();
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

}

module.exports = ChiefDelphi;