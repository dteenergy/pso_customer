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
            _loadFragmentPerScope: function (currentScope) {

                var superior_flag = this.getOwnerComponent().getModel("oCustomerAttributesJModel").oData.superior_flag;
                if (superior_flag == "X") { //create child
                    this.getView().byId("_IDButtonCreateRecord").setText("Create Record");
                    this.getView().byId("idpanel").setVisible(true);
                    this.getView().byId("idpanel2").setVisible(false);
                    this.getView().byId("_IDButtonCreateRecord").setVisible(true)
                    this.getView().byId("_IDButtonEditRecord").setVisible(false);
                    this.getView().byId("_IDGenButtonCreateSp").setVisible(false);
                    //this.getView().byId("idButtonView").setVisible(false);
                    this.getView().byId("idButtonOpentext").setVisible(false);
                    this.getView().byId("idButtonCreateServiceTicket").setVisible(false);
                    this.getView().byId("_IDGenButtonDisplaySp").setVisible(false);
                } else if (superior_flag == "") { // display child
                    this.getView().byId("idpanel").setVisible(false);
                    this.getView().byId("idpanel2").setVisible(true);
                    this.getView().byId("_IDButtonEditRecord").setVisible(true);
                    this.getView().byId("_IDButtonCreateRecord").setVisible(false);
                    this.getView().byId("idPageSecEmerContact_DC").setVisible(true);
                    this.getView().byId("idButtonCreateServiceTicket").setVisible(true);
                    this.getView().byId("idButtonOpentext").setVisible(true);
                    this.getCustomerAttribute();
                } else if (currentScope == "cd_display_limited" && superior_flag == "") {
                    this.getView().byId("idpanel").setVisible(false);
                    this.getView().byId("idpanel2").setVisible(true);
                    this.getView().byId("idPageSecEmerContact_DC").setVisible(false);
                }

            },

            //**********************Editing Customer*****************************************/
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

                if (oRecord.on_site_emerg === "X") {
                    this.getView().byId("idGeneration_CC").setSelectedIndex(0)
                }
                if (oRecord.on_site_par) {
                    this.getView().byId("idGeneration_CC").setSelectedIndex(1)
                }
                if (oRecord.full_generation) {
                    this.getView().byId("idGeneration_CC").setSelectedIndex(2)
                }
                if (oRecord.on_site_nosg) {
                    this.getView().byId("idGeneration_CC").setSelectedIndex(3)
                }

                this.getView().byId("_IDButtonCreateRecord").setText("Update Record");
                this.getView().byId("idpanel").setVisible(true);
                this.getView().byId("idpanel2").setVisible(false);
                this.getView().byId("_IDButtonCreateRecord").setVisible(true);
                this.getView().byId("_IDButtonEditRecord").setVisible(false);
                this.getView().byId("idButtonCreateServiceTicket").setVisible(false);
                this.getView().byId("idButtonOpentext").setVisible(false);


            },

            onSpecialsExist: function (specialsFlag) {
                if (specialsFlag) { //specials exist, show display specials button

                    this.getView().byId("_IDGenButtonCreateSp").setVisible(false);
                    this.getView().byId("_IDGenButtonDisplaySp").setVisible(true);
                }
                else {//specials does not exist, show create specials button

                    this.getView().byId("_IDGenButtonCreateSp").setVisible(true);
                    this.getView().byId("_IDGenButtonDisplaySp").setVisible(false);
                }
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

            //************************F4 Help for Circuit***********************************/
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
                oCircuitJModel.loadData(sPath, null, false, "GET", false, false, null);
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
                if (oData.circuit === "") {
                    this.getView().byId("idCircuitlink").setEnabled(false);
                } else {
                    this.getView().byId("idCircuitlink").setEnabled(true);
                }

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

                if (oData.circuit2 === "") {
                    this.getView().byId("idCircuitlink2").setEnabled(false);
                } else {
                    this.getView().byId("idCircuitlink2").setEnabled(true);
                }

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
                var oSelectedKey = this.getView().byId("idDCPLIND_CC").getSelectedIndex();
                var oDC = "", oPL = "", oNA = "";
                if (oSelectedKey === 0) {
                    oDC = "X";
                } else if (oSelectedKey === 1) {
                    oPL = "X";
                } else {
                    oNA = "X";
                }

                var oSelectedKeyGen = this.getView().byId("idGeneration_CC").getSelectedIndex();
                var oEmergency = "", oPartial = "", oFullGen = "", oNoOnsiteGen = "";

                if (oSelectedKeyGen === 0) {
                    oEmergency = "X";
                } else if (oSelectedKeyGen === 1) {
                    oPartial = "X";
                } else if (oSelectedKeyGen === 2) {
                    oFullGen = "X";
                } else {
                    oNoOnsiteGen = "X";
                }
                var oNooflines = this.getView().byId("idNoOfline_CC").getSelectedKey();
                var oServiceCentre = this.getView().byId("idSrvCenter_CC").getSelectedKey();
                var oPrimerySrvRep = this.getView().byId("idPSR_CC").getSelectedKey();
                var oProact1 = this.getView().byId("idProEqp1_CC").getSelectedKey();
                var oProact2 = this.getView().byId("idProEqp2_CC").getSelectedKey();
                var oThrowovertyp = this.getView().byId("idThrowoverTyp_CC").getSelectedKey();
                var oServicetype = this.getView().byId("idServiceType_CC").getSelectedKey();
                var Comments = this.getView().byId("idComents_CC").getValue();
                var oDemoSiteChecked = this.getView().byId("idDemolished_site_CC").getSelected();
                var oDemoSite = "";
                if (oDemoSiteChecked === true) {
                    oDemoSite = "X";
                }
                else {
                    oDemoSite = "";
                }

                var oAttributs = {};
                oAttributs.conn_obj = oCustomerAttributes1.conn_obj,
                    oAttributs.cust_name = oCustomerAttributes1.cust_name,
                    //Attributs.mail_name = oCustomerAttributes1.mail_name,
                    oAttributs.street_no = oCustomerAttributes1.street_no,
                    oAttributs.street_name = oCustomerAttributes1.street_name,
                    oAttributs.city = oCustomerAttributes1.city,
                    oAttributs.zip_code = oCustomerAttributes1.zip_code,
                    oAttributs.no_of_lines = oNooflines,
                    oAttributs.srv_center = oServiceCentre,
                    oAttributs.cable_no = oCustomerAttributes1.cable_no,
                    oAttributs.doc_id = oCustomerAttributes1.doc_id,
                    oAttributs.psr = oPrimerySrvRep
                oAttributs.sub_station = oCustomerAttributes1.sub_station,
                    oAttributs.sketch_no = oCustomerAttributes1.sketch_no,
                    oAttributs.circuit = oCustomerAttributes1.circuit,
                    //oAttributs.acc_rep = oCustomerAttributes1.acc_rep,
                    oAttributs.emer_cont_name = oCustomerAttributes1.emer_cont_name,
                    oAttributs.emer_title = oCustomerAttributes1.emer_title,
                    oAttributs.emer_phone = oCustomerAttributes1.emer_phone,
                    oAttributs.sect_point = oCustomerAttributes1.sect_point,
                    oAttributs.dc = oDC,
                    oAttributs.pl = oPL,
                    oAttributs.na = oNA,
                    oAttributs.psw = oCustomerAttributes1.psw,
                    oAttributs.prot_equip1 = oProact1,
                    oAttributs.prot_equip2 = oProact2,
                    oAttributs.throw_type = oThrowovertyp,
                    oAttributs.srv_type = oServicetype,
                    oAttributs.circuit_doc_id = oCustomerAttributes1.circuit_doc_id,
                    oAttributs.on_site_emerg = oEmergency,
                    oAttributs.on_site_part = oPartial,
                    oAttributs.on_site_nosg = oNoOnsiteGen,
                    oAttributs.full_generation = oFullGen,
                    oAttributs.generation = oCustomerAttributes1.generation,
                    oAttributs.pso_site = "",
                    oAttributs.comments = Comments,
                    oAttributs.indus_cust = oCustomerAttributes1.indus_cust,
                    oAttributs.demo_site = oDemoSite;

                if (this.oEditFlag == "X") {
                    this.getOwnerComponent().getModel("ISUService").update("/Customer_attributeSet('" + oAttributs.conn_obj + "')", oAttributs, {
                        method: "PUT",
                        success: function (oData, oResponse) {
                            //that.oBusyIndicator.close()
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
                                sap.m.MessageBox.show(oResponse.statusText, {
                                    icon: sap.m.MessageBox.Icon.ERROR,
                                    title: this.getView().getModel("i18n").getProperty("error"),
                                    actions: [sap.m.MessageBox.Action.OK]
                                });
                            }


                        },

                        error: function (error) {
                            //that.oBusyIndicator.close();
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
                    this.getOwnerComponent().getModel("ISUService").create("/Customer_attributeSet", oAttributs, {
                        success: function (oData, oResponse) {
                            //that.oBusyIndicator.close()
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
                                sap.m.MessageBox.show(oMessage.message, {
                                    icon: sap.m.MessageBox.Icon.ERROR,
                                    title: this.getView().getModel("i18n").getProperty("error"),
                                    actions: [sap.m.MessageBox.Action.OK]
                                });
                            }


                        },

                        error: function (error) {
                            //that.oBusyIndicator.close();
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
                        //create special should come
                        oSpecialsjmodel.setData({
                            "connection_object": that.getOwnerComponent().getModel("oCustomerAttributesJModel").getData().conn_obj,
                            "work_desc": "",
                            "meter_number": ""
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
            onPressCircuitLink: function () {
                var that = this;
                var oCircuit = this.getView().byId("idCircuit_DC").getText();
                var sUrl = that.PSOdocURL + oCircuit;
                window.open(sUrl, "_blank");

            },
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

            onPressCircuitLink2: function () {
                var that = this;
                var oCircuit2 = this.getView().byId("idCircuit2_DC").getText();
                var sUrl = that.PSOdocURL + oCircuit2;
                window.open(sUrl, "_blank");

            },
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
                var c4cPayload = {
                    "ProcessingTypeCode": "ZUSR",
                    "Name": "4002602245",
                    "ServiceIssueCategoryID": "SC_2",
                    "IncidentServiceIssueCategoryID": "IC_5",
                    "ProcessorPartyID": "7000066",
                    "InstallationPointID": "148"
                };
                return c4cPayload;
            },
            createServiceTicket: async function (oEvent) {
                var isCircuit = this.getView().byId("idCircuit_ST").getText();
                if (isCircuit === "" || isCircuit === null || isCircuit === undefined) {
                    sap.m.MessageBox.show("circuit id is not present for this data", {
                        icon: sap.m.MessageBox.Icon.ERROR,
                        title: "Error",
                        actions: [sap.m.MessageBox.Action.OK]
                    });
                    this.onCloseDialog();
                    return false;
                }
                var omodel = this.getOwnerComponent().getModel();
                var oOperation = omodel.bindContext("/createServiceTicket(...)");

                var c4cPayload = this.getCreateContext();
                oOperation.setParameter("context", c4cPayload);
                var that = this;
                await oOperation.execute().then(function (res) {
                    var oResults = oOperation.getBoundContext().getObject();
                    console.log(oResults);
                    if (oResults && oResults.value) { //specials exist - display special button visible
                        console.log(oResults.value);                    
                        let msg = "Service Ticket " + oResults.value + " created successfully in C4C";
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
                    //        oBusyDialog3.close();
                    console.log("failure: = " + err.message);
                    sap.m.MessageBox.show("Service Ticket not created", {
                        icon: sap.m.MessageBox.Icon.ERROR,
                        title: "Error",
                        actions: [sap.m.MessageBox.Action.OK]
                    });
                    this.onCloseDialog();
                }.bind(this))
            }
            // createServiceTicket1: function () {


            //     var that = this;

            //     // Prepare the data to be posted
            //     var c4cPayload = {
            //         "ProcessingTypeCode": "ZUSR",
            //         "Name": "4002602245",
            //         "ServiceIssueCategoryID": "SC_2",
            //         "IncidentServiceIssueCategoryID": "IC_5",
            //         "ProcessorPartyID": "7000066",
            //         "InstallationPointID": "148"
            //         // "ServiceRequestParty": [
            //         //     {
            //         //         "PartyID": "1100233509",
            //         //         "RoleCode": "10"
            //         //     }
            //         // ]

            //     };

            // var credentials = btoa(username + ":" + password);

            // AJAX POST request
            // jQuery.ajax({
            //     url: "https://my357326.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/ServiceRequestCollection",  // URL to your OData service
            //     type: "POST",

            //     data: JSON.stringify(oDatac4c),
            //     // username : "_SCPIODATA",
            //     // password : "Dte@nergy123",
            //     beforeSend: function (xhr) {
            //         xhr.setRequestHeader('Authorization', 'Basic ' + btoa('_SCPIODATA:Dte@nergy123'));
            //     },

            //     //     xhrFields: {
            //     //         withCredentials: true
            //     //    },
            //     headers: {
            //         "Access-Control-Allow-Headers": "*",
            //         "Content-Type": "application/json"
            //     },
            //     success: function (response) {
            //         alert("success to post");
            //     },
            //     error: function (error) {
            //         alert("Error creating entity.");
            //         console.error("Error details:", error);
            //     }
            // });


        });
    });
