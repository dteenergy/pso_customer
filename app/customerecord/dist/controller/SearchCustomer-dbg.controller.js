sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    function (Controller) {
        "use strict";

        return Controller.extend("com.pso.customerecord.controller.SearchCustomer", {
            onInit: function () {
                //this.userScope = 
                this.getUserDetails();
                //console.log(this.userScope);
            },

            getUserDetails: async function () {
                var omodel = this.getOwnerComponent().getModel();
                let userScope = null;
                var oOperation = omodel.bindContext("/userDetails(...)");
                //     oOperation.setParameter("id", keyField);
                await oOperation.execute().then(function (res) {
                    var oResults = oOperation.getBoundContext().getObject();
                    console.log(oResults);
                    userScope = oResults.value;

                    //  userScope = oResults.value[1].scope;
                    //  console.log(userScope);
                    //if((oResults.value[1].scope).includes('pso_search_customer'))
                    //    {
                    //add to global model
                    //    }                    
                    // oBusyDialog3.close();

                    // let serviceurl = this.getView().getModel().sServiceUrl;
                    // var entity = "Requirements";
                    // var allocationDwldUrl = serviceurl + entity + "(ID=" + keyField + ")/techspeccontent";
                    // URLHelper.redirect(allocationDwldUrl, true);

                }.bind(this), function (err) {
                    //        oBusyDialog3.close();
                    MessageBox.error(err.message);
                }.bind(this))
               // return userScope;
                this.userScope = userScope;
                let a = null;
            },
            clickMe: function(oEvent){
                //testText
                console.log(this.userScope[1]);
                this.getView().byId("testText").setText(this.userScope[1]);
                var url_dest = "/compsocustomerecord/openText/&bokey=5110267589&language=EN"
                window.open(url_dest, "_blank");
              
            }


        });
    });
