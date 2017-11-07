sap.ui
	.define(
		["sap/ui/core/mvc/Controller",
			"sap/ui/model/json/JSONModel",
			"sap/ui/model/Filter",
			"sap/ui/model/FilterOperator"
		],
		function(Controller, JSONModel, Filter, FilterOperator) {
			"use strict";

			return Controller.extend("personslist.controller.History", {
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
					var oList = this.getView().byId("idTblHistory");
					var oBinding = oList.getBinding("items");
					oBinding.filter(aFilters, "Application");
				},
				
				goBack: function(){
					this.getOwnerComponent().getRouter().navTo("Home");
				}
			});
		});