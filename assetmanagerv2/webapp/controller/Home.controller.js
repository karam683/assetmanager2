sap.ui
	.define(
		["sap/ui/core/mvc/Controller",
			"sap/ui/model/json/JSONModel",
			"sap/ui/model/Filter",
			"sap/ui/model/FilterOperator",
			"sap/m/MessageToast"
		],
		function(Controller, JSONModel, Filter, FilterOperator, MessageToast) {
			"use strict";

			return Controller.extend("personslist.controller.Home", {
				_chainCode: "cc452ca5b8b6ba19599c9d10d4bd5916",
				handlePartNumberLinkPress: function(oEvent) {
					this.getView().byId("idTblList").setBusy(true);
					var sText = oEvent.getSource().getText();
					/*var url = "/SAPBlockChainNodeJS/gethistory/" + sText;*/
					var baseurl = window.location.protocol + "//" + window.location.hostname;
					var url = baseurl + "/gethistory/" + sText;

					$.ajax({
						url: url,
						type: "GET",
						async: false,
						success: function(oData, oResponse) {
							window.console.log("SUCCESS reading SAP block chain");

							var dataToBeMapped = {
								"results": []
							};

							var dataFromService = oData;
							for (var x = 0; x < dataFromService.length; x++) {
								dataFromService[x].Value["Timestamp"] = dataFromService[x].Timestamp;
								dataToBeMapped.results.push(dataFromService[x].Value);
							}

							var oJSONModel = new sap.ui.model.json.JSONModel();
							oJSONModel.setData(dataToBeMapped, null, false);
							this.getOwnerComponent().setModel(oJSONModel, "historyModel");
							this.getOwnerComponent().getModel("historyModel").updateBindings();
							window.console.log(dataToBeMapped);
							this.getView().byId("idTblList").setBusy(false);
							this.getOwnerComponent().getRouter().navTo("History");
						}.bind(this),
						error: function(oError) {
							this.getView().byId("idTblList").setBusy(false);
							window.console.log("ERROR reading SAP block chain");
							MessageToast.show("Issue(s) in fetching the data, Please try again.");
							//window.console.log(oError);
						}.bind(this)
					});
				},

				onSearch: function(oEvent) {
					var aFilters = [];
					var sQuery = oEvent.getSource().getValue();
					if (sQuery && sQuery.length > 0) {
						var oFilter1 = new Filter("partnumber", FilterOperator.Contains, sQuery);
						var oFilter2 = new Filter("serialnumber", FilterOperator.Contains, sQuery);
						var allFilter = new Filter([oFilter1, oFilter2], false);
						aFilters.push(allFilter);
					}
					// update list binding
					var oList = this.getView().byId("idTblList");
					var oBinding = oList.getBinding("items");
					oBinding.filter(aFilters, "Application");
				},

				handlePressCreatePartEntry: function() {
					//	
					var sDate = new Date(this.getView().byId("idScrapDateTime").getValue());
					sDate = sDate.toISOString();
					var body = {
						"pn": this.getView().byId("idPartNumber").getValue(),
						"sn": this.getView().byId("idSerialNumber").getValue(),
						"dt": sDate,
						"ref": this.getView().byId("idRefDocId").getValue(),
						"se": this.getView().byId("idScrapEntity").getValue()
					};

					/*var url = "/SAPBlockChainNodeJS/add";*/
					var baseurl = window.location.protocol + "//" + window.location.hostname;
					var url = baseurl + "/add";

					$.ajax({
						url: url,
						type: "POST",
						data: body,
						//dataType: "json",
						success: function() {
							MessageToast.show("Successfully created Part Entry to BlockChain");
							window.console.log("SUCCESS reading SAP block chain");
						},
						error: function() {
							MessageToast.show("Error creating Part Entry to BlockChain");
							window.console.log("ERROR reading SAP block chain");
							//window.console.log(oError);
						}
					});

				},

				onCallBC: function() {
					this.getView().byId("idTblList").setBusy(true);
					/*var url = "/SAPBlockChainNodeJS/searchpn/PN";*/
					var baseurl = window.location.protocol + "//" + window.location.hostname;
					var url = baseurl + "/searchpn/PN";

					$.ajax({
						url: url,
						type: "GET",
						success: function(oData) {
							var oNewData = {
								"results": []
							};
							for (var x = 0; x < oData.length; x++) {
								oNewData.results.push(oData[x]);
							}
							var oJSONModel = new sap.ui.model.json.JSONModel();
							oJSONModel.setData(oNewData, null, false);
							this.getView().setModel(oJSONModel, "listModel");

							this.getView().getModel("listModel").updateBindings();
							window.console.log("SUCCESS reading SAP block chain");
							this.getView().byId("idTblList").setBusy(false);
						}.bind(this),
						error: function(oError) {
							MessageToast.show("ERROR reading SAP BlockChain, Please try again");
							window.console.log(oError);
							this.getView().byId("idTblList").setBusy(false);
						}.bind(this)

					});
				}
			});
		});