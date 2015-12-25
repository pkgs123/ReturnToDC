jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.m.MessageBox");
sap.ui.controller("ReturnToDC.view.S1", {
	onInit: function(){
		this.view = this.getView();
		this.core = sap.ui.getCore();
		that = this;
		this.supplyingSA = this.view.byId("supplyingStorageArea");
		this.receivingSite = this.view.byId("receivingSite");
		this.receivingSA = this.view.byId("receivingStorageArea");
		this.model = this.getOwnerComponent().getModel();
		this.core.setModel(this.model);
		this.MaterialFlag = false;
		this.Uom="";
		this.view.addStyleClass("sapUiSizeCompact");
		this.currentInputAssist;	
		this.setControlUI();
	},
	setControlUI: function(){
		var table= this.view.byId("oTable");
		var aItems = table.getItems();
		var oColumns = table.getColumns();
		if((sap.ui.Device.system.phone))
			{
				for(var i=0; i<oColumns.length; i++)
					{
						oColumns[i].setHAlign("Left");
					}
				if(aItems.length > 0)
					{
					for(var i=0; i<aItems.length; i++)
						{
							var aCells = aItems[i].getAggregation("cells");
								aCells[0].setWidth("70%");
								aCells[1].setJustifyContent("Start");
								aCells[1].getItems()[0].setWidth("20%");
								aCells[1].getItems()[0].setWidth("95%");
								aCells[2].setWidth("63%");

						}
					}
			}
		if(sap.ui.Device.system.tablet)
		{
				oColumns[0].setWidth("38%");
				oColumns[1].setWidth("40%");
				oColumns[2].setWidth("22%");
		}
		
	},
	showSupplySA: function(){
		this.currentInputAssist = "SSA";
		this.input = this.supplyingSA;
		var sDialogTitle = "Storage Area";
		var sPath = "/SlocSearchSet";
		var sTitle = "{Sloc}";
		var sDescription = "{SlocDescr}";
		this.setFragmentContent(sDialogTitle, sPath, sTitle, sDescription);		
	},
	showReceivingSite: function(){
		if(this.supplyingSA.getValue() == "")
			{
				this.supplyingSA.setValueState("Error");
				sap.m.MessageToast.show("Select Supplying Storage Area");
				return;
			}
		else
			{
				this.supplyingSA.setValueState("None");
			}
		this.currentInputAssist = "RS";
		this.input = this.receivingSite;
		var sDialogTitle = "Site";
		var sPath = "/SiteSearchSet";
		var sTitle = "{Site}";
		var sDescription = "{SiteDesc}";
		var template = new sap.m.StandardListItem({
			title: sTitle,
			description: sDescription
		});
		if (!this._oSiteSearchDialog)
			this._oSiteSearchDialog = new sap.ui.xmlfragment("ReturnToDC.view.SiteSearch", this);
		this._oSiteSearchDialog.addStyleClass("sapUiSizeCompact");
		this.core.byId("siteSearchDialog").setTitle(sDialogTitle);
		this.core.byId("lstSite").bindAggregation("items", sPath, template);
		this.core.byId("idSiteCode").setValue();
  	  	this.core.byId("idSiteDesc").setValue();
  	  	this.core.byId("idSiteCode").setValueState("None");
  	  	this.core.byId("idSiteDesc").setValueState("None");
		this._oSiteSearchDialog.open();		
	},
	showReceivingSA: function(){
		this.currentInputAssist = "RSA";
		this.input = this.receivingSA;
		var receivingSite = this.receivingSite.getValue();
		var sDialogTitle = "Storage Area";
		var sPath = "/SlocSearchSet/?$filter=Site eq '" + receivingSite.substring(0, receivingSite.indexOf(" ")) + "'";
		var sTitle = "{Sloc}";
		var sDescription = "{SlocDescr}";
		this.setFragmentContent(sDialogTitle, sPath, sTitle, sDescription);
	},
	showMaterial: function(oEvent){		
		that.input = that.core.byId(oEvent.getSource().getId());
		that.MaterialFlag = true;
		var sDialogTitle = "Material";
		var sPath = "/ArticleSearchSet";
		var sTitle = "{Article}";
		var sDescription = "{ArticleDescr}";
		that.setFragmentContent(sDialogTitle, sPath, sTitle, sDescription);
	},
	setFragmentContent: function(sDialogTitle, sPath, sTitle, sDescription){
		if (!this._oFragment)
			this._oFragment = new sap.ui.xmlfragment("ReturnToDC.view.Select", this);
		this._oFragment.addStyleClass("sapUiSizeCompact");
		var template = new sap.m.StandardListItem({
			title: sTitle,
			description: sDescription
		});

		this.core.byId("selectDialog").setTitle(sDialogTitle);
		this._oFragment.bindAggregation("items", sPath, template);
		this._oFragment.open();
	},

	onConfirm: function(oEvent){
		var selectedValue = oEvent.getParameter("selectedItem"); 
		var displayValue = selectedValue.getTitle() +" - " + selectedValue.getDescription();
		this.input.setValue(displayValue);
		switch(this.currentInputAssist)
		{
			case "SSA":
				if(this.supplyingSA.getValue() != "")
					this.supplyingSA.setValueState("None");
				break;
			case "RS": 
				if(this.receivingSite.getValue() != "")
					this.receivingSA.setEnabled(true);
				break;
			case "RSA": 	
				if(this.receivingSA.getValue() != "" && this.supplyingSA.getValue() != "")
					this.view.byId("addNewItem").setEnabled(true);
				break;
		}		
		if (this.MaterialFlag)
			{
				if(this.input.getValue() != "")
					this.input.setValueState("None");
				
				var sPath = "/ArticleSearchSet/?$filter=Article eq '" + selectedValue.getTitle() + "' and ArticleDescr eq '"
							+ selectedValue.getDescription() +"'";
				this.model.read(sPath, null, null, true, function(oData, oResponse){
					that.UoM = oData.results[0].UoM;
					
					var sCurrentItemID = that.input.getParent().getId();
					var table = that.view.byId("oTable");
					var aItems = table.getItems();
					for (var i=0; i<aItems.length; i++)
						{
							var id = aItems[i].getId();
							if (id == sCurrentItemID)
								{
									var aHBoxItems = aItems[i].getAggregation("cells")[1].getAggregation("items");
									aHBoxItems[1].setText(that.UoM);
								}
						}
				});
				this.MaterialFlag = false;
				
			}
	},
	onCancel: function(){
		this.MaterialFlag = false;
	},
	addNewItem: function(){
		var table = this.view.byId("oTable");		
		var template = this.template();
		table.insertItem(template);
		if(!this.view.byId("post").getEnabled())
			this.view.byId("post").setEnabled(true);
		this.setControlUI();
	},
	template: function(){
		return  new sap.m.ColumnListItem({
			cells: [
			        new sap.m.Input({
			        	placeholder: "Select Material",
			        	valueHelpOnly: true,
			        	showValueHelp: true,
			        	valueHelpRequest: this.showMaterial,
			        	width: "70%"			        	
			        }),
			        new sap.m.HBox({
			        		alignItems: "Center",
							justifyContent: "Center",
			        		items: [
			        		        	new sap.m.Input({width: "80%", change: that.handleQuantityChange, maxLength: 13}),
			                            new sap.m.Text({width: "100%"}),
			                       ]}),
			        new sap.m.ComboBox({
			        	placeholder: "Select Batch",
			        	items: [
			        	        new sap.ui.core.Item({
			        	        	key: "NEW - LOC",
			        	        	text: "NEW - LOC"
			        	        }),
			        	        new sap.ui.core.Item({
			        	        	key: "DAM - LOC",
			        	        	text: "DAM - LOC"
			        	        }),
			        	        ],
			        	        width: "100%",
			        	        change: that.handleQuantityChange
			        }) 
			        ]
			
		});
	},

	onPost: function(){
		var aItems = this.view.byId("oTable").getItems();
		var bEmptyFields = this.validate(aItems);
		if(!bEmptyFields)
			{
				sap.m.MessageToast.show("Fill in highlighted fields with appropriate values");
			}
		else
		{
		var IssueSLoc = this.supplyingSA.getValue();
		IssueSLoc = IssueSLoc.substring(0, IssueSLoc.indexOf(" "));
		var RecSLoc = this.receivingSA.getValue();
		RecSLoc = RecSLoc.substring(0, RecSLoc.indexOf(" "));
		var RecSite = this.receivingSite.getValue();
		RecSite = RecSite.substring(0, RecSite.indexOf(" "));
		
		var arrHeader = [];
		for(var i=0; i<aItems.length; i++)
		{
			var aCells = aItems[i].getAggregation("cells");
			
			var article = aCells[0].getValue().substring(0, aCells[0].getValue().indexOf(" "));
			var aHBoxItems = aItems[i].getAggregation("cells")[1].getAggregation("items");
			var quantity = aHBoxItems[0].getValue();
			var uom = aHBoxItems[1].getText();
			var batch = aCells[2].getSelectedKey();
				var objHeader = {
				       	 	Plant : RecSite,
				            Article: article,
				            Quantity: quantity,
				            UoM: uom,
				            ValuationType: batch
				        };
				arrHeader.push(objHeader);			
		}
		var oData = {
				IssueSloc : IssueSLoc,
				RecSloc : RecSLoc,
				RecSite : RecSite,
				HEADERITEMNAV : arrHeader,
				//ITEMSERIALNAV : arrItem
		};
		var mParameters = {
				success: function(oData,oResponse){
					that._dialog.close();
					var sapMessages = JSON.parse(oResponse.headers['sap-message']);
					var message =  	sapMessages.details[0].message + "\n" + 
									sapMessages.details[1].message + "\n" +
									sapMessages.message;
					sap.m.MessageBox.show(message, {
						 title: "Success",
						 icon: sap.m.MessageBox.Icon.SUCCESS,
						 actions: [sap.m.MessageBox.Action.OK],
						 onClose: function(oAction) {
							 that.onReset();
						 }
					 });
				},
				error: function(oError){
					that._dialog.close();
					var msg = JSON.parse(oError.response.body).error.message.value; 
					sap.m.MessageBox.show(msg, {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error",
						action: [sap.m.MessageBox.Action.OK]					
					});
				}
		};
		if (!this._dialog) {
			var xml = "<BusyDialog xmlns='sap.m' />";
			this._dialog = new sap.ui.xmlfragment({fragmentContent: xml}, this);
			this.getView().addDependent(this._dialog);
		}
		this._dialog.open();
		setTimeout(function(){ that.model.create("/MaterialHeaderSet", oData, null, mParameters.success, mParameters.error);}, 1000);
			}
	},
	onDelete: function(oEvent){
		var id = oEvent.getParameter("listItem").getId();
		this.core.byId(id).destroy();
		if(that.view.byId("oTable").getItems().length == 0)
			that.view.byId("post").setEnabled(false);

	},
	onReset: function(){
		this.supplyingSA.setValue("");
		this.receivingSite.setValue("");
		this.receivingSA.setValue("");
		
		this.supplyingSA.setValueState("None");

		this.receivingSA.setEnabled(false);
		this.view.byId("addNewItem").setEnabled(false);
		this.view.byId("post").setEnabled(false);
		
		this.view.byId("oTable").destroyItems();

	},
	handleSearch: function(oEvent){
		var sValue = oEvent.getParameter("value").toLowerCase();
		var aItems = oEvent.getSource().getItems();
	
		for(var i=0; i<aItems.length; i++)
			{
				var sTitle = aItems[i].getTitle().toLowerCase();
				var sDescription = aItems[i].getDescription().toLowerCase();
				if(sTitle.indexOf(sValue) < 0 && sDescription.indexOf(sValue) < 0)
					{
						aItems[i].setVisible(false);
					}
				else
					{
						aItems[i].setVisible(true);
					}
			}
	},
	validate: function(aItems){
		var flag = true;
		for (var i=0; i<aItems.length; i++)
			{
				var aCells = aItems[i].getAggregation("cells");
				if (aCells[0].getValue() == "")
					{
						aCells[0].setValueState("Error");
						flag = false;
					}
				var aHBoxItems = aItems[i].getAggregation("cells")[1].getAggregation("items");
				if (aHBoxItems[0].getValue() == "")
				{
					aHBoxItems[0].setValueState("Error");
					flag = false;
				}
				if (aCells[2].getSelectedKey() == "")
					{
						aCells[2].setValueState("Error");
						flag = false;
					}
			}
		return flag;
	},
	handleQuantityChange: function(oEvent){
		if(oEvent.getSource().getValue() != "")
			{
				oEvent.getSource().setValueState("None");
			}
		else
			{
				oEvent.getSource().setValueState("Error");
			}
	},
    navHome:function(){
   	   var navigationService = sap.ushell.Container.getService("CrossApplicationNavigation");
       	navigationService.toExternal({
          target : { semanticObject : "", action: "" },
        });
      },
      onSiteCancel : function(){
    	  this.MaterialFlag = false;
    	  this._oSiteSearchDialog.close();
      },
      onSiteConfirm : function(oEvent){
    	  var selectedValue = oEvent.getSource().getSelectedItem();
    	  var displayValue = selectedValue.getTitle() +" - " + selectedValue.getDescription();
    	  this.input.setValue(displayValue);
    	  if(this.receivingSite.getValue() != "")
				this.receivingSA.setEnabled(true);
    	  this._oSiteSearchDialog.close();
      },
      onSiteSearch : function(){
    	  var code = this.core.byId("idSiteCode");
    	  var desc = this.core.byId("idSiteDesc");
    	  var codeVal = this.core.byId("idSiteCode").getValue().toUpperCase();
    	  var descVal = this.core.byId("idSiteDesc").getValue().toUpperCase();
    	  if(codeVal || descVal)
    	  {
    		  code.setValueState("None");
    		  desc.setValueState("None");
    		  var sPath = "/SiteAdvListSet/?$filter=Site eq '" + codeVal + "' and SiteDescription eq '" + descVal + "'";
    		  var sTitle = "{Site}";
    		  var sDescription = "{SiteDescription}";
        	  var template = new sap.m.StandardListItem({
    				title: sTitle,
    				description: sDescription
        	  });
        	  this.core.byId("lstSite").bindAggregation("items", sPath, template);
        	  this.core.byId("panel1").setExpanded(false);
    	  }
    	  else
    	  {
    		  code.setValueState("Error");
    		  desc.setValueState("Error");
    		  sap.m.MessageToast.show("Enter Site Code and Description");
    	  }
    	  
      },
      onSiteReset :  function(){
    	  this.core.byId("idSiteCode").setValue();
    	  this.core.byId("idSiteDesc").setValue();
    	  var sPath = "/SiteSearchSet";
    	  var sTitle = "{Site}";
    	  var sDescription = "{SiteDesc}";
    	  var template = new sap.m.StandardListItem({
  			title: sTitle,
  			description: sDescription
  			});
    	  this.core.byId("idSiteCode").setValueState("None");
		  this.core.byId("idSiteDesc").setValueState("None");
    	  this.core.byId("lstSite").bindAggregation("items", sPath, template);
      },
      lcSite : function(oEvent){
    	  oEvent.getSource().setValueState("None");
      },
      onExit : function(){
    	  if(this._oFragment){
    		  this._oFragment.destroy();
    	  }
    	  if(this._dialog){
    		  this._dialog.destroy();
    	  }
    	  if(this._oSiteSearchDialog){
    		  this._oSiteSearchDialog.destroy();
    	  }    	  
      }
});