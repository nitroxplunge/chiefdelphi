var ChiefDelphi = require("../");
var cd = new ChiefDelphi();

var main = async function() {
    var result = await cd.getLatestPost();
    console.log(result);
}

main();