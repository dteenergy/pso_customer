sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
function (Controller) {
    "use strict";

    return Controller.extend("com.pso.changelog.controller.detailPage", {
        onInit: function () {
            this.getOwnerComponent().getRouter().attachRoutePatternMatched(this._initialize,this);
        },
        _initialize : function(oEvent){
            this.byId('ObjectPageLayout').bindElement({
                path : '/PSOSpecials'+location.hash.split('PSOSpecials')[1] ,
                parameters: {
                    expand: "fuses"
                  }
            });
        }
    });
});
