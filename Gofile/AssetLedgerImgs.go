// Disclaimer
//
// THIS SAMPLE CODE MAY BE USED SOLELY AS PART OF THE TEST AND EVALUATION OF THE SAP CLOUD PLATFORM BLOCKCHAIN SERVICE (THE “SERVICE”)
// AND IN ACCORDANCE WITH THE TERMS OF THE TEST AND EVALUATION AGREEMENT FOR THE SERVICE. THIS SAMPLE CODE PROVIDED “AS IS”, WITHOUT
// ANY WARRANTY, ESCROW, TRAINING, MAINTENANCE, OR SERVICE OBLIGATIONS WHATSOEVER ON THE PART OF SAP.

package main


import (
	"fmt"
	"encoding/json"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/hyperledger/fabric/protos/peer"
	"strings"
	"bytes"
	"time"
	
 )


// Main function starts up the chaincode in the container during instantiate
//
type AssetLedger struct {}

func main() {
    if err := shim.Start(new(AssetLedger)); err != nil {
		fmt.Printf("Main: Error starting AssetLedger chaincode: %s", err)
	}
}


// Init is called during Instantiate transaction after the chaincode container
// has been established for the first time, allowing the chaincode to
// initialize its internal data. Note that chaincode upgrade also calls this 
// function to reset or to migrate data, so be careful to avoid a scenario 
// where you inadvertently clobber your ledger's data!
//
func (t *AssetLedger) Init(stub shim.ChaincodeStubInterface) peer.Response {
	// Validate supplied init parameters, in this case zero arguments!
	if _, args := stub.GetFunctionAndParameters(); len(args) > 0 {
	    return shim.Error("Init: Incorrect number of arguments; no arguments were expected and none should have been supplied.")
	}
	return shim.Success(nil)
}


// Invoke is called to update or query the ledger in a proposal transaction.
// Updated state variables are not committed to the ledger until the
// transaction is committed.
//
func (cc *AssetLedger) Invoke(stub shim.ChaincodeStubInterface) peer.Response {

	// Which function is been called?
	function, args := stub.GetFunctionAndParameters()
	function = strings.ToLower(function)

	// Route call to the correct function
	switch function {
		case "write":	return cc.write(stub, args)
		case "read":	return cc.read(stub, args);
		case "searchsn":	return cc.searchsn(stub, args);
		case "searchpn":	return cc.searchpn(stub, args);
		case "history": return cc.history(stub, args);
		default:		return shim.Error("Invalid method! Valid methods are (Invoke) 'write' or (Query) 'read|search'!")
	}
}


// Write an ID and string to the blockchain
//

type message struct {
	PartNumber		string  `json:"partnumber"`
	SerialNumber   string	`json:"serialnumber"`
	ScrapDateTime  string   `json:"scrapdatetime"`
	RefDocumentId  string   `json:"refdocumentid"`
	ScrappingEntity string   `json:"scrappingentity"`
	Latitude		string   `json:"latitude"`
	Longitude       string   `json:"longitude"`
	Address			string   `json:"address"`
	PartPhoto       string   `json:"partphoto"`

}

func (cc *AssetLedger) write(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	//extract the PartNumber and other values from the arguments the content and object id
	if len(args) != 9 {
		return shim.Error("Write: incorrect number of arguments; expecting an PN, SN, ScrapDateTime, RefDocId, ScrappingEntity, Latitude, Longitude, Address and PartPhoto to be provided.")
	}
	partnumber := strings.ToLower(args[0])
	msg := &message{PartNumber: args[0], SerialNumber:args[1], ScrapDateTime:args[2], RefDocumentId:args[3], ScrappingEntity:args[4], Latitude:args[5], Longitude:args[6], Address:args[7], PartPhoto:args[8] }
	msgJSON, _ := json.Marshal(msg)

	/*
	// Validate that this PartNumber does not yet exist
	if messageAsBytes, err := stub.GetState(partnumber); err != nil ||  messageAsBytes != nil {
		return shim.Error("Write: this PartNumber already has a message assigned.")
	}*/

	// Write the message
	if err := stub.PutState(partnumber, msgJSON); err != nil {
		return shim.Error(err.Error())
	} else {
		return shim.Success(nil)
	}
}


// Read a string from the blockchain, given its ID
//
func (cc *AssetLedger) read(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	if len(args) != 1 {
		return shim.Error("Read: incorrect number of arguments; expecting only the PartNumber to be read.")
	}
	partnumber := strings.ToLower(args[0])

	if value, err := stub.GetState(partnumber); err != nil || value == nil {
		return shim.Error("Read: invalid PartNumber supplied.")
	} else {
		return shim.Success(value)
	}
}


// Search for a specific ID, given a (regex) value expression. For example: "^H.llo" will match
// any string starting with "Hello" or "Hallo".
//
func (cc *AssetLedger) searchpn(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	if len(args) != 1 {
		return shim.Error("Read: incorrect number of arguments; expecting only the search string.")
	}
	searchString := args[0]

	// stub.GetQueryResult takes a verbatim CouchDB (assuming this is used DB). See CouchDB documentation:
	//     http://docs.couchdb.org/en/2.0.0/api/database/find.html
	// For example:
	//	{
	//		"selector": {
	//			"value": {"$regex": %s"}
	//		},
	//		"fields": ["ID","value"],
	//		"limit":  99
	//	}
	queryString := fmt.Sprintf("{\"selector\": {\"partnumber\": {\"$regex\": \"%s\"}}, \"fields\": [\"partnumber\",\"serialnumber\",\"scrapdatetime\",\"refdocumentid\",\"scrappingentity\",\"latitude\",\"longitude\",\"address\",\"partphoto\"],\"limit\":99}", strings.Replace(searchString,"\"",".",-1))

			resultsIterator, err := stub.GetQueryResult(queryString)
	if err != nil {
		return shim.Error(err.Error())
	}
    defer resultsIterator.Close()

    // buffer is a JSON array containing QueryRecords (which are JSON objects)
    var buffer bytes.Buffer
	buffer.WriteString("[")
	for resultsIterator.HasNext() {
		queryResponse, _ := resultsIterator.Next()
        if buffer.Len() > 1 {
        	buffer.WriteString(",")
        }
		buffer.WriteString(string(queryResponse.Value))
	}
	buffer.WriteString("]")

	return shim.Success(buffer.Bytes())
}
func (cc *AssetLedger) searchsn(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	if len(args) != 1 {
		return shim.Error("Read: incorrect number of arguments; expecting only the search string.")
	}
	searchString := args[0]

	// stub.GetQueryResult takes a verbatim CouchDB (assuming this is used DB). See CouchDB documentation:
	//     http://docs.couchdb.org/en/2.0.0/api/database/find.html
	// For example:
	//	{
	//		"selector": {
	//			"value": {"$regex": %s"}
	//		},
	//		"fields": ["ID","value"],
	//		"limit":  99
	//	}
	queryString := fmt.Sprintf("{\"selector\": {\"serialnumber\": {\"$regex\": \"%s\"}}, \"fields\": [\"partnumber\",\"serialnumber\",\"scrapdatetime\",\"refdocumentid\",\"scrappingentity\",\"latitude\",\"longitude\",\"address\",\"partphoto\"],\"limit\":99}", strings.Replace(searchString,"\"",".",-1))

			resultsIterator, err := stub.GetQueryResult(queryString)
	if err != nil {
		return shim.Error(err.Error())
	}
    defer resultsIterator.Close()

    // buffer is a JSON array containing QueryRecords (which are JSON objects)
    var buffer bytes.Buffer
	buffer.WriteString("[")
	for resultsIterator.HasNext() {
		queryResponse, _ := resultsIterator.Next()
        if buffer.Len() > 1 {
        	buffer.WriteString(",")
        }
		buffer.WriteString(string(queryResponse.Value))
	}
	buffer.WriteString("]")

	return shim.Success(buffer.Bytes())
}
func (cc *AssetLedger) history(stub shim.ChaincodeStubInterface, args []string) peer.Response {

if len(args) != 1 {
return shim.Error("Read: incorrect number of arguments; expecting only PartNumber.")
}
id := strings.ToLower(args[0])


resultsIterator, err := stub.GetHistoryForKey(id)
if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Value\":")
		buffer.Write(queryResponse.Value)
		buffer.WriteString(", \"Timestamp\":")
		buffer.WriteString("\"")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(time.Unix((queryResponse.Timestamp.Seconds),int64(queryResponse.Timestamp.Nanos)).String())//Format("15:04:05.9999"))
		buffer.WriteString("\"")
		buffer.WriteString("}")

		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	return shim.Success(buffer.Bytes())

}



