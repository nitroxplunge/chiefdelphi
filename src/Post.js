var https = require('https');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

class Post {
    /**
     * @constructor
     */
    constructor(data) {
        this.data = data;
    }

    async json() {
        var type = "Thread";
        if (this.data.what._text === "New Post") { type = "Reply"}
        var data = {
            type: type,
            postid: this.data.postid._text,
            title: this.data.title._text,
            text: await this.getText(),
            poster: this.data.poster._text,
            time: this.data.when._text,
            parentthread: this.data.threadid._text,
            subforum: this.data.forumname._text
        }
        return data;
    }

    getText() {
        var id = this.data.postid._text;
        var url = "https://www.chiefdelphi.com/forums/showthread.php?p=" + id;
        var html = "";
        return new Promise(function(resolve, reject) {

            https.get(url, function(res) {
                if (res.statusCode >= 200 && res.statusCode < 400) {
                    res.on('data', function(data) { html += data });
                    res.on('end', function() {
                        var dom = new JSDOM(html.toString());
                        resolve(dom.window.document.querySelector("#post_message_" + id).textContent);
                    });
                }
            });
        });
    }
}

module.exports = Post;