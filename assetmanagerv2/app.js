try {require('@dynatrace/oneagent')(); } catch(err) {     console.log(err.toString()); } 
var path = require('path');
express = require('express');
var bodyParser =require('body-parser');
var asset =require('./asset.js');	
var app = express();
//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use('/searchpn/:pn', asset.searchByPartNumber)
app.use('/searchsn/:sn', asset.searchBySerialNumber)
app.use('/gethistory/:pn', asset.getHistorybyPartNumber)
app.use('/add', asset.addToBlockChain)

app.use('/ui5', express.static(path.join(__dirname, 'webapp')));

app.listen(process.env.PORT || 3000, function () {
	console.log('Personlist app is listening on port 3000!');
});