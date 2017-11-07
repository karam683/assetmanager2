cfenv= require('cfenv');
appEnv = cfenv.getAppEnv();

serviceCred = appEnv.getServiceCreds("test_blockchain")

	
	module.exports.serviceUrl= serviceCred.serviceUrl
	module.exports.serviceApiKey=serviceCred.apiKey