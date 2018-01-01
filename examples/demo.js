var ChiefDelphi = require("../");
var cd = new ChiefDelphi();

var main = async function() {
    var result = await cd.getLatestPost();
    console.log(result);
}

main();

cd.events.on('post', function(data) {
    console.log(data);
});