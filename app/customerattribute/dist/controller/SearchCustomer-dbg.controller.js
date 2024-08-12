sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    function (Controller) {
        "use strict";

        return Controller.extend("com.pso.customerattribute.controller.SearchCustomer", {
            onInit: function () {

            },
            launchOpentextURL: async function (oEvent) {

                var url_dest = "&bokey=5110267589&language=EN";
                var omodel = this.getOwnerComponent().getModel();
                var oOperation = omodel.bindContext("/launchOpenTextURL(...)");
                //     oOperation.setParameter("id", keyField);
                await oOperation.execute().then(function (res) {
                    var oResults = oOperation.getBoundContext().getObject();
                    console.log(oResults.value);
                    //     userScope = oResults.value;
                    let openTextURL = oResults.value + url_dest;
                    console.log(openTextURL);
                    window.open(openTextURL, '_blank');
                }.bind(this), function (err) {
                    //        oBusyDialog3.close();
                    MessageBox.error(err.message);
                }.bind(this))

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

                }.bind(this), function (err) {
                    //        oBusyDialog3.close();
                    MessageBox.error(err.message);
                }.bind(this))
                // return userScope;
                this.userScope = userScope;
                let a = null;
            },
            createWFInstance: async function (oEvent) {

                var omodel = this.getOwnerComponent().getModel();
                var oOperation = omodel.bindContext("/triggerWorkflowPSOSpecials(...)");
                //     oOperation.setParameter("id", keyField);
                await oOperation.execute().then(function (res) {
                    var oResults = oOperation.getBoundContext().getObject();
                    console.log(oResults.value);

                }.bind(this), function (err) {
                    //        oBusyDialog3.close();
                    MessageBox.error(err.message);
                }.bind(this))



            }
        });
    });
