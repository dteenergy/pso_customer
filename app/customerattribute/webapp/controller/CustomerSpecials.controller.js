sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
],
    function (Controller, Fragment, MessageBox) {
        "use strict";

        return Controller.extend("com.pso.customerattribute.controller.CustomerSpecials", {
            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("CustomerSpecials").attachMatched(function (oEvent) {
                    //   currentScope= oEvent.getParameter("arguments").scope;
                    this._loadFragmentPerScope(oEvent.getParameter("arguments").scope);
                }, this);
                // odata/v4/pso/PSOSpecials
            },
            _loadFragmentPerScope: function (currentScope) {
                var oScope = currentScope;
                if (currentScope === "cd_create") {
                    this.getView().byId("idpanelCreateSpecials").setVisible(true);
                    this.getView().byId("idpanelDiplaySpecials").setVisible(false);
                    this.getView().byId("_IDButtonSaveDraft").setVisible(true);
                    this.getView().byId("_IDButtonSaveSubmit").setVisible(true);
                    this.getView().byId("_IDEditSpecials").setVisible(false);
                    //   this.getView().byId("_IDDisplaySpecials").setVisible(false);
                } else {
                    this.getView().byId("idpanelCreateSpecials").setVisible(false);
                    this.getView().byId("idpanelDiplaySpecials").setVisible(true);
                    this.getView().byId("_IDButtonSaveDraft").setVisible(false);
                    this.getView().byId("_IDButtonSaveSubmit").setVisible(false);
                    this.getView().byId("_IDEditSpecials").setVisible(true);
                    //   this.getView().byId("_IDDisplaySpecials").setVisible(false);
                }

                //this.onCreateFusesAtLedRows();
                //oSpecialsjmodel
                var record_status = this.getOwnerComponent().getModel("oSpecialsjmodel").getData().record_status;
                if (record_status === "submitted") {
                    this.getView().byId("idSpecialsStatusMessage").setText("Record is submitted for approval.");
                    this.getView().byId("_IDEditSpecials").setVisible(false);
                } else if (record_status === "approved") {
                    this.getView().byId("idSpecialsStatusMessage").setText("Record is approved. Any edit will create a new version.");

                }
                else if (record_status === "rejected") {
                    this.getView().byId("idSpecialsStatusMessage").setText("Record is rejected. Please modify and submit for approval.");
                }
                else if (record_status === "draft") {
                    this.getView().byId("idSpecialsStatusMessage").setText("Record is in draft version.");
                }
                else { //in create mode
                    this.getView().byId("idSpecialsStatusMessage").setText("");
                }

            },
            onAfterRendering: function () {
                const connection_object = this.getOwnerComponent().getModel("oCustomerAttributesJModel").getData().conn_obj;
                console.log(connection_object);
            },
            //
            onSaveAsDraftSpecials: async function (oEvent) {
                var oSpecialsCreateContext = this.getCreateContext();
                console.log(oSpecialsCreateContext);
                var omodel = this.getOwnerComponent().getModel();
                const recordID = this.getOwnerComponent().getModel("oSpecialsjmodel").getData().ID;
                const connection_object = this.getOwnerComponent().getModel("oSpecialsjmodel").getData().connection_object;
                // if(this.getOwnerComponent().getModel("oSpecialsjmodel").getData().ID === undefined ||this.getOwnerComponent().getModel("oSpecialsjmodel").getData().ID === null || this.getOwnerComponent().getModel("oSpecialsjmodel").getData().ID === ""){
                if (recordID === undefined || recordID === null || recordID === "") {
                    //create
                    // recordID = null;
                    var oOperation = omodel.bindContext("/createSpecials(...)");
                } else {
                    //update
                    var oOperation = omodel.bindContext("/updateSpecials(...)");
                    oOperation.setParameter("ID", recordID);
                }

                oOperation.setParameter("context", oSpecialsCreateContext);
                //this.getOwnerComponent().getModel("oSpecialsjmodel").getData()
                // oOperation.setParameter("ID", oSpecialsjmodelData.ID); //if update
                //      oOperation.setParameter("context", oSpecialsCreateContext.getObject());
                // oOperation.setParameter("comment", comment);
                var that = this;
                await oOperation.execute().then(function (res) {
                    var oResults = oOperation.getBoundContext().getObject();
                    //msg with record saved successfully
                    console.log(oResults.value);
                    MessageBox.success("PSO Specials Record for connection object " + connection_object + " saved successfully!!!",
                        {
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {
                                window.history.go(-1);
                            },
                            dependentOn: that.getView()
                        });
                    //window.history.go(-1);
                    //console.table(oResults.getObject().value);
                    console.log("success: = ");
                }.bind(this), function (err) {
                    //        oBusyDialog3.close();
                    console.log("failure: = " + err.message);
                    //   MessageBox.error(err.message);
                }.bind(this))


            },
            onSubmitSpecials: async function (oEvent) {

                var omodel = this.getOwnerComponent().getModel();
                var oOperation = omodel.bindContext("/submitSpecials(...)");
                var oSpecialsContext = this.getCreateContext();
                oOperation.setParameter("context", oSpecialsContext);
                //if Specials exist, update existing record (ID matching)
                var oSpecialsjmodelData = this.getOwnerComponent().getModel("oSpecialsjmodel").getData();
                if (oSpecialsjmodelData) {
                    oOperation.setParameter("ID", oSpecialsjmodelData.ID);
                }
                //    console.log(context);
                //    const connection_object = this.getOwnerComponent().getModel("oCustomerAttributesJModel").getData().conn_obj;


                //const comment = "new comment";
                // oOperation.setParameter("ID", oSpecialsjmodelData.ID);
                //      oOperation.setParameter("context", oSpecialsCreateContext.getObject());
                // oOperation.setParameter("comment", comment);
                await oOperation.execute().then(function (res) {
                    var oResults = oOperation.getBoundContext().getObject();
                    console.log(oResults.value);
                    //console.table(oResults.getObject().value);
                    console.log("success onSubmitSpecials ");
                }.bind(this), function (err) {
                    //        oBusyDialog3.close();
                    console.log("failure: = " + err.message);
                    //   MessageBox.error(err.message);
                }.bind(this))



            },
            getCreateContext: function () {
                //const connection_object = this.getOwnerComponent().getModel("oCustomerAttributesJModel").getData().conn_obj;
                var oSpecialsjmodelData = this.getOwnerComponent().getModel("oSpecialsjmodel").getData();

                if (oSpecialsjmodelData.connection_object === "") { //retain field value from previous screen
                    oSpecialsjmodelData.connection_object = this.getOwnerComponent().getModel("oCustomerAttributesJModel").getData().conn_obj;
                }
                var context = {
                    "connection_object": oSpecialsjmodelData.connection_object,
                    "work_desc": oSpecialsjmodelData.work_desc,
                    "meter_number": oSpecialsjmodelData.meter_number
                };
                console.log(context);
                return context;
            },

            //********************************Edit Specials********************************/
            onEditSpecials: function () {
                this.getView().byId("idpanelCreateSpecials").setVisible(true);
                this.getView().byId("idpanelDiplaySpecials").setVisible(false);
                this.getView().byId("_IDButtonSaveDraft").setVisible(true);
                this.getView().byId("_IDButtonSaveSubmit").setVisible(true);
                this.getView().byId("_IDEditSpecials").setVisible(false);
                //   this.getView().byId("_IDDisplaySpecials").setVisible(true);
            },

            //**********************************View Specials******************************/
            // onViewSpecials:function(){
            //     this.getView().byId("idpanelCreateSpecials").setVisible(false);
            //     this.getView().byId("idpanelDiplaySpecials").setVisible(true);
            //     this.getView().byId("_IDButtonSaveDraft").setVisible(false);
            //     this.getView().byId("_IDButtonSaveSubmit").setVisible(false);
            //     this.getView().byId("_IDEditSpecials").setVisible(true);
            //     this.getView().byId("_IDDisplaySpecials").setVisible(false);
            // },


            onBack: function () {
                window.history.go(-1); //navTo preffered
            },

        });
    });