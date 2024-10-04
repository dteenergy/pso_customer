sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox"
],
    function (Controller, Fragment, MessageBox) {
        "use strict";

        return Controller.extend("com.pso.customerattribute.controller.CustomerDetails", {
            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("CustomerDetails").attachMatched(function (oEvent) {
                    this._loadFragmentPerScope(oEvent.getParameter("arguments").scope);
                }, this);

                this.oEditFlag = "";

            },
            onBeforeRendering: function () {
                let oUserScopeJModelData = this.getOwnerComponent().getModel("oUserScopeJModel").getData();
                console.log(oUserScopeJModelData);
                // this.hasLimitedDisplay = false;
                // this.hasRecordCreateAccess = false;
                // this.hasRecordDisplayAccess = false;
                // this.hasRecordEditAccess = false;
                // this.hasSpecialsCreateAccess = false;
                // this.hasSpecialsDisplayAccess = false;
                // this.hasSpecialsEditAccess = false;
                // for (var i = 0; i < oUserScopeJModelData.length; i++) {
                //     /** Logged in user has limited display and cannot view/edit phone numbers */

                //     let scope = oUserScopeJModelData[i];
                //     switch (scope) {

                //         case "pso_customer_details_create":
                //             this.hasRecordCreateAccess = true;
                //             break;
                //         case "pso_customer_details_edit":
                //             this.hasRecordEditAccess = true;
                //             break;
                //         case "pso_customer_details_display":
                //             this.hasRecordDisplayAccess = true;
                //             break;
                //         case "pso_customer_details_display_limited":
                //             this.hasLimitedDisplay = true;
                //             break;
                //         case "pso_customer_specials_display":
                //             this.hasSpecialsDisplayAccess = true;
                //             break;
                //         case "pso_customer_specials_edit":
                //             this.hasSpecialsEditAccess = true;
                //             break;
                //         case "pso_customer_specials_create":
                //             this.hasSpecialsCreateAccess = true;
                //             break;

                //         default:
                //         // code block
                //     }

                // }//end for loop

                // if (oUserScopeJModelData.hasLimitedDisplay) { //hide phone numbers
                //     //this.getView().byId("idPageSecEmerContact_DC").setVisible(false);
                //     //this.getView().byId("idPageSecEmerContact_CC").setVisible(false);
                // }
                // else {

                //     //this.getView().byId("idPageSecEmerContact_DC").setVisible(true);
                //     //this.getView().byId("idPageSecEmerContact_CC").setVisible(true);
                // }
                // if (oUserScopeJModelData.hasRecordCreateAccess) {
                    //create button visible
                    // this.getView().byId("_IDButtonCreateRecord").setVisible(true);
               // }
                // if (oUserScopeJModelData.hasRecordDisplayAccess) {

                // }
                // if (oUserScopeJModelData.hasRecordEditAccess) {
                //     // this.getView().byId("_IDButtonEditRecord").setVisible(true);
                // }

                if (oUserScopeJModelData.hasSpecialsCreateAccess) {
              //      this.getView().byId("_IDGenButtonCreateSp").setVisible(true);
                }
                if (oUserScopeJModelData.hasSpecialsDisplayAccess) {
                    this.getView().byId("_IDGenButtonDisplaySp").setVisible(true);
                }
                // if (oUserScopeJModelData.hasSpecialsEditAccess) {

                // }
            },

            _loadFragmentPerScope: function (currentScope) {
                this.oEditFlag = "";
                this.initializBusyIndicator(); //Initializing busy indicator
                let oUserScopeJModelData = this.getOwnerComponent().getModel("oUserScopeJModel").getData();
                console.log(oUserScopeJModelData);
              
                var superior_flag = this.getOwnerComponent().getModel("oCustomerAttributesJModel").oData.superior_flag;
                if (superior_flag == "X") { //create child
                    this.getView().byId("_IDButtonCreateRecord").setText("Create Record");
                    this.getView().byId("idpanel").setVisible(true);
                    this.getView().byId("idpanel2").setVisible(false);
                    if (oUserScopeJModelData.hasCustomerCreateAccess) {
                        this.getView().byId("_IDButtonCreateRecord").setVisible(true);
                    }
                    this.getView().byId("idDemolished_site_CC").setVisible(false);
                    this.getView().byId("_IDButtonEditRecord").setVisible(false);
                 //   this.getView().byId("_IDGenButtonCreateSp").setVisible(false);
                    //this.getView().byId("idButtonView").setVisible(false);
                    this.getView().byId("idButtonOpentext").setVisible(false);
                    this.getView().byId("idButtonCreateServiceTicket").setVisible(false);
                    this.getView().byId("_IDGenButtonDisplaySp").setVisible(false);
                } else if (superior_flag == "") { // display child
                    this.getView().byId("idpanel").setVisible(false);
                    this.getView().byId("idpanel2").setVisible(true);
                    // if (this.hasRecordCreateAccess) {
                    //     this.getView().byId("_IDButtonCreateRecord").setVisible(true);
                    // }
                    if (oUserScopeJModelData.hasCustomerCreateAccess) {
                        this.getView().byId("idButtonCreateServiceTicket").setVisible(true);
                    }
                    if (oUserScopeJModelData.hasCustomerEditAccess) {
                        this.getView().byId("_IDButtonEditRecord").setVisible(true);
                        this.getView().byId("idDemolished_site_CC").setVisible(true);
                    }
                    this.getView().byId("_IDButtonCreateRecord").setVisible(false);
                    //   this.getView().byId("idPageSecEmerContact_DC").setVisible(true);


                    this.getView().byId("idButtonOpentext").setVisible(true);
                    this.getCustomerAttribute();
                }
                //else if (currentScope == "cd_display_limited" && superior_flag == "") {
                //     this.getView().byId("idpanel").setVisible(false);
                //     this.getView().byId("idpanel2").setVisible(true);
                //     this.getView().byId("idPageSecEmerContact_DC").setVisible(false);
                // }

                

            },

            onSpecialsExist: function (specialsFlag) {
                let oUserScopeJModelData = this.getOwnerComponent().getModel("oUserScopeJModel").getData();
                console.log(oUserScopeJModelData);
              
                if (specialsFlag) { //specials exist, show display specials button

                 //   this.getView().byId("_IDGenButtonCreateSp").setVisible(false);
                    if (oUserScopeJModelData.hasSpecialsDisplayAccess) {
                        this.getView().byId("_IDGenButtonDisplaySp").setVisible(true);
                    }
                }
                else {//specials does not exist, show create specials button
                    if (oUserScopeJModelData.hasSpecialsCreateAccess) {
                  //      this.getView().byId("_IDGenButtonCreateSp").setVisible(true);
                    }
                    this.getView().byId("_IDGenButtonDisplaySp").setVisible(false);
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
            //**********************Editing Customer**********************************/
            onEditCustomerAttribute: function () {
                this.oEditFlag = "X";
                var oRecord = this.getView().getModel("oCustomerAttributesJModel").getData();
                if (oRecord.dc === "X") {
                    this.getView().byId("idDCPLIND_CC").setSelectedIndex(0)
                }
                if (oRecord.pl === "X") {
                    this.getView().byId("idDCPLIND_CC").setSelectedIndex(1)
                }
                if (oRecord.na === "X") {
                    this.getView().byId("idDCPLIND_CC").setSelectedIndex(2)
                }

                if (oRecord.dc2 === "X") {
                    this.getView().byId("idDCPLIND_CC2").setSelectedIndex(0)
                }
                if (oRecord.pl2 === "X") {
                    this.getView().byId("idDCPLIND_CC2").setSelectedIndex(1)
                }
                if (oRecord.na2 === "X") {
                    this.getView().byId("idDCPLIND_CC2").setSelectedIndex(2)
                }

                //for Generation Radio button
                // if (oRecord.on_site_emerg === "X") {
                //     this.getView().byId("idGeneration_CC").setSelectedKey(0)
                // }
                // if (oRecord.on_site_part ==="X") {
                //     this.getView().byId("idGeneration_CC").setSelectedIndex(1)
                // }
                // if (oRecord.full_generation ==="X") {
                //     this.getView().byId("idGeneration_CC").setSelectedIndex(2)
                // }
                // if (oRecord.on_site_nosg ==="X") {
                //     this.getView().byId("idGeneration_CC").setSelectedIndex(3)
                // }
                if (oRecord.on_site_emerg === "X") {
                    this.getView().byId("idGeneration_CC").setSelectedKey("EMERGENCY")
                }
                if (oRecord.on_site_part==="X") {
                    this.getView().byId("idGeneration_CC").setSelectedKey("PARTIAL")
                }
                if (oRecord.full_generation ==="X") {
                    this.getView().byId("idGeneration_CC").setSelectedKey("FULL GENERATION")
                }
                if (oRecord.on_site_nosg ==="X") {
                    this.getView().byId("idGeneration_CC").setSelectedKey("NO ON-SITE GENERATION")
                }

                let oUserScopeJModelData = this.getOwnerComponent().getModel("oUserScopeJModel").getData();
                this.getView().byId("_IDButtonCreateRecord").setText("Update Record");
                this.getView().byId("idpanel").setVisible(true);
                this.getView().byId("idpanel2").setVisible(false);
                if (oUserScopeJModelData.hasCustomerCreateAccess) {
                    this.getView().byId("_IDButtonCreateRecord").setVisible(true);
                }
                this.getView().byId("_IDButtonEditRecord").setVisible(false);
                this.getView().byId("idButtonCreateServiceTicket").setVisible(false);
                this.getView().byId("idButtonOpentext").setVisible(false);


            },


            //*******************************F4 Help for Substation**********************/

            onHelpSubstation: function (oEvt) {
                var sPath = this.getOwnerComponent().getModel("ISUService").sServiceUrl + "/substation_dropdownSet";
                var oSubstationJModel = this.getView().getModel("oSubstationJModel");
                oSubstationJModel.loadData(sPath, null, false, "GET", false, false, null);

                var _valueHelpSubstationDialog = new sap.m.SelectDialog({

                    title: "Substation", contentHeight: "50%", titleAlignment: "Center",
                    items: {
                        path: "/d/results",
                        template: new sap.m.StandardListItem({
                            title: "{substation}",
                            description: "",
                            customData: [new sap.ui.core.CustomData({
                                key: "Key",
                                value: "{substation}"
                            })]

                        })
                    },
                    liveChange: function (oEvent) {
                        var sValue = oEvent.getParameter("value");
                        var oFilter = new sap.ui.model.Filter("substation", sap.ui.model.FilterOperator.Contains, sValue);
                        oEvent.getSource().getBinding("items").filter([oFilter]);
                    },
                    confirm: [this._handleSubstationClose, this],
                    cancel: [this._handleSubstationClose, this]
                });
                _valueHelpSubstationDialog.setModel(oSubstationJModel);
                _valueHelpSubstationDialog.open();
            },

            _handleSubstationClose: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (oSelectedItem) {
                    this.objSubstation = oSelectedItem.getBindingContext().getObject();
                    this.getView().byId("idSubstation_CC").setValue(oSelectedItem.getTitle());
                    this.getView().byId("idCircuit_CC").setValue();
                }
            },

            //*******************************F4 Help for Substation2**********************/

            onHelpSubstation2: function (oEvt) {
                var sPath = this.getOwnerComponent().getModel("ISUService").sServiceUrl + "/substation_dropdownSet";
                var oSubstationJModel2 = this.getView().getModel("oSubstationJModel2");
                this.oBusyIndicator.open();
                oSubstationJModel2.loadData(sPath, null, false, "GET", false, false, null);
                this.oBusyIndicator.close();
                var _valueHelpSubstationDialog2 = new sap.m.SelectDialog({

                    title: "Substation", contentHeight: "50%", titleAlignment: "Center",
                    items: {
                        path: "/d/results",
                        template: new sap.m.StandardListItem({
                            title: "{substation}",
                            description: "",
                            customData: [new sap.ui.core.CustomData({
                                key: "Key",
                                value: "{substation}"
                            })]

                        })
                    },
                    liveChange: function (oEvent) {
                        var sValue = oEvent.getParameter("value");
                        var oFilter = new sap.ui.model.Filter("substation", sap.ui.model.FilterOperator.Contains, sValue);
                        oEvent.getSource().getBinding("items").filter([oFilter]);
                    },
                    confirm: [this._handleSubstationClose2, this],
                    cancel: [this._handleSubstationClose2, this]
                });
                _valueHelpSubstationDialog2.setModel(oSubstationJModel2);
                _valueHelpSubstationDialog2.open();
            },

            _handleSubstationClose2: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (oSelectedItem) {
                    this.objSubstation = oSelectedItem.getBindingContext().getObject();
                    this.getView().byId("idSubstation2_CC2").setValue(oSelectedItem.getTitle());
                    this.getView().byId("idCircuit2_CC").setValue();
                }
            },

            //************************F4 Help for Circuit*********************************/
            onHelpCircuit: function (oEvt) {
                var oSubstation = this.getView().byId("idSubstation_CC").getValue();
                if (oSubstation === "") {
                    sap.m.MessageBox.show(this.getView().getModel("i18n").getProperty("text_note_mandatory"), {
                        icon: sap.m.MessageBox.Icon.WARNING,
                        title: this.getView().getModel("i18n").getProperty("error"),
                        actions: [sap.m.MessageBox.Action.OK]
                    });
                    this.getView().byId("idCircuit_CC").setValue();
                    return;
                }

                this.oDCPLIND = this.getView().byId("idDCPLIND_CC").getSelectedButton().getText();
                var sPath = this.getOwnerComponent().getModel("ISUService").sServiceUrl + "/circuit_dropdownSet";
                var oCircuitJModel = this.getView().getModel("oCircuitJModel");
                    this.oBusyIndicator.open();
                    oCircuitJModel.loadData(sPath, null, false, "GET", false, false, null);
                    this.oBusyIndicator.close();
                    // Create filters
                var oFilterSubstation = new sap.ui.model.Filter("substation", sap.ui.model.FilterOperator.EQ, oSubstation);
                var oFilterDCPLIND = new sap.ui.model.Filter("dc_pl", sap.ui.model.FilterOperator.EQ, this.oDCPLIND);
                // Combine filters
                var oFiltersF = [oFilterSubstation, oFilterDCPLIND];


                var _valueHelpCircuitDialog = new sap.m.SelectDialog({

                    title: "Circuit", contentHeight: "50%", titleAlignment: "Center",
                    items: {
                        path: "/d/results",
                        template: new sap.m.StandardListItem({
                            title: "{circuit}",
                            description: "",
                            customData: [new sap.ui.core.CustomData({
                                key: "Key",
                                value: "{circuit}"
                            })]

                        })
                    },
                    liveChange: function (oEvent) {
                        var sValue = oEvent.getParameter("value");
                        var oFilter = new sap.ui.model.Filter("circuit", sap.ui.model.FilterOperator.Contains, sValue);
                        oEvent.getSource().getBinding("items").filter([oFilter]);
                    },
                    confirm: [this._handleCircuitClose, this],
                    cancel: [this._handleCircuitClose, this]
                });
                _valueHelpCircuitDialog.setModel(oCircuitJModel);
                //Apply Filters
                var oCircuit = _valueHelpCircuitDialog.getBinding("items");
                oCircuit.filter([oFiltersF]);
                _valueHelpCircuitDialog.open();
            },

            _handleCircuitClose: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (oSelectedItem) {
                    this.obj = oSelectedItem.getBindingContext().getObject();
                    this.getView().byId("idCircuit_CC").setValue(oSelectedItem.getTitle());
                }
            },

            //************************F4 Help for Circuit2*********************************/
            onHelpCircuit2: function (oEvt) {
                var oSubstation2 = this.getView().byId("idSubstation2_CC2").getValue();
                if (oSubstation2 === "") {
                    sap.m.MessageBox.show(this.getView().getModel("i18n").getProperty("text_note_mandatory"), {
                        icon: sap.m.MessageBox.Icon.WARNING,
                        title: this.getView().getModel("i18n").getProperty("error"),
                        actions: [sap.m.MessageBox.Action.OK]
                    });
                    this.getView().byId("idCircuit2_CC").setValue();
                    return;
                }

                this.oDCPLIND2 = this.getView().byId("idDCPLIND_CC2").getSelectedButton().getText();
                var sPath = this.getOwnerComponent().getModel("ISUService").sServiceUrl + "/circuit_dropdownSet";
                var oCircuitJModel2 = this.getView().getModel("oCircuitJModel2");
                    this.oBusyIndicator.open();    
                    oCircuitJModel2.loadData(sPath, null, false, "GET", false, false, null);
                    this.oBusyIndicator.close();
                // Create filters
                var oFilterSubstation2 = new sap.ui.model.Filter("substation", sap.ui.model.FilterOperator.EQ, oSubstation2);
                var oFilterDCPLIND2 = new sap.ui.model.Filter("dc_pl", sap.ui.model.FilterOperator.EQ, this.oDCPLIND2);
                // Combine filters
                var oFiltersF2 = [oFilterSubstation2, oFilterDCPLIND2];


                var _valueHelpCircuitDialog2 = new sap.m.SelectDialog({

                    title: "Circuit", contentHeight: "50%", titleAlignment: "Center",
                    items: {
                        path: "/d/results",
                        template: new sap.m.StandardListItem({
                            title: "{circuit}",
                            description: "",
                            customData: [new sap.ui.core.CustomData({
                                key: "Key",
                                value: "{circuit}"
                            })]

                        })
                    },
                    liveChange: function (oEvent) {
                        var sValue = oEvent.getParameter("value");
                        var oFilter = new sap.ui.model.Filter("circuit", sap.ui.model.FilterOperator.Contains, sValue);
                        oEvent.getSource().getBinding("items").filter([oFilter]);
                    },
                    confirm: [this._handleCircuitClose2, this],
                    cancel: [this._handleCircuitClose2, this]
                });
                _valueHelpCircuitDialog2.setModel(oCircuitJModel2);
                //Apply Filters
                var oCircuit2 = _valueHelpCircuitDialog2.getBinding("items");
                oCircuit2.filter([oFiltersF2]);
                _valueHelpCircuitDialog2.open();
            },

            _handleCircuitClose2: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (oSelectedItem) {
                    this.obj = oSelectedItem.getBindingContext().getObject();
                    this.getView().byId("idCircuit2_CC").setValue(oSelectedItem.getTitle());
                }
            },

            //**************************Get Cutomer Attrubutes***********************/
            getCustomerAttribute: function () {
                var that = this;
                var oConnectionObject = this.getOwnerComponent().getModel("oCustomerAttributesJModel").oData.conn_obj;
                this.getDocumentumURL();
                this.fetchSpecialsRecord(oConnectionObject);
                var oCustomerAttributesJModel = this.getOwnerComponent().getModel("oCustomerAttributesJModel");
                this.getOwnerComponent().getModel("ISUService").read("/Customer_attributeSet(conn_obj='" + oConnectionObject + "')", {
                    success: function (oData) {
                        oCustomerAttributesJModel.setData(oData);
                        that.DocumentumDisabled(oData);
                    },
                    error: function (error) {
                        sap.m.MessageBox.show(
                            error.message, {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: "Error",
                            actions: [sap.m.MessageBox.Action.OK]
                        });
                        oCustomerAttributesJModel.setData([]);
                    }
                });
            },

            DocumentumDisabled: function (oData) {
                var oRecord = this.getOwnerComponent().getModel("oCustomerAttributesJModel").getData();
                if (oRecord.on_site_emerg === "X") {
                    this.getView().byId("idGeneration_DC").setText("EMERGENCY")
                }
                if (oRecord.on_site_part==="X") {
                    this.getView().byId("idGeneration_DC").setText("PARTIAL")
                }
                if (oRecord.full_generation ==="X") {
                    this.getView().byId("idGeneration_DC").setText("FULL GENERATION")
                }
                if (oRecord.on_site_nosg ==="X") {
                    this.getView().byId("idGeneration_DC").setText("NO ON-SITE GENERATION")
                }
                // if (oData.circuit === "") {
                //     this.getView().byId("idCircuitlink").setEnabled(false);
                // } else {
                //     this.getView().byId("idCircuitlink").setEnabled(true);
                // }

                if (oData.circuit_doc_id === "") {
                    this.getView().byId("idCircuitDoc_idlink").setEnabled(false);
                } else {
                    this.getView().byId("idCircuitDoc_idlink").setEnabled(true);
                }

                if (oData.doc_id === "") {
                    this.getView().byId("idpswdocidlink").setEnabled(false);
                } else {
                    this.getView().byId("idpswdocidlink").setEnabled(true);
                }

                // if (oData.circuit2 === "") {
                //     this.getView().byId("idCircuitlink2").setEnabled(false);
                // } else {
                //     this.getView().byId("idCircuitlink2").setEnabled(true);
                // }

                if (oData.circuit_doc_id2 === "") {
                    this.getView().byId("idCircuitDoc_idlink2").setEnabled(false);
                } else {
                    this.getView().byId("idCircuitDoc_idlink2").setEnabled(true);
                }

                if (oData.doc_id2 === "") {
                    this.getView().byId("idpswdocidlink2").setEnabled(false);
                } else {
                    this.getView().byId("idpswdocidlink2").setEnabled(true);
                }
            },

            //****************************DC/PL/IND Logic ****************************** */
            onDCPLINDSelect: function () {
                var oSelected = this.oView.byId("idDCPLIND_CC").getSelectedButton();
                this.oDCPLIND = oSelected.getText();
                if (this.oDCPLIND === "IND") {
                    this.oView.byId("idTrans_CC").setVisible(true);
                    this.getView().byId("idCircuit_CC").setEnabled(false);
                    this.getView().byId("idCircuit_CC").setValue();
                } else {
                    this.oView.byId("idTrans_CC").setVisible(false);
                    this.oView.byId("idTrans_CC").setValue();
                    this.getView().byId("idCircuit_CC").setEnabled(true);

                }
            },

            onDCPLINDSelect2: function () {
                var oSelected = this.oView.byId("idDCPLIND_CC2").getSelectedButton();
                this.oDCPLIND2 = oSelected.getText();
                if (this.oDCPLIND2 === "IND") {
                    this.oView.byId("idTrans_CC2").setVisible(true);
                    this.getView().byId("idCircuit2_CC").setEnabled(false);
                    this.getView().byId("idCircuit2_CC").setValue();
                } else {
                    this.oView.byId("idTrans_CC2").setVisible(false);
                    this.oView.byId("idTrans_CC2").setValue();
                    this.getView().byId("idCircuit2_CC").setEnabled(true);

                }
            },
            //**************************Open OPEN TEXT URL **************************************************************/
            fetchDestinationURL: async function (destName, parameter) {
                var that = this;
                var omodel = this.getOwnerComponent().getModel();
                var oOperation = omodel.bindContext("/fetchDestinationURL(...)");
                oOperation.setParameter("destName", destName);
                await oOperation.execute().then(function (res) {
                    var oResults = oOperation.getBoundContext().getObject();
                    console.log(oResults.value);
                    const destinationURL = oResults.value;
                    if (destName === "OpenText") {
                        const launchOTURL = destinationURL + parameter + "&language=EN";
                        console.log(launchOTURL);
                        window.open(launchOTURL, '_blank');
                    } else if (destName === "PSO_DocID") {
                        that.PSOdocURL = oResults.value;
                        console.log(that.PSOdocURL);
                    }

                    //return oResults.value;                    
                }.bind(this), function (err) {
                    //        oBusyDialog3.close();
                    MessageBox.error(err.message);
                }.bind(this))
            },
            getDocumentumURL: async function () {
                await this.fetchDestinationURL("PSO_DocID");
                console.log("got url as : " + this.PSOdocURL);
            },
            launchOpentextURL: async function () {
                // const connection_object = "5110267589";
                const connection_object = this.getView().getModel("oCustomerAttributesJModel").getData().conn_obj;
                await this.fetchDestinationURL("OpenText", connection_object);
            },

            //****************Submit Customer Attrubutes****************************************/
            createCustomerDetails: function () {
                var that = this;
                var oStreetNo = this.getView().byId("idStreetno_CC").getValue();
                var oStreetAdd = this.getView().byId("idStreetAdd_CC").getValue();
                var oCustName = this.getView().byId("idCustomerName_CC").getValue();
                if (oStreetNo === "" || oStreetAdd === "" || oCustName === "") {
                    sap.m.MessageBox.show(this.getView().getModel("i18n").getProperty("document_note_mandatory"), {
                        icon: sap.m.MessageBox.Icon.WARNING,
                        title: this.getView().getModel("i18n").getProperty("error"),
                        actions: [sap.m.MessageBox.Action.OK]
                    });
                    return;
                }

                var CustomerAttributesList = [];
                var oCustomerAttributes1 = this.getView().getModel("oCustomerAttributesJModel").getData();
                var oUserScope = this.getOwnerComponent().getModel("oUserScopeJModel").getData();
                var userid = "";
                if (oUserScope.userName !== "" || oUserScope.userName !== undefined || oUserScope.userName !== null) {
                    userid = oUserScope.userName;
                }
                
                var oSelectedKey = this.getView().byId("idDCPLIND_CC").getSelectedIndex();
                var oDC = "", oPL = "", oNA = "";
                if (oSelectedKey === 0) {
                    oDC = "X";
                } else if (oSelectedKey === 1) {
                    oPL = "X";
                } else {
                    oNA = "X";
                }
                var oSelectedKey2 = this.getView().byId("idDCPLIND_CC2").getSelectedIndex();
                var oDC2 = "", oPL2 = "", oNA2 = "";
                if (oSelectedKey2 === 0) {
                    oDC2 = "X";
                } else if (oSelectedKey2 === 1) {
                    oPL2 = "X";
                } else {
                    oNA2 = "X";
                }
                //Generation Radio buttons
                // var oSelectedKeyGen = this.getView().byId("idGeneration_CC").getSelectedIndex();
                // var oEmergency = "", oPartial = "", oFullGen = "", oNoOnsiteGen = "";

                // if (oSelectedKeyGen === 0) {
                //     oEmergency = "X";
                // } else if (oSelectedKeyGen === 1) {
                //     oPartial = "X";
                // } else if (oSelectedKeyGen === 2) {
                //     oFullGen = "X";
                // } else {
                //     oNoOnsiteGen = "X";
                // }
                var oSelectedKeyGen = this.getView().byId("idGeneration_CC").getSelectedKey();
                var oEmergency = "", oPartial = "", oFullGen = "", oNoOnsiteGen = "";

                if (oSelectedKeyGen === "EMERGENCY") {
                    oEmergency = "X";
                } else if (oSelectedKeyGen === "PARTIAL") {
                    oPartial = "X";
                } else if (oSelectedKeyGen === "FULL GENERATION") {
                    oFullGen = "X";
                } else if(oSelectedKeyGen === "NO ON-SITE GENERATION"){
                    oNoOnsiteGen = "X";
                }
                var oNooflines = this.getView().byId("idNoOfline_CC").getSelectedKey();
                var oServiceCentre = this.getView().byId("idSrvCenter_CC").getSelectedKey();
                var oPrimerySrvRep = this.getView().byId("idPSR_CC").getSelectedKey();
                var oProact1 = this.getView().byId("idProEqp1_CC").getSelectedKey();
                var oProact1_2 = this.getView().byId("idProEqp1_CC2").getSelectedKey();
                var oProact2 = this.getView().byId("idProEqp2_CC").getSelectedKey();
                var oProact2_2 = this.getView().byId("idProEqp2_CC2").getSelectedKey();
                var oThrowovertyp = this.getView().byId("idThrowoverTyp_CC").getSelectedKey();
                var oThrowovertyp2 = this.getView().byId("idThrowoverTyp2_CC").getSelectedKey();
                var oServicetype = this.getView().byId("idServiceType_CC").getSelectedKey();
                var oServicetype2 = this.getView().byId("idServiceType2_CC").getSelectedKey();
                var Comments = this.getView().byId("idComents_CC").getValue();
                var Comments2 = this.getView().byId("idComents2_CC").getValue();
                var oDemoSiteChecked = this.getView().byId("idDemolished_site_CC").getSelected();
                var oDemoSite = "";
                if (oDemoSiteChecked === true) {
                    oDemoSite = "X";
                }

                var oAttributs = {};
                oAttributs.conn_obj = oCustomerAttributes1.conn_obj;
                oAttributs.cust_name = oCustomerAttributes1.cust_name;
                //Attributs.mail_name = oCustomerAttributes1.mail_name;
                oAttributs.street_no = oCustomerAttributes1.street_no;
                oAttributs.street_name = oCustomerAttributes1.street_name;
                oAttributs.city = oCustomerAttributes1.city;
                oAttributs.zip_code = oCustomerAttributes1.zip_code;
                oAttributs.no_of_lines = oNooflines;
                oAttributs.srv_center = oServiceCentre;
                oAttributs.psr = oPrimerySrvRep;
                //oAttributs.acc_rep = oCustomerAttributes1.acc_rep;
                oAttributs.emer_cont_name = oCustomerAttributes1.emer_cont_name;
                oAttributs.emer_title = oCustomerAttributes1.emer_title;
                oAttributs.emer_phone = oCustomerAttributes1.emer_phone;
                oAttributs.psw = oCustomerAttributes1.psw;
                oAttributs.on_site_emerg = oEmergency;
                oAttributs.on_site_part = oPartial;
                oAttributs.on_site_nosg = oNoOnsiteGen;
                oAttributs.full_generation = oFullGen;
                oAttributs.generation = oCustomerAttributes1.generation;
                oAttributs.pso_site = "";
                oAttributs.demo_site = oDemoSite;
                oAttributs.dc = oDC;
                oAttributs.pl = oPL;
                oAttributs.na = oNA;
                oAttributs.sub_station = oCustomerAttributes1.sub_station;
                oAttributs.indus_cust = oCustomerAttributes1.indus_cust;
                oAttributs.circuit = oCustomerAttributes1.circuit;
                oAttributs.circuit_doc_id = oCustomerAttributes1.circuit_doc_id;
                oAttributs.sketch_no = oCustomerAttributes1.sketch_no;
                oAttributs.cable_no = oCustomerAttributes1.cable_no;
                oAttributs.throw_type = oThrowovertyp;
                oAttributs.prot_equip1 = oProact1;
                oAttributs.prot_equip2 = oProact2;
                oAttributs.srv_type = oServicetype;
                oAttributs.sect_point = oCustomerAttributes1.sect_point;
                oAttributs.doc_id = oCustomerAttributes1.doc_id;
                oAttributs.comments = Comments;
                oAttributs.dc2 = oDC2;
                oAttributs.pl2 = oPL2;
                oAttributs.na2 = oNA2;
                oAttributs.sub_station2 = oCustomerAttributes1.sub_station2;
                oAttributs.indus_cust2 = oCustomerAttributes1.indus_cust2;
                oAttributs.circuit2 = oCustomerAttributes1.circuit2;
                oAttributs.circuit_doc_id2 = oCustomerAttributes1.circuit_doc_id2;
                oAttributs.sketch_no2 = oCustomerAttributes1.sketch_no2;
                oAttributs.cable_no2 = oCustomerAttributes1.cable_no2;
                oAttributs.throw_type2 = oThrowovertyp2;
                oAttributs.prot_equip1_2 = oProact1_2;
                oAttributs.prot_equip2_2 = oProact2_2;
                oAttributs.srv_type2 = oServicetype2;
                oAttributs.sect_point2 = oCustomerAttributes1.sect_point2;
                oAttributs.doc_id2 = oCustomerAttributes1.doc_id2;
                oAttributs.comments2 = Comments2;
                if (this.oEditFlag == "X") {
                    oAttributs.modified_by = userid;
                } else {
                    oAttributs.created_by = userid;
                }


                if (this.oEditFlag == "X") {
                    that.oBusyIndicator.open();
                    this.getOwnerComponent().getModel("ISUService").update("/Customer_attributeSet('" + oAttributs.conn_obj + "')", oAttributs, {
                        method: "PUT",
                        success: function (oData, oResponse) {
                            that.oBusyIndicator.close();
                            if (oResponse.statusCode === "204") {
                                var oMessage = JSON.parse(oResponse.headers["sap-message"]);

                                var dialog = new sap.m.Dialog({
                                    title: "Success",
                                    type: 'Message',
                                    state: 'Success',
                                    content: new sap.m.Text({
                                        text: oMessage.message
                                    }),
                                    endButton: new sap.m.Button({
                                        text: "OK",
                                        press: function () {
                                            dialog.close();
                                            window.history.go(-1);
                                        }
                                    }),
                                    afterClose: function () {
                                        dialog.destroy();
                                    }
                                });
                                dialog.open();
                            } else {
                                that.oBusyIndicator.close();
                                sap.m.MessageBox.show(oResponse.statusText, {
                                    icon: sap.m.MessageBox.Icon.ERROR,
                                    title: this.getView().getModel("i18n").getProperty("error"),
                                    actions: [sap.m.MessageBox.Action.OK]
                                });
                            }


                        },

                        error: function (error) {
                            that.oBusyIndicator.close();
                            var oError = JSON.parse(error.responseText);
                            var oMessage = oError.error.message.value;
                            sap.m.MessageBox.show(
                                oMessage, {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: "Error",
                                actions: [sap.m.MessageBox.Action.OK]
                            });

                        }
                    });
                } else {
                    that.oBusyIndicator.open();
                    this.getOwnerComponent().getModel("ISUService").create("/Customer_attributeSet", oAttributs, {
                        success: function (oData, oResponse) {
                            that.oBusyIndicator.close();
                            var oMessage = JSON.parse(oResponse.headers["sap-message"]);
                            if (oResponse.statusCode === "201") {

                                var dialog = new sap.m.Dialog({
                                    title: "Success",
                                    type: 'Message',
                                    state: 'Success',
                                    content: new sap.m.Text({
                                        text: oMessage.message
                                    }),
                                    endButton: new sap.m.Button({
                                        text: "OK",
                                        press: function () {
                                            dialog.close();
                                            window.history.go(-1);
                                        }
                                    }),
                                    afterClose: function () {
                                        dialog.destroy();
                                    }
                                });
                                dialog.open();


                            } else {
                                that.oBusyIndicator.close();
                                sap.m.MessageBox.show(oMessage.message, {
                                    icon: sap.m.MessageBox.Icon.ERROR,
                                    title: this.getView().getModel("i18n").getProperty("error"),
                                    actions: [sap.m.MessageBox.Action.OK]
                                });
                            }


                        },

                        error: function (error) {
                            that.oBusyIndicator.close();
                            var oError = JSON.parse(error.responseText);
                            var oMessage = oError.error.message.value
                            sap.m.MessageBox.show(
                                oMessage, {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: "Error",
                                actions: [sap.m.MessageBox.Action.OK]
                            });

                        }
                    });
                }
            },



            //********************************Navigate to privious page**************************/
            //Navigate to privious page
            onBack: function (oEvent) {
                //var oRouter=sap.ui.core.UIComponent.getRouterFor(this);
                //oRouter.navTo("View1");
                window.history.go(-1);
            },

            onCreateSpecials: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("CustomerSpecials");
            },

            onDiplaySpecials: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("CustomerSpecials");
            },

            fetchSpecialsRecord: async function (connection_object) {
                var omodel = this.getOwnerComponent().getModel();
                var oSpecialsjmodel = this.getOwnerComponent().getModel("oSpecialsjmodel");
                var oOperation = omodel.bindContext("/getSpecialsRecord(...)");
                oOperation.setParameter("connection_object", connection_object);
                var that = this;
                await oOperation.execute().then(function (res) {
                    var oResults = oOperation.getBoundContext().getObject();
                    console.log(oResults);
                    if (oResults && oResults.value) { //specials exist - display special button visible
                        console.log(oResults.value);
                        //bind to local model
                        oSpecialsjmodel.setData(oResults.value);

                        // display special should come
                        that.onSpecialsExist(true);
                    }
                    else { //specials does not exist - create special button visible
                        console.log("No Specials exist for this child connection object");
                        const oCustomerAttributesJModelData= that.getOwnerComponent().getModel("oCustomerAttributesJModel").getData();
                        const connection_object = oCustomerAttributesJModelData.conn_obj;
                        //const connection_object = that.getOwnerComponent().getModel("oCustomerAttributesJModel").getData().conn_obj;
                        //create special should come
                        oSpecialsjmodel.setData({
                            "connection_object": connection_object,
                            "work_desc": "",
                            "meter_number": "",
                            "record_status": "",
                            "workflow_id": null,
                            //Customer Record(CR)
                            "pSNumber": "",
                            "completionDate": "",
                            "fedFrom": "",
                            "cableDescription": "",
                            "cableFootage": "",
                            "ductType": "",
                            "cts": "",
                            "pts": "",
                            "k": "",
                            "m": "",
                            "fusesAt": "",
                            "size": "",
                            "typeCR": "",
                            "curve": "",
                            "voltage": "",

                            //Load Break Disconnect(LBD)
                            "manufacturer": "",
                            "model": "",
                            "continuousCurrent": "",
                            "loadIntRating": "",
                            "kAMomentaryLBD": "",
                            "typeLBD": "",
                            "faultClosing": "",
                            "bilLBD": "",
                            "serviceVoltage": "",
                            "CycWithstand60": "",

                            //Circuit Breaker(CB)
                            "circuitBreakerMake": "",
                            "serialNo": "",
                            "kAMomentaryCB": "",
                            "amps": "",
                            "typeCB": "",
                            "faultDuty": "",
                            "bilCB": "",
                            //new field
                            //Transformer
                            "ownedByTransformer": "DTE Owned",    //Radiobutton

                            //new fields
                            "fuelTypeCB": "Air",
                            "ownedByLBD": "DTE Owned",
                            "ownedByCB": "DTE Owned",
                            "meter_number2": "",
                            "ab": "",
                            "bc": "",
                            "ca": "",
                            "an": "",
                            "bn": "",
                            "cn": "",
                            "groundMatResistance": "",
                            "methodUsed": "",
                            "dateMergered": "",
                            "comment": "",
                            "typeofService": "",
                            "typeofTO": "",
                            "pswDiagramNumber": "",
                            "primaryServiceRep": "",
                            "customerName": oCustomerAttributesJModelData.cust_name,
                            "streetNumber": oCustomerAttributesJModelData.street_no,
                            "streetName": oCustomerAttributesJModelData.street_name,
                            "fuses": [{
                                "fuseSize"  : "",
                                "fuseType" : "",
                                "fuseCurve" : "",
                                "fuseVoltage" : "",
                                "fuseSeqNo": 0,
                                "connection_object"   : connection_object
                            }]


                        });
                        that.onSpecialsExist(false);
                    }

                    console.log("success: = ");
                }.bind(this), function (err) {
                    //        oBusyDialog3.close();
                    console.log("failure: = " + err.message);
                    //   MessageBox.error(err.message);
                }.bind(this))
            },
            //**************************Demolished Check*****************************/
            onDemolishedChecked: function (oEvent) {
                var oMessage = "";
                var that = this;
                var oChecked = this.getView().byId("idDemolished_site_CC").getSelected();
                if (oChecked === true) {
                    oMessage = this.getView().getModel("i18n").getProperty("Demolished_Checked_msg");
                } else {
                    oMessage = this.getView().getModel("i18n").getProperty("Demolished_UnChecked_msg");
                }
                var dialog = new sap.m.Dialog({
                    title: "Confirmation",
                    type: 'Message',
                    state: 'Information',
                    titleAlignment: 'Center',
                    content: new sap.m.Text({
                        text: oMessage
                    }),
                    beginButton: new sap.m.Button({
                        text: "Yes",
                        press: function (oEvt) {
                            if (oChecked === true && oEvt.getSource().getText() === "Yes") {
                                that.getView().byId("idDemolished_site_CC").setSelected(true);
                            } else {
                                that.getView().byId("idDemolished_site_CC").setSelected(false);
                            }

                            dialog.close();
                        }
                    }),
                    endButton: new sap.m.Button({
                        text: "No",
                        press: function (oEvt) {
                            if (oChecked === true && oEvt.getSource().getText() === "No") {
                                that.getView().byId("idDemolished_site_CC").setSelected(false);
                            } else {
                                that.getView().byId("idDemolished_site_CC").setSelected(true);
                            }
                            dialog.close();
                        }
                    }),

                    afterClose: function () {
                        dialog.destroy();
                    }
                });
                dialog.open();

            },

            //**********************Open Documents Url************************/
            // onPressCircuitLink: function () {
            //     var that = this;
            //     var oCircuit = this.getView().byId("idCircuit_DC").getText();
            //     var sUrl = that.PSOdocURL + oCircuit;
            //     window.open(sUrl, "_blank");

            // },
            onPressCircuitDocIdLink: function () {
                var that = this;
                var oCircuitDocId = this.getView().byId("idCircuitDoc_DC").getText();
                var sUrl = that.PSOdocURL + oCircuitDocId;
                window.open(sUrl, "_blank");
            },
            onPressPswDocId: function () {
                var that = this;
                var oPswDocId = this.getView().byId("idPswdocid_DC").getText();
                var sUrl = that.PSOdocURL + oPswDocId;
                window.open(sUrl, "_blank");
            },

            // onPressCircuitLink2: function () {
            //     var that = this;
            //     var oCircuit2 = this.getView().byId("idCircuit2_DC").getText();
            //     var sUrl = that.PSOdocURL + oCircuit2;
            //     window.open(sUrl, "_blank");

            // },
            onPressCircuitDocIdLink2: function () {
                var that = this;
                var oCircuitDocId2 = this.getView().byId("idCircuitDoc2_DC").getText();
                var sUrl = that.PSOdocURL + oCircuitDocId2;
                window.open(sUrl, "_blank");
            },
            onPressPswDocId2: function () {
                var that = this;
                var oPswDocId2 = this.getView().byId("idPswdocid2_DC").getText();
                var sUrl = that.PSOdocURL + oPswDocId2;
                window.open(sUrl, "_blank");
            },



            //****************Invoke this method on Service Ticket Creation****************************************/
            onCreateServiceTicket: function () {
                // create dialog lazily
                if (!this.oSTDialog) {
                    this.oSTDialog = this.loadFragment({
                        name: "com.pso.customerattribute.fragment.CreateServiceTicket"
                    });
                }
                this.oSTDialog.then(function (oDialog) {
                    this.oDialog = oDialog;
                    this.oDialog.open();
                    this.getView().addDependent(this.oDialog);
                }.bind(this));
            },
            onCloseDialog: function () {
                this.oDialog.close();
            },
            getCreateContext: function () {
                let oConnectionObject = this.getOwnerComponent().getModel("oCustomerAttributesJModel").oData.conn_obj;
                let oTicketData = this.getOwnerComponent().getModel("oCustomerAttributesJModel").getData();
                let name = "POO - " + oTicketData.cust_name;
                let dcplind_flag = "", oCircuitTrans = "", oSubstation = "";

                oSubstation = oTicketData.sub_station;
                if (oTicketData.dc === "X") {
                    dcplind_flag = "101";
                    oCircuitTrans = oTicketData.circuit;
                } else if (oTicketData.pl === "X") {
                    dcplind_flag = "111";
                    oCircuitTrans = oTicketData.circuit;
                } else if (oTicketData.na === "X") {
                    dcplind_flag = "112";
                    oCircuitTrans = oTicketData.indus_cust;
                }

                // if(this.oSelectedSetA){
                //     oSubstation = oTicketData.sub_station;
                //     if (oTicketData.dc === "X") {
                //         dcplind_flag = "101";
                //         oCircuitTrans = oTicketData.circuit;
                //     } else if (oTicketData.pl === "X") {
                //         dcplind_flag = "111";
                //         oCircuitTrans = oTicketData.circuit;
                //     } else if (oTicketData.na === "X") {
                //         dcplind_flag = "112";
                //         oCircuitTrans = oTicketData.indus_cust;
                //     }
                // }else if(this.oSelectedSetB){
                //     oSubstation = oTicketData.sub_station2;
                //     if (oTicketData.dc2 === "X") {
                //         dcplind_flag = "101";
                //         oCircuitTrans = oTicketData.circuit2;
                //     } else if (oTicketData.pl2 === "X") {
                //         dcplind_flag = "111";
                //         oCircuitTrans = oTicketData.circuit2;
                //     } else if (oTicketData.na2 === "X") {
                //         dcplind_flag = "112";
                //         oCircuitTrans = oTicketData.indus_cust2;
                //     }
                // }

                let c4cPayload = {
                    "ProcessingTypeCode": "ZUSR",
                    "Name": name,
                    "ServiceIssueCategoryID": "SC_2",
                    "IncidentServiceIssueCategoryID": "IC_5",
                    "ProcessorPartyID": this.oUserId, //user id
                    "InstallationPointID": oConnectionObject,//connection object id
                    "PartyID": oTicketData.c4cpartyid, //new ISU odata field //c4cpartyid
                    "RoleCode": "10",
                    "Z_PSO_City_KUT": oTicketData.city,
                    "Z_PSO_DCPLIND_KUT": dcplind_flag,
                    "Z_PSO_ServiceCenter_KUT": oTicketData.srv_center,
                    "Z_PSO_Substation_KUT": oSubstation,
                    "Z_PSO_Circuit_Trans_KUT": oCircuitTrans,
                    "Z_PSO_PSCableNo_KUT": oTicketData.cable_no,
                    "Z_PSO_StreetAddress_KUT": oTicketData.street_name,
                    "Z_PSO_CustomerName_KUT": oTicketData.cust_name,
                    "Z_PSO_ZIP_KUT": oTicketData.zip_code
                    //"ServiceRequestUserLifeCycleStatusCode": "1"
                };
                //
                return c4cPayload;
            },
            createServiceTicket: async function (oEvent) {
                let oTicketData = this.getOwnerComponent().getModel("oCustomerAttributesJModel").getData();
                //this.oSelectedSetA = this.getView().byId("idSetA").getSelected();
                //this.oSelectedSetB = this.getView().byId("idSetB").getSelected(); 
                var isCircuit = this.getView().byId("idCircuit_ST").getText();
                var isTrans = this.getView().byId("idTrans_ST").getText();
                // var isCircuit="", isTrans="";
                // if(this.oSelectedSetA){
                //     isCircuit = this.getView().byId("idCircuit_ST").getText();
                    // isTrans = this.getView().byId("idTrans_ST").getText();
                // }else if(this.oSelectedSetB){
                //     isCircuit = this.getView().byId("idCircuit_ST1").getText();
                //     isTrans = this.getView().byId("idTrans_ST1").getText();
                // }
                if(oTicketData.na === "X"){
                    if (isTrans === "" || isTrans === null || isTrans === undefined) {
                        sap.m.MessageBox.show(this.getView().getModel("i18n").getProperty("Trans_msg"), {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: "Error",
                            actions: [sap.m.MessageBox.Action.OK]
                        });
                        this.onCloseDialog();
                        return false;
                    }
                }else{
                    if (isCircuit === "" || isCircuit === null || isCircuit === undefined) {
                        sap.m.MessageBox.show(this.getView().getModel("i18n").getProperty("Circuit_msg"), {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: "Error",
                            actions: [sap.m.MessageBox.Action.OK]
                        });
                        this.onCloseDialog();
                        return false;
                    }
                }

                

                var oUserScope = this.getOwnerComponent().getModel("oUserScopeJModel").getData();
                if (oUserScope.userName === "" || oUserScope.userName === undefined || oUserScope.userName === null) {
                    sap.m.MessageBox.show(this.getView().getModel("i18n").getProperty("user_auth_msg"), {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: "Error",
                            actions: [sap.m.MessageBox.Action.OK]
                        });
                        return false;
                }else{
                    this.oUserId = oUserScope.userName;
                }

                var omodel = this.getOwnerComponent().getModel();
                var oOperation = omodel.bindContext("/createServiceTicket(...)");

                var c4cPayload = this.getCreateContext();
                this.oBusyIndicator.open();
                oOperation.setParameter("context", c4cPayload);
                var that = this;
                await oOperation.execute().then(function (res) {
                    var oResults = oOperation.getBoundContext().getObject();
                    console.log(oResults);
                    if (oResults && oResults.value) { //specials exist - display special button visible
                        that.oBusyIndicator.close();
                        console.log(oResults.value);

                        //  MessageFormat.format("This message is for {0} in {1}", "foo", "bar");
                        let msg = "Service Ticket " + oResults.value + " created successfully in C4C. \nPlease save this number for future reference.";
                        //  let msg = "Service Ticket {0} created successfully in C4C. \nPlease save this number for future reference.";

                        sap.m.MessageBox.show(msg, {
                            icon: sap.m.MessageBox.Icon.INFORMATION,
                            title: "Success",
                            actions: [sap.m.MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {
                                that.onCloseDialog();
                            },
                            dependentOn: that.getView()
                        });

                    }
                    this.onCloseDialog();
                    console.log("success: = ticket created");
                }.bind(this), function (err) {
                    that.oBusyIndicator.close();
                    console.log("failure: = " + err.message);
                    sap.m.MessageBox.show("Service Ticket not created", {
                        icon: sap.m.MessageBox.Icon.ERROR,
                        title: "Error",
                        actions: [sap.m.MessageBox.Action.OK]
                    });
                    this.onCloseDialog();
                }.bind(this))
            },

            //********************Capitialize first later of each word *******************/
            onCapitalizeFirtsLater: function (oEvent) {
                var oInput = oEvent.getSource();
                var sValue = oInput.getValue();
                // Capitalize the first letter of each word
                var sCapitalizedValue = this.capitalizeFirstLetterOfEachWord(sValue);
                // Set the formatted value back to the input field
                oInput.setValue(sCapitalizedValue);
            },
            //Captalize first word capital and rest of small.
            capitalizeFirstLetterOfEachWord: function (str) {
                return str
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');
                // return str.replace(/\b\w/g, function (char) {
                //     return char.toUpperCase();
                // });
            },

            //********Radio button SetA and SetB selection */
            oSelectA: function (oEvet) {
                this.getView().byId("idSetB").setSelected(false);
            },
            oSelectB: function (oEvet) {
                this.getView().byId("idSetA").setSelected(false);
            }
        });
    });
