sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "com/pso/customerattribute/utils/Formatter",
],
    function (Controller, Fragment, MessageBox, Formatter) {
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
            setVisibleCreateSpecialPanel: function (value) {
                this.getView().byId("idpanelCreateSpecials").setVisible(value);
            },
            onEditSpecials: function () {

                // this.getView().byId("idpanelCreateSpecials").setVisible(true);
                this.setVisibleCreateSpecialPanel(true);
                this.getView().byId("_IDButtonSaveDraft").setVisible(true);
                this.getView().byId("_IDButtonSaveSubmit").setVisible(false);

                this.getView().byId("idpanelDisplaySpecials").setVisible(false);
                this.getView().byId("_IDEditSpecials").setVisible(false);
                //   this.getView().byId("_IDDisplaySpecials").setVisible(true);
            },
            //********************************Display Specials********************************/

            onDisplaySpecials: function () {
                let oUserScopeJModelData = this.getOwnerComponent().getModel("oUserScopeJModel").getData();

                this.setVisibleCreateSpecialPanel(false);
                this.getView().byId("idpanelDisplaySpecials").setVisible(true);
                // this.getView().byId("idpanelCreateSpecials").setVisible(false);
                this.getView().byId("_IDButtonSaveDraft").setVisible(false);

                if (oUserScopeJModelData.hasSpecialsEditAccess) {
                    console.log(this.record_status);
                    if (this.record_status === "Draft") {
                        this.getView().byId("_IDButtonSaveSubmit").setVisible(true);
                    } else {
                        this.getView().byId("_IDButtonSaveSubmit").setVisible(false);
                    }
                    this.getView().byId("_IDEditSpecials").setVisible(true);
                }
                else {
                    this.getView().byId("_IDButtonSaveSubmit").setVisible(false);
                    this.getView().byId("_IDEditSpecials").setVisible(false);
                }
                //     this.getView().byId("_IDDisplaySpecials").setVisible(false);
            },

            onAfterRendering: function () {
                //    const connection_object = this.getOwnerComponent().getModel("oCustomerAttributesJModel").getData().conn_obj;
                //    console.log(connection_object);
            },
            //
            onSaveAsDraftSpecials: async function (oEvent) {
                var that = this;
                that.oBusyIndicator.open();
                // var oSpecialsCreateContext = this.getCreateContext_Submit();
                // console.log(oSpecialsCreateContext);
                //  var omodel = this.getOwnerComponent().getModel();
                const recordID = this.getOwnerComponent().getModel("oSpecialsjmodel").getData().ID;
                const record_status = this.getOwnerComponent().getModel("oSpecialsjmodel").getData().record_status;
                const connection_object = this.getOwnerComponent().getModel("oSpecialsjmodel").getData().connection_object;

                //oSpecialsCreateContext.record_status = 'Draft';

                let svcUrl = this.getOwnerComponent().getModel().sServiceUrl;

                //  if (recordID === undefined || recordID === null || recordID === "" || record_status === "Approved") {

                if (record_status === "Approved") {  /******create for approved data *******/
                    //   var oOperation = omodel.bindContext("/createSpecials(...)");
                    var oSpecialsCreateContext = this.getCreateContext_Submit();
                    console.log(oSpecialsCreateContext);
                    oSpecialsCreateContext.record_status = 'Draft';
                    try {
                        const response = await fetch(svcUrl + 'PSOSpecials', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(oSpecialsCreateContext)
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        const data = await response.json();
                        that.oBusyIndicator.close();
                        MessageBox.success("PSO Specials Record for connection object " + connection_object + " saved successfully!!!",
                            {
                                actions: [MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK,
                                onClose: function (sAction) {
                                    window.history.go(-2);
                                },
                                dependentOn: that.getView()
                            });

                        console.log("success POST record ");
                        return data;
                    } catch (error) {
                        console.error('Error:', error.message);
                        that.oBusyIndicator.close();
                    }
                } else {   /******update exisitng data *******/
                    //    var oOperation = omodel.bindContext("/updateSpecials(...)");
                    //  oOperation.setParameter("recordID", recordID);
                    //var oSpecialsCreateContext_Update = this.getCreateContext_Update();
                    var oSpecialsCreateContext = this.getCreateContext();
                    console.log(oSpecialsCreateContext);
                    oSpecialsCreateContext.record_status = 'Draft';
                    const path = svcUrl + "PSOSpecials(ID=" + recordID + ",connection_object='" + connection_object + "')";
                    try {
                        var resultData;
                        const requestOptions = {
                            method: "PUT", // Specify the request method
                            headers: { "Content-Type": "application/json" }, // Specify the content type
                            body: JSON.stringify(oSpecialsCreateContext) // Send the data in JSON format
                        };

                        await fetch(path, requestOptions)
                            .then(response => response.json()) // Parse the response as JSON
                            .then(data => {
                                resultData = data;
                                console.log(data);
                            }) // Do something with the data
                            .catch(error => console.error(error)); // Handle errors


                        MessageBox.success("PSO Specials Record for connection object " + connection_object + " saved successfully!!!",
                            {
                                actions: [MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK,
                                onClose: function (sAction) {
                                    window.history.go(-2);
                                },
                                dependentOn: that.getView()
                            });
                        console.log("success: = ");
                        that.oBusyIndicator.close();
                        return resultData;
                    } catch (error) {
                        that.oBusyIndicator.close();
                        console.error('Error:', error.message);
                    }
                }

                /*
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
                  */
            },
            onSubmitSpecials: async function (oEvent) {
                var that = this;
                var oPSR = that.getView().byId("idrep_CS").getSelectedKey();
                if (oPSR === "") {
                    sap.m.MessageBox.show(this.getView().getModel("i18n").getProperty("document_note_mandatory"), {
                        icon: sap.m.MessageBox.Icon.WARNING,
                        title: this.getView().getModel("i18n").getProperty("error"),
                        actions: [sap.m.MessageBox.Action.OK]
                    });
                    return;
                }
                that.oBusyIndicator.open();
                var that = this;
                const connection_object = this.getOwnerComponent().getModel("oSpecialsjmodel").getData().connection_object;
                var oSpecialsjmodelData = this.getOwnerComponent().getModel("oSpecialsjmodel").getData();
                var oSpecialsContext = this.getCreateContext_Submit();
                //   let recordID = "";
                // let newRecord = true;
                var omodel = this.getOwnerComponent().getModel();

                /***if specials record exist and if it is not approved version -> 
                 * existing record to be edited (recordID to be Fetched and mapped) 
                 * New record will not be created
                 */
                // if (this.newPSORecord || (this.record_status === "Approved")) {
                //     var oOperation = omodel.bindContext("/createAndSubmitSpecials(...)");
                //     //oOperation.setParameter("context", oSpecialsContext); 
                // } else 
                // {
                var oOperation = omodel.bindContext("/submitSpecials(...)");
                oOperation.setParameter("recordID", oSpecialsjmodelData.ID);
                //oOperation.setParameter("context", oSpecialsContext);     
                // }
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
                const oCustomerAttributesJModelData = this.getOwnerComponent().getModel("oCustomerAttributesJModel").getData();
                var oSpecialsjmodelData = this.getOwnerComponent().getModel("oSpecialsjmodel").getData();
                var ownedByLbd = this.getView().byId("idRadio1_CS").getSelectedButton().getText();
                var ownedByCB = this.getView().byId("grop5CPSR_CS").getSelectedButton().getText();
                var ownedByTransformer = this.getView().byId("idOwnedGrp").getSelectedButton().getText();
                var fuelTypeCB = this.getView().byId("goup6CPSR_CS").getSelectedButton().getText();

                var oManufacturer = this.getView().byId("idManufacturer_CS").getSelectedKey();
                var oModel = this.getView().byId("idModel_CS").getSelectedKey();
                var oContinuousCurrent = this.getView().byId("idCC_CS").getSelectedKey();
                var oTypeLBD = this.getView().byId("idType2_CS").getSelectedKey();
                var oServiceVoltage = this.getView().byId("idSV_CS").getSelectedKey();
                var oTypeofTo = this.getView().byId("idTypeTO_CS").getSelectedKey();
                var oMethodUsed = this.getView().byId("idmethod_CS").getSelectedKey();
                var oPSR = this.getView().byId("idrep_CS").getSelectedKey();
                var oLBDBill = this.getView().byId("idBil_CS").getSelectedKey();
                var oComments = this.getView().byId("idcomment_CS").getValue();
                var oPSW = this.getView().byId("idCNpsw_CS").getText();
                var oCustName = oCustomerAttributesJModelData.cust_name;
                var oStreetName = oCustomerAttributesJModelData.street_name;
                var oStreetNo = oCustomerAttributesJModelData.street_no


                if (oSpecialsjmodelData.connection_object === "" || oSpecialsjmodelData.connection_object === null || oSpecialsjmodelData.connection_object === undefined) { //retain field value from previous screen
                    oSpecialsjmodelData.connection_object = this.getOwnerComponent().getModel("oCustomerAttributesJModel").getData().conn_obj;
                }// "completionDate": this.formatDate(oSpecialsjmodelData.completionDate),

                var context = {
                    "connection_object": oSpecialsjmodelData.connection_object,
                    "work_desc": oSpecialsjmodelData.work_desc,
                    "meter_number": oSpecialsjmodelData.meter_number,
                    "meter_number2": oSpecialsjmodelData.meter_number2,
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
                    "bilLBD": oLBDBill,
                    "serviceVoltage": oServiceVoltage,
                    "CycWithstand60": oSpecialsjmodelData.CycWithstand60,

                    //Circuit Breaker(CB)
                    "fuelTypeCB": fuelTypeCB,
                    "ownedByCB": ownedByCB,
                    "circuitBreakerMake": oSpecialsjmodelData.circuitBreakerMake,
                    "serialNo": oSpecialsjmodelData.serialNo,
                    "kAMomentaryCB": oSpecialsjmodelData.kAMomentaryCB,
                    "amps": oSpecialsjmodelData.amps,
                    "typeCB": oSpecialsjmodelData.typeCB,
                    "faultDuty": oSpecialsjmodelData.faultDuty,
                    "bilCB": oSpecialsjmodelData.bilCB,

                    //Transformer
                    "ownedByTransformer": ownedByTransformer,
                    //remaing fields
                    "ab": oSpecialsjmodelData.ab,
                    "bc": oSpecialsjmodelData.bc,
                    "ca": oSpecialsjmodelData.ca,
                    "an": oSpecialsjmodelData.an,
                    "bn": oSpecialsjmodelData.bn,
                    "cn": oSpecialsjmodelData.cn,
                    "groundMatResistance": oSpecialsjmodelData.groundMatResistance,
                    "methodUsed": oMethodUsed,
                    "dateMergered": oSpecialsjmodelData.dateMergered,
                    "comment": oComments,
                    "typeofService": oSpecialsjmodelData.typeofService,
                    "typeofTO": oTypeofTo,
                    "pswDiagramNumber": oPSW,
                    "primaryServiceRep": oPSR,
                    "customerName": oCustName,
                    "streetNumber": oStreetNo,
                    "streetName": oStreetName,
                    "fuses": oSpecialsjmodelData.fuses
                };
                console.log(context);
                return context;
            },
            getCreateContext_Submit: function () {
                const oCustomerAttributesJModelData = this.getOwnerComponent().getModel("oCustomerAttributesJModel").getData();
                var oSpecialsjmodelData = this.getOwnerComponent().getModel("oSpecialsjmodel").getData();
                var ownedByLbd = this.getView().byId("idRadio1_CS").getSelectedButton().getText();
                var ownedByCB = this.getView().byId("grop5CPSR_CS").getSelectedButton().getText();
                var ownedByTransformer = this.getView().byId("idOwnedGrp").getSelectedButton().getText();
                var fuelTypeCB = this.getView().byId("goup6CPSR_CS").getSelectedButton().getText();

                var oManufacturer = this.getView().byId("idManufacturer_CS").getSelectedKey();
                var oModel = this.getView().byId("idModel_CS").getSelectedKey();
                var oContinuousCurrent = this.getView().byId("idCC_CS").getSelectedKey();
                var oTypeLBD = this.getView().byId("idType2_CS").getSelectedKey();
                var oServiceVoltage = this.getView().byId("idSV_CS").getSelectedKey();
                var oTypeofTo = this.getView().byId("idTypeTO_CS").getSelectedKey();
                var oMethodUsed = this.getView().byId("idmethod_CS").getSelectedKey();
                var oPSR = this.getView().byId("idrep_CS").getSelectedKey();
                var oLBDBill = this.getView().byId("idBil_CS").getSelectedKey();
                var oComments = this.getView().byId("idcomment_CS").getValue();
                var oPSW = this.getView().byId("idCNpsw_CS").getText();
                var oCustName = oCustomerAttributesJModelData.cust_name;
                var oStreetName = oCustomerAttributesJModelData.street_name;
                var oStreetNo = oCustomerAttributesJModelData.street_no


                if (oSpecialsjmodelData.connection_object === "" || oSpecialsjmodelData.connection_object === null || oSpecialsjmodelData.connection_object === undefined) { //retain field value from previous screen
                    oSpecialsjmodelData.connection_object = this.getOwnerComponent().getModel("oCustomerAttributesJModel").getData().conn_obj;
                }// "completionDate": this.formatDate(oSpecialsjmodelData.completionDate),
                let fuses = [];
                for (let i = 0; i < oSpecialsjmodelData.fuses.length; i++) {
                    var fuse = {
                        "fuseType": oSpecialsjmodelData.fuses[i].fuseType,
                        "fuseCurve": oSpecialsjmodelData.fuses[i].fuseCurve,
                        "fuseVoltage": oSpecialsjmodelData.fuses[i].fuseVoltage,
                        "fuseSeqNo": oSpecialsjmodelData.fuses[i].fuseSeqNo,
                        "psospecials_ID": oSpecialsjmodelData.fuses[i].psospecials_ID,
                        "psospecials_connection_object": oSpecialsjmodelData.fuses[i].psospecials_connection_object,
                        "fuseSize": oSpecialsjmodelData.fuses[i].fuseSize
                    }
                    fuses.push(fuse);
                }
                var context = {

                    "connection_object": oSpecialsjmodelData.connection_object,
                    "work_desc": oSpecialsjmodelData.work_desc,
                    "meter_number": oSpecialsjmodelData.meter_number,
                    "meter_number2": oSpecialsjmodelData.meter_number2,
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
                    "bilLBD": oLBDBill,
                    "serviceVoltage": oServiceVoltage,
                    "CycWithstand60": oSpecialsjmodelData.CycWithstand60,

                    //Circuit Breaker(CB)
                    "fuelTypeCB": fuelTypeCB,
                    "ownedByCB": ownedByCB,
                    "circuitBreakerMake": oSpecialsjmodelData.circuitBreakerMake,
                    "serialNo": oSpecialsjmodelData.serialNo,
                    "kAMomentaryCB": oSpecialsjmodelData.kAMomentaryCB,
                    "amps": oSpecialsjmodelData.amps,
                    "typeCB": oSpecialsjmodelData.typeCB,
                    "faultDuty": oSpecialsjmodelData.faultDuty,
                    "bilCB": oSpecialsjmodelData.bilCB,

                    //Transformer
                    "ownedByTransformer": ownedByTransformer,
                    //remaing fields
                    "ab": oSpecialsjmodelData.ab,
                    "bc": oSpecialsjmodelData.bc,
                    "ca": oSpecialsjmodelData.ca,
                    "an": oSpecialsjmodelData.an,
                    "bn": oSpecialsjmodelData.bn,
                    "cn": oSpecialsjmodelData.cn,
                    "groundMatResistance": oSpecialsjmodelData.groundMatResistance,
                    "methodUsed": oMethodUsed,
                    "dateMergered": oSpecialsjmodelData.dateMergered,
                    "comment": oComments,
                    "typeofService": oSpecialsjmodelData.typeofService,
                    "typeofTO": oTypeofTo,
                    "pswDiagramNumber": oPSW,
                    "primaryServiceRep": oPSR,
                    "customerName": oCustName,
                    "streetNumber": oStreetNo,
                    "streetName": oStreetName,
                    "fuses": fuses
                };
                console.log(context);
                return context;
            },
            onBack: function () {
                window.history.go(-1); //navTo preffered
            },
            //*********************************
            onMeterMatch: function (evt) {
                var oAttributes = this.getOwnerComponent().getModel("oCustomerAttributesJModel").getData();
                var oMeter = evt.getSource().getValue();
                if (oAttributes.meter1 !== oMeter && oAttributes.meter2 !== oMeter) {
                    MessageBox.warning("Meter Number " + oMeter + " entered is not installed at site");
                }
            },
            //******************************* */
            onAddnewFusesRow: function (oEvt) {
                var oSpecialsjmodel = this.getView().getModel("oSpecialsjmodel");
                var aData = oSpecialsjmodel.getProperty("/fuses") || []; // Get current items
                const connection_object = oSpecialsjmodel.getData().connection_object;
                const recordID = oSpecialsjmodel.getData().ID;
                if (aData.length === 0) {
                    this.sequenceCounter = 1;
                } else {
                    this.sequenceCounter = aData.length;
                }

                // Create a new item with empty values
                var newItem = {
                    psospecials_connection_object: connection_object,
                    psospecials_ID: recordID, //this is the Specials UUID 
                    fuseSize: "",   // For the Input field
                    fuseType: "",  // For the ComboBox
                    fuseVoltage: "",// For the ComboBox
                    fuseSeqNo: this.sequenceCounter++
                };

                // Add the new item to the existing items
                aData.push(newItem);

                // Update the model with the new items array
                //check table model for fuses data .. mickey.
                oSpecialsjmodel.setProperty("/fuses", aData);

            },
            onFuseTypeChange: function (oEvent) {
                // console.log(oEvent);
                // const selectedKey = oEvent.getParameters().selectedItem.mProperties.key;
                // const selectedValue = oEvent.getParameters().selectedItem.mProperties.text;
                // const arr = oEvent.getSource().getId().split('-');
                // const rowNo = arr[arr.length-1];
                // var oSpecialsjmodelData = this.getOwnerComponent().getModel("oSpecialsjmodel").getData();
                // console.log(oSpecialsjmodelData);
                // var oSpecialsjmodelData_view = this.getView().getModel("oSpecialsjmodel").getData();
                // console.log(oSpecialsjmodelData_view);
                // oSpecialsjmodelData.fuses[rowNo].fuseType = selectedValue;
                // oSpecialsjmodelData_view.fuses[rowNo].fuseType = selectedValue;


            }
            //***************************** */


        });
    });