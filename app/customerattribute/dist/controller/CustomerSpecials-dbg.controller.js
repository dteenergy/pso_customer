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
                this.initializBusyIndicator(); //Initializing busy indicator
                var recordID = this.getOwnerComponent().getModel("oSpecialsjmodel").getData().ID;
                if (recordID === undefined || recordID === "" || recordID === null) {
                    this.newPSORecord = true;
                } else {
                    this.newPSORecord = false;
                }
                var record_status = this.getOwnerComponent().getModel("oSpecialsjmodel").getData().record_status;
                this.record_status = record_status;

              //  var oScope = currentScope;
                //  if (currentScope === "cd_create") {
                if (this.newPSORecord) {
                    // this.getView().byId("idpanelCreateSpecials").setVisible(true);
                    // this.getView().byId("idpanelDisplaySpecials").setVisible(false);
                    // this.getView().byId("_IDButtonSaveDraft").setVisible(true);
                    // this.getView().byId("_IDButtonSaveSubmit").setVisible(true);
                    // this.getView().byId("_IDEditSpecials").setVisible(false);
                    this.onEditSpecials();
                    this.getView().byId("idSpecialsStatusMessage").setText("Initial Version");
                    //   this.getView().byId("_IDDisplaySpecials").setVisible(false);
                } else {
                    // this.getView().byId("idpanelCreateSpecials").setVisible(false);
                    // this.getView().byId("idpanelDisplaySpecials").setVisible(true);
                    // this.getView().byId("_IDButtonSaveDraft").setVisible(false);
                    // this.getView().byId("_IDButtonSaveSubmit").setVisible(false);
                    // this.getView().byId("_IDEditSpecials").setVisible(true);                    
                    //   this.getView().byId("_IDDisplaySpecials").setVisible(false);
                    this.onDisplaySpecials();
                    if (record_status !== undefined && record_status !== "" && record_status !== null) {
                        if (record_status === "Submitted") {
                            this.getView().byId("idSpecialsStatusMessage").setText("Record is submitted for approval.");
                            this.getView().byId("_IDEditSpecials").setVisible(false);
                        } else if (record_status === "Approved") {
                            this.getView().byId("idSpecialsStatusMessage").setText("Record is approved. Any edit will create a new version.");
                        }
                        else if (record_status === "Rejected") {
                            this.getView().byId("idSpecialsStatusMessage").setText("Record is rejected. Please modify and submit for approval.");
                        }
                        else if (record_status === "Draft") {
                            this.getView().byId("idSpecialsStatusMessage").setText("Record is in draft version.");
                        }
                    }
                }
            },
            //**********************Initializing Busy Indicator******************/
            initializBusyIndicator: function () {
                this.oBusyIndicator = 0;
                this.oBusyIndicator = (this.oBusyIndicator) ? this.oBusyIndicator
                    : new sap.m.BusyDialog({
                        text: '',
                        title: ""
                    });
                return this.oBusyIndicator;
            },
            //********************************Edit Specials********************************/
            setVisibleCreateSpecialPanel: function(value){
                this.getView().byId("idpanelCreateSpecials").setVisible(value);
            },
            onEditSpecials: function () {                

               // this.getView().byId("idpanelCreateSpecials").setVisible(true);
                this.setVisibleCreateSpecialPanel(true);
                this.getView().byId("_IDButtonSaveDraft").setVisible(true);
                this.getView().byId("_IDButtonSaveSubmit").setVisible(true);

                this.getView().byId("idpanelDisplaySpecials").setVisible(false);                
                this.getView().byId("_IDEditSpecials").setVisible(false);
                //   this.getView().byId("_IDDisplaySpecials").setVisible(true);
            },
              //********************************Display Specials********************************/
          
              onDisplaySpecials:function(){
                this.setVisibleCreateSpecialPanel(false);
               // this.getView().byId("idpanelCreateSpecials").setVisible(false);
                this.getView().byId("_IDButtonSaveDraft").setVisible(false);
                this.getView().byId("_IDButtonSaveSubmit").setVisible(false);

                this.getView().byId("idpanelDisplaySpecials").setVisible(true);               
                this.getView().byId("_IDEditSpecials").setVisible(true);
            //     this.getView().byId("_IDDisplaySpecials").setVisible(false);
             },

            onAfterRendering: function () {
                const connection_object = this.getOwnerComponent().getModel("oCustomerAttributesJModel").getData().conn_obj;
                console.log(connection_object);
            },
            //
            onSaveAsDraftSpecials: async function (oEvent) {
                var that = this;
                that.oBusyIndicator.open();
                var oSpecialsCreateContext = this.getCreateContext();
                console.log(oSpecialsCreateContext);
                var omodel = this.getOwnerComponent().getModel();
                const recordID = this.getOwnerComponent().getModel("oSpecialsjmodel").getData().ID;
                const record_status = this.getOwnerComponent().getModel("oSpecialsjmodel").getData().record_status;
                const connection_object = this.getOwnerComponent().getModel("oSpecialsjmodel").getData().connection_object;

                if (recordID === undefined || recordID === null || recordID === "" || record_status === "Approved") {
                    //create
                    var oOperation = omodel.bindContext("/createSpecials(...)");
                } else {
                    //update
                    var oOperation = omodel.bindContext("/updateSpecials(...)");
                    oOperation.setParameter("recordID", recordID);
                }

                oOperation.setParameter("context", oSpecialsCreateContext);
                var that = this;
                await oOperation.execute().then(function (res) {
                    that.oBusyIndicator.close();
                    var oResults = oOperation.getBoundContext().getObject();
                    //msg with record saved successfully
                    console.log(oResults);
                    MessageBox.success("PSO Specials Record for connection object " + connection_object + " saved successfully!!!",
                        {
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {
                                window.history.go(-2);
                            },
                            dependentOn: that.getView()
                        });
                    //window.history.go(-1);
                    //console.table(oResults.getObject().value);
                    console.log("success: = ");
                }.bind(this), function (err) {
                    that.oBusyIndicator.close();
                    //        oBusyDialog3.close();
                    console.log("failure: = " + err.message);
                    //   MessageBox.error(err.message);
                }.bind(this))


            },
            onSubmitSpecials: async function (oEvent) {
                var that = this;
                that.oBusyIndicator.open();
                var that = this;
                const connection_object = this.getOwnerComponent().getModel("oSpecialsjmodel").getData().connection_object;
                var oSpecialsjmodelData = this.getOwnerComponent().getModel("oSpecialsjmodel").getData();
                var oSpecialsContext = this.getCreateContext();
                //   let recordID = "";
                // let newRecord = true;
                var omodel = this.getOwnerComponent().getModel();

                /***if specials record exist and if it is not approved version -> 
                 * existing record to be edited (recordID to be Fetched and mapped) 
                 * New record will not be created
                 */
                if (this.newPSORecord || (this.record_status === "Approved")) {
                    var oOperation = omodel.bindContext("/createAndSubmitSpecials(...)");
                    //oOperation.setParameter("context", oSpecialsContext); 
                } else {
                    var oOperation = omodel.bindContext("/submitSpecials(...)");
                    oOperation.setParameter("recordID", oSpecialsjmodelData.ID);
                    //oOperation.setParameter("context", oSpecialsContext);     
                }
                oOperation.setParameter("context", oSpecialsContext);
                await oOperation.execute().then(function (res) {
                    that.oBusyIndicator.close();
                    var oResults = oOperation.getBoundContext().getObject();
                    //console.log(oResults.value);
                    MessageBox.success("PSO Specials Record for connection object " + connection_object + " submitted successfully!!!",
                        {
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {
                                window.history.go(-2);
                            },
                            dependentOn: that.getView()
                        });
                    //console.table(oResults.getObject().value);
                    console.log("success onSubmitSpecials ");
                }.bind(this), function (err) {
                    that.oBusyIndicator.close();
                    //        oBusyDialog3.close();
                    console.log("failure: = " + err.message);
                    //   MessageBox.error(err.message);
                }.bind(this))
            },
            // formatDate: function (SDateValue) {
            //     //  var str = "T00:00:00";
            //     var currentTime = new Date(SDateValue);
            //     var month = currentTime.getMonth() + 1;
            //     var day = currentTime.getDate();
            //     var year = currentTime.getFullYear();
            //     var date = year + "-" + month + "-" + day;
            //     return date;
            // },
            getCreateContext: function () {
                //const connection_object = this.getOwnerComponent().getModel("oCustomerAttributesJModel").getData().conn_obj;
                var oSpecialsjmodelData = this.getOwnerComponent().getModel("oSpecialsjmodel").getData();

                var ownedByLbd=this.getView().byId("idRadio1_CS").getSelectedButton().getText();
                var ownedByCB=this.getView().byId("grop5CPSR_CS").getSelectedButton().getText();
                var ownedByTransformer=this.getView().byId("idOwnedGrp").getSelectedButton().getText();
                var fuelTypeCB=this.getView().byId("goup6CPSR_CS").getSelectedButton().getText();

                var oManufacturer = this.getView().byId("idManufacturer_CS").getSelectedKey();
                var oModel = this.getView().byId("idModel_CS").getSelectedKey();
                var oContinuousCurrent = this.getView().byId("idCC_CS").getSelectedKey();
                var oTypeLBD = this.getView().byId("idType2_CS").getSelectedKey();
                var oServiceVoltage = this.getView().byId("idSV_CS").getSelectedKey();
                var oTypeofTo = this.getView().byId("idTypeTO_CS").getSelectedKey();
                var oPSR = this.getView().byId("idrep_CS").getSelectedKey();
                var oComments = this.getView().byId("idcomment_CS").getValue();


                if (oSpecialsjmodelData.connection_object === "" || oSpecialsjmodelData.connection_object === null || oSpecialsjmodelData.connection_object === undefined) { //retain field value from previous screen
                    oSpecialsjmodelData.connection_object = this.getOwnerComponent().getModel("oCustomerAttributesJModel").getData().conn_obj;
                }// "completionDate": this.formatDate(oSpecialsjmodelData.completionDate),
                var context = {
                    "connection_object": oSpecialsjmodelData.connection_object,                   
                    "work_desc": oSpecialsjmodelData.work_desc,
                    "meter_number": oSpecialsjmodelData.meter_number,                    
                    "record_status": oSpecialsjmodelData.record_status,
                    "workflow_id": oSpecialsjmodelData.workflow_id,

                    //Customer Record(CR)
                    "pSNumber": oSpecialsjmodelData.pSNumber,
                    "completionDate": oSpecialsjmodelData.completionDate,
                    "fedFrom": oSpecialsjmodelData.fedFrom,
                    "cableDescription": oSpecialsjmodelData.cableDescription,
                    "cableFootage": oSpecialsjmodelData.cableFootage,
                    "ductType": oSpecialsjmodelData.ductType,
                    "cts": oSpecialsjmodelData.cts,
                    "pts": oSpecialsjmodelData.pts,
                    "k": oSpecialsjmodelData.k,
                    "m": oSpecialsjmodelData.m,
                    "fusesAt": oSpecialsjmodelData.fusesAt,
                    "size": oSpecialsjmodelData.size,
                    "typeCR": oSpecialsjmodelData.typeCR,
                    "curve": oSpecialsjmodelData.curve,
                    "voltage": oSpecialsjmodelData.voltage,

                    //Load Break Disconnect(LBD)
                    "ownedByLBD": ownedByLbd,
                    "manufacturer": oManufacturer,
                    "model": oModel,
                    "continuousCurrent": oContinuousCurrent,
                    "loadIntRating": oSpecialsjmodelData.loadIntRating,
                    "kAMomentaryLBD": oSpecialsjmodelData.kAMomentaryLBD,
                    "typeLBD": oTypeLBD,
                    "faultClosing": oSpecialsjmodelData.faultClosing,
                    "bilLBD": oSpecialsjmodelData.bilLBD,
                    "serviceVoltage": oServiceVoltage,
                    "CycWithstand60": oSpecialsjmodelData.CycWithstand60,

                    //Circuit Breaker(CB)
                    "fuelTypeCB":fuelTypeCB,
                    "ownedByCB": ownedByCB,
                    "circuitBreakerMake":oSpecialsjmodelData.circuitBreakerMake,
                    "serialNo":oSpecialsjmodelData.serialNo,
                    "kAMomentaryCB":oSpecialsjmodelData.kAMomentaryCB,
                    "amps":oSpecialsjmodelData.amps,
                    "typeCB":oSpecialsjmodelData.typeCB,
                    "faultDuty":oSpecialsjmodelData.faultDuty,
                    "bilCB":oSpecialsjmodelData.bilCB,

                    //Transformer
                    "ownedByTransformer": ownedByTransformer,
                    //remaing fields
                    "meter_number2": oSpecialsjmodelData.meter_number2,
                    "ab": oSpecialsjmodelData.ab,
                    "bc": oSpecialsjmodelData.bc,
                    "ca": oSpecialsjmodelData.ca,
                    "an": oSpecialsjmodelData.an,
                    "bn": oSpecialsjmodelData.bn,
                    "cn": oSpecialsjmodelData.cn,
                    "groundMatResistance": oSpecialsjmodelData.groundMatResistance,
                    "methodUsed": oSpecialsjmodelData.methodUsed,
                    "dateMergered": oSpecialsjmodelData.dateMergered,
                    "comment": oComments,
                    "typeofService": oSpecialsjmodelData.typeofService,
                    "typeofTO": oTypeofTo,
                    "pswDiagramNumber": oSpecialsjmodelData.pswDiagramNumber,
                    "primaryServiceRep": oPSR
                };
                console.log(context);
                return context;
            },
            onBack: function () {
                window.history.go(-1); //navTo preffered
            },
            //***************************** */


        });
    });