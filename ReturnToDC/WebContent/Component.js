jQuery.sap.declare("ReturnToDC.Component");
jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.core.routing.History");
jQuery.sap.require("sap.m.routing.RouteMatchedHandler");

sap.ui.core.UIComponent.extend("ReturnToDC.Component", {
    metadata : {
        "name" : "ReturnToDC",
        "version" : "1.1.0-SNAPSHOT",
        "library" : "ReturnToDC",
        "includes" : [ "css/fullScreenStyles.css","util/Formatter.js" ],
        "dependencies" : {
            "libs" : [ "sap.m", "sap.ui.layout" ],
            "components" : []
        },
"config" : {
resourceBundle : "i18n/messageBundle.properties",
serviceConfig : {
	name: "",
	//serviceUrl: "/sap/opu/odata/sap/Z_FIORI_TRANSFERTODC_P91_SRV/?saml2=disabled"
	serviceUrl: "../../../../../../ReturnToDC/proxy/sap/opu/odata/sap/Z_FIORI_TRANSFERTODC_P91_SRV/?saml2=disabled"
}
},
routing : {
    config : {
        "viewType" : "XML",
        "viewPath" : "ReturnToDC.view",
        "targetControl" : "fioriContent", 
        "targetAggregation" : "pages", 
        "clearTarget" : false
    },
	routes : [
		{
			pattern: "",
			name: "S1",
			view: "S1"
		}
	]
}
    },
    createContent : function() {
        var oViewData = {
            component : this
        };

        return sap.ui.view({
            viewName : "ReturnToDC.view.Main",
            type : sap.ui.core.mvc.ViewType.XML,
            viewData : oViewData
        });
    },
    init : function() {
       sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
        var sRootPath = jQuery.sap.getModulePath("ReturnToDC");
        var oServiceConfig = this.getMetadata().getConfig().serviceConfig;
        var sServiceUrl = oServiceConfig.serviceUrl;
        var oModel=new sap.ui.model.odata.ODataModel(sServiceUrl,true);
        oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
        this.setModel(oModel);
        var mConfig = this.getMetadata().getConfig();
        this._routeMatchedHandler = new sap.m.routing.RouteMatchedHandler(this.getRouter(), this._bRouterCloseDialogs);
       //this._initODataModel(sServiceUrl);
   		
      
        this.getRouter().initialize();
    },

    exit : function()
    {
        this._routeMatchedHandler.destroy();
    },
    setRouterSetCloseDialogs : function(bCloseDialogs) {
        this._bRouterCloseDialogs = bCloseDialogs;
        if (this._routeMatchedHandler) {
            this._routeMatchedHandler.setCloseDialogs(bCloseDialogs);
        }
    },

    _initODataModel : function(sServiceUrl) {
             var oConfig = {
            metadataUrlParams : {},
            json : true,
            defaultBindingMode :"TwoWay",
            defaultCountMode: "Inline",
            useBatch : true
        };
    }
});