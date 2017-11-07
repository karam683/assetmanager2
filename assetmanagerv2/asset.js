request=require('request');

var env =require('./env.js');
var chaincode ="f67df0ad36d3450304f775f014b1b94c";

module.exports = {

searchByPartNumber: function (req,res)
{
	var partnumber=	req.params.pn;
	console.log('partnumber:', partnumber);
	var messageObj = 
				{
						"uri": env.serviceUrl + '/query',
						"json": true,
						"headers": {apikey: env.serviceApiKey	},
						"body":  {
							"chaincodeId": chaincode,
							"fcn": "searchpn",
							"args": [partnumber]
						}
				}
				
				 	request.post(messageObj, function (err, resp, body){
					console.log('Call to BC:::RESPONSE:', resp && resp.statusCode);
					console.log('Call to BC:::ERR:', err);
					console.log('Call to BC:::Body:', body);
					if(err==null)
						{
						res.send(body);
						}
					else
						{
						res.send(resp.statusCode+" Error:"+err);
						}
					
				});
				
},
searchBySerialNumber: function (req,res)
{
	var serailnumber=	req.params.sn;
	var messageObj = 
				{
						"uri": env.serviceUrl + '/query',
						"json": true,
						"headers": {apikey: env.serviceApiKey	},
						"body":  {
							"chaincodeId": chaincode,
							"fcn": "searchsn",
							"args": [serailnumber]
						}
				}
				
				 	request.post(messageObj, function (err, resp, body){
					console.log('Call to BC:::RESPONSE:', resp && resp.statusCode);
					console.log('Call to BC:::ERR:', err);
					console.log('Call to BC:::Body:', body);
					if(err==null)
						{
						res.send(body);
						}
					else
						{
						res.send(resp.statusCode+" Error:"+err);
						}
					
				});
				
},
getHistorybyPartNumber: function (req,res)
{
	var partnumber=	req.params.pn;
	var messageObj = 
				{
						"uri": env.serviceUrl + '/query',
						"json": true,
						"headers": {apikey: env.serviceApiKey	},
						"body":  {
							"chaincodeId": chaincode,
							"fcn": "history",
							"args": [partnumber]
						}
				}
				
				 	request.post(messageObj, function (err, resp, body){
					console.log('Call to BC:::RESPONSE:', resp && resp.statusCode);
					console.log('Call to BC:::ERR:', err);
					console.log('Call to BC:::Body:', body);
					if(err==null)
						{
						res.send(body);
						}
					else
						{
						res.send(resp.statusCode+" Error:"+err);
						}
					
				});
				
},
addToBlockChain:function (req,res)
{
	var part= req.body;
	
	console.log('Adding Part:'+ part)
	if(part!=undefined){
		var partnumber=part.pn;
		var serialnumber=part.sn;
		var datetime=part.dt;
		var refdocid=part.ref;
		var scrappingentity=part.se;
		var latitude=part.lat;
		var longitude=part.lon;
		var address=part.add;
		var partphoto=part.pp;
		
		var messageObj = 
					{
							"uri": env.serviceUrl + '/invoke',
							"json": true,
							"headers": {apikey: env.serviceApiKey	},
							"body":  {
								"chaincodeId": chaincode,
								"fcn": "write",
								"args": [partnumber,serialnumber,datetime,refdocid,scrappingentity,latitude,longitude,address,partphoto],
								"async": false
							}
					}
					
					 	request.post(messageObj, function (err, resp, body){
						console.log('Call to BC:::RESPONSE:', resp && resp.statusCode);
						console.log('Call to BC:::ERR:', err);
						console.log('Call to BC:::Body:', body);
						if(err==null)
							{
							res.send(resp.statusCode);
							}
						else
							{
							res.send(resp.statusCode+" Error:"+err);
							}
						
					});
	}else
		{
			res.send("Error reading the request payload");
		}
		
	
				
}

};