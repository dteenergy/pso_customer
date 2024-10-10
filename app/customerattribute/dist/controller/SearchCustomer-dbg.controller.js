sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/pso/customerattribute/utils/Formatter",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/comp/smartvariants/PersonalizableInfo',
    "sap/ui/export/Spreadsheet"
],
    function (Controller, Formatter, Filter, FilterOperator, PersonalizableInfo, Spreadsheet) {
        "use strict";

        return Controller.extend("com.pso.customerattribute.controller.SearchCustomer", {
            onInit: function () {
                this.hasRecordCreateAccess = false;
                this.getUserDetails();
                this.onActivatingStandardFilter(); //Activating standard filters
                this.initializBusyIndicator(); //Initializing busy indicator
                this.fetchDropdownData();

            },
            getUserDetails: async function () {
              //  var that = this;
              //  let userScope = null;
                let oUserScopeJModel = this.getOwnerComponent().getModel("oUserScopeJModel");
                //   oUserScopeJModel.setData(userScope);
                oUserScopeJModel.setData("");

                let omodel = this.getOwnerComponent().getModel();
                let oOperation = omodel.bindContext("/userDetails(...)");

                await oOperation.execute().then(function (res) {
                    let oResults = oOperation.getBoundContext().getObject();
                    console.log(oResults);
                    //userScope = oResults.value;
                    // if(oResults && oResults.value){
                    //     oUserScopeJModel.setData(oResults.value);
                    //     //new code
                    //     for (var i = 0; i < oResults.value.length; i++) {
                    //         if(oResults.value[i].includes("pso_customer_details_create")){
                    //             that.hasRecordCreateAccess = true;
                    //             console.log("has create access")
                    //             break;
                    //         }                                
                    //     }
                    // }
                    // else {
                    //     //role definition incomplete message
                    // }
                    if (oResults) {
                        oUserScopeJModel.setData(oResults);
                    } else {
                        //msg -> assign proper roles
                    }
                }.bind(this), function (err) {
                    //        oBusyDialog3.close();
                    //MessageBox.error(err.message);
                    console.log(err.message);
                }.bind(this))
                // return userScope;
                //this.userScope = userScope;
                //console.log(this.userScope);
                // var oUserScopeJModel = this.getOwnerComponent().getModel("oUserScopeJModel");
                // oUserScopeJModel.setData(this.userScope);
            },


            //******************Activating Standard and customize filter option************/
            onActivatingStandardFilter: function () {
                this.applyData = this.applyData.bind(this);
                this.fetchData = this.fetchData.bind(this);
                this.oSmartVariantManagement = this.getView().byId("svm");
                this.oFilterBar = this.getView().byId("_IDGenFilterBar1");
                this.getFiltersWithValues = this.getFiltersWithValues.bind(this);
                this.oFilterBar.registerFetchData(this.fetchData);
                this.oFilterBar.registerApplyData(this.applyData);
                this.oFilterBar.registerGetFiltersWithValues(this.getFiltersWithValues);
                var oPersInfo = new PersonalizableInfo({
                    type: "filterBar",
                    keyName: "persistencyKey",
                    dataSource: "",
                    control: this.oFilterBar
                });
                this.oSmartVariantManagement.addPersonalizableControl(oPersInfo);
                this.oSmartVariantManagement.initialise(function () { }, this.oFilterBar);
            },

            //Setting selectd value in filters
            applyData: function (aData) {
                aData.forEach(function (oDataObject) {
                    var oControl = this.oFilterBar.determineControlByName(oDataObject.fieldName, oDataObject.groupName);
                    oControl.setValue(oDataObject.fieldData);
                }, this);
            },

            fetchData: function () {
                var aData = this.oFilterBar.getAllFilterItems().reduce(function (aResult, oFilterItem) {
                    aResult.push({
                        groupName: oFilterItem.getGroupName(),
                        fieldName: oFilterItem.getName(),
                        fieldData: oFilterItem.getControl().getValue()
                    });

                    return aResult;
                }, []);

                return aData;
            },

            getFiltersWithValues: function () {
                var aFiltersWithValue = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
                    var oControl = oFilterGroupItem.getControl();

                    if (oControl && oControl.getValue && oControl.getValue().length > 0) {
                        aResult.push(oFilterGroupItem);
                    }

                    return aResult;
                }, []);

                return aFiltersWithValue;
            },
            //********************************End*********************************/

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

            //***************************Fatching Dropdowns Values*************************/
            fetchDropdownData: function () {
                var that = this;
                var dropDownJsonModel = this.getOwnerComponent().getModel("dropDownJsonModel");;
                this.oBusyIndicator.open();
                this.getOwnerComponent().getModel("ISUService").read("/DropdownSet", {
                    //this.oDataModel.read("DropdownSet", {
                    success: function (oData) {
                        that.oBusyIndicator.close()
                        if (oData.results.length > 0) {
                            dropDownJsonModel.setProperty("/DropdownData", oData.results)
                        }
                    },
                    error: function (error) {
                        that.oBusyIndicator.close();
                        sap.m.MessageBox.show(
                            error.message, {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: "Error",
                            actions: [sap.m.MessageBox.Action.OK]
                        });
                        dropDownJsonModel.setData(oData.results);
                    }
                });
            },
            //********************************End*********************************/

            //*************************Fatching Customer Records****************************/  
            fetchItems: function () {
                var that = this;
                var oSearchCustomerJModel = this.getView().getModel("oSearchCustomerJModel");
                var sCustName = this.getView().byId("idcustomer").getValue();
                var sMailingName = this.getView().byId("idMailingname").getValue();
                var sStreetAdd = this.getView().byId("idStreetAdd").getValue();
                var sStreetNo = this.getView().byId("idStreetNo").getValue();
                var sCity = this.getView().byId("idCity").getValue();
                var sZipcode = this.getView().byId("idzipcode").getValue();
                var sNo_of_Lines = this.getView().byId("idNoofline").getValue();
                var sService_center = this.getView().byId("idsrvcenter").getValue();
                var sCable_No = this.getView().byId("idcableno").getValue();
                var sPSW_Diagram = this.getView().byId("idPswdigram").getValue();
                var sPrimery_SR = this.getView().byId("idPrimarySRep").getSelectedKey();
                var sAccount_rep = this.getView().byId("idAcRep").getValue();
                var sSubstation = this.getView().byId("idSubstation").getValue();
                var sSketch_no = this.getView().byId("idSrvSketchno").getValue();
                var sCircuit = this.getView().byId("idCircuit").getValue();
                var sGeneration = this.getView().byId("idOnSiteGeneration").getSelectedKey();

                if (!sCustName && !sMailingName && !sStreetAdd && !sStreetNo && !sCity && !sZipcode
                    && !sNo_of_Lines && !sService_center && !sCable_No && !sPSW_Diagram && !sPrimery_SR && !sAccount_rep
                    && !sSubstation && !sSketch_no && !sCircuit && !sGeneration) {
                    sap.m.MessageBox.show(this.getView().getModel("i18n").getProperty("filter_not_blank"), {
                        icon: sap.m.MessageBox.Icon.ERROR,
                        title: "Error",
                        actions: [sap.m.MessageBox.Action.OK]
                    });
                    return false
                }

                var aFilters = [];
                aFilters.push(new Filter("cust_name", FilterOperator.EQ, sCustName));
                aFilters.push(new Filter("mail_name", FilterOperator.EQ, sMailingName));
                aFilters.push(new Filter("street_name", FilterOperator.EQ, sStreetAdd));
                aFilters.push(new Filter("street_no", FilterOperator.EQ, sStreetNo));
                aFilters.push(new Filter("city", FilterOperator.EQ, sCity));
                aFilters.push(new Filter("zip_code", FilterOperator.EQ, sZipcode));
                aFilters.push(new Filter("no_of_lines", FilterOperator.EQ, sNo_of_Lines));
                aFilters.push(new Filter("srv_centre", FilterOperator.EQ, sService_center));
                aFilters.push(new Filter("cable_no", FilterOperator.EQ, sCable_No));
                aFilters.push(new Filter("psw", FilterOperator.EQ, sPSW_Diagram));
                aFilters.push(new Filter("psr", FilterOperator.EQ, sPrimery_SR));
                aFilters.push(new Filter("acc_rep", FilterOperator.EQ, sAccount_rep));
                aFilters.push(new Filter("sub_station", FilterOperator.EQ, sSubstation));
                aFilters.push(new Filter("sketch_no", FilterOperator.EQ, sSketch_no));
                aFilters.push(new Filter("circuit", FilterOperator.EQ, sCircuit));
                aFilters.push(new Filter("generation", FilterOperator.EQ, sGeneration));
                this.oBusyIndicator.open();
                //mickey

                let oUserScopeJModelData = this.getOwnerComponent().getModel("oUserScopeJModel").getData();
                console.log(oUserScopeJModelData);
                
                try {//rohit/ram

                    this.getOwnerComponent().getModel("ISUService").read("/Customer_searchSet", {
                        //    this.oDataModel.read("Customer_searchSet", {
                        filters: [aFilters],
                        success: function (oData) {
                            that.oBusyIndicator.close()
                            var noData = false;
                            if (oData.results.length > 0) {
                                //   if (!that.hasRecordCreateAccess) {
                                // if (!oUserScopeJModelData.hasCustomerCreateAccess) {
                                //     console.log("in odata has NO create access");
                                //     var arr = [];
                                //     for (var i = 0; i < oData.results.length; i++) {
                                //         if (oData.results[i].superior_flag === "") {
                                //             arr.push(oData.results[i]);
                                //         }
                                //     }
                                //     if (arr.length > 0) {
                                //         that.oView.byId("idNoofRec").setText(arr.length);
                                //         oSearchCustomerJModel.setProperty("/CustomersData", arr);
                                //     }
                                //     else {
                                //         noData = true;
                                //     }

                                // }
                                // else {
                                    that.oView.byId("idNoofRec").setText(oData.results.length);
                                    oSearchCustomerJModel.setProperty("/CustomersData", oData.results);
                                //}
                            } else {
                                noData = true;
                                // oSearchCustomerJModel.setData([]);
                                // that.oView.byId("idNoofRec").setText(oData.results.length);
                            }
                            if (noData) {
                                oSearchCustomerJModel.setData([]);
                                that.oView.byId("idNoofRec").setText(oData.results.length);
                            }

                        },
                        error: function (error) {
                            that.oBusyIndicator.close();
                            sap.m.MessageBox.show(
                                error.statusText, {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: "Error",
                                actions: [sap.m.MessageBox.Action.OK]
                            });
                            oSearchCustomerJModel.setData([]);
                            that.oView.byId("idNoofRec").setText("");
                        }
                    });
                }
                catch {

                }
            },
            //********************************End*********************************/

            //****************************Navigating to View2 page***************************/
            handleSelectionChange: function (oEvt) {
                let oUserScopeJModelData = this.getOwnerComponent().getModel("oUserScopeJModel").getData();
                var oContext = oEvt.getSource().getBindingContext("oSearchCustomerJModel").getProperty();
                var oCustomerAttributesJModel = this.getOwnerComponent().getModel("oCustomerAttributesJModel");
                oCustomerAttributesJModel.setData(oContext);
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                if (oContext.conn_obj === "") {
                    sap.m.MessageBox.show(this.getView().getModel("i18n").getProperty("No_billingEntity_Exist"), {
                        icon: sap.m.MessageBox.Icon.ERROR,
                        title: "Error",
                        actions: [sap.m.MessageBox.Action.OK]
                    });
                } else {
                    if (!oUserScopeJModelData.hasCustomerCreateAccess && oContext.superior_flag ==="X") {
                        sap.m.MessageBox.show("Navigation to superior floc is restricted!", {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: "Error",
                            actions: [sap.m.MessageBox.Action.OK]
                        });
                    }else{
                        oRouter.navTo("CustomerDetails", {
                            scope: "cd_create"
                        });
                    }
                   
                }

                
            },
            //********************************End*********************************/


            //************************Live filter within table's records*******************/
            handleTableSearch: function (oEvet) {
                var sValue = oEvet.getSource().getValue();
                var oFilter = new Filter("cust_name", FilterOperator.Contains, sValue);
                var oFilter1 = new Filter("mail_name", FilterOperator.Contains, sValue);
                var oFilter2 = new Filter("street_name", FilterOperator.Contains, sValue);
                var oFilter3 = new Filter("street_no", FilterOperator.Contains, sValue);
                var oFilter4 = new Filter("city", FilterOperator.Contains, sValue);
                var oFilter5 = new Filter("zip_code", FilterOperator.Contains, sValue);
                var oFilter6 = new Filter("no_of_lines", FilterOperator.Contains, sValue);
                var oFilter7 = new Filter("srv_centre", FilterOperator.Contains, sValue);
                var oFilter8 = new Filter("cable_no", FilterOperator.Contains, sValue);
                var oFilter9 = new Filter("sketch_no", FilterOperator.Contains, sValue);
                var oFilter10 = new Filter("psw", FilterOperator.Contains, sValue);
                var oFilter11 = new Filter("psr", FilterOperator.Contains, sValue);
                var oFilter12 = new Filter("acc_rep", FilterOperator.Contains, sValue);
                var oFilter13 = new Filter("sub_station", FilterOperator.Contains, sValue);
                var oFilter14 = new Filter("circuit", FilterOperator.Contains, sValue);
                var oFilter15 = new Filter("conn_obj", FilterOperator.Contains, sValue);
                var oFilter16 = new Filter("generation", FilterOperator.Contains, sValue);
                var oFilterFinal = new Filter([oFilter, oFilter1, oFilter2, oFilter3, oFilter4, oFilter5, oFilter6, oFilter7,
                    oFilter8, oFilter9, oFilter10, oFilter11, oFilter12, oFilter13, oFilter14, oFilter15, oFilter16], false);
                this.getView().byId("idCustomerListTable").getBinding("items").filter([oFilterFinal]);
            },
            //********************************End*********************************/

            //*************************Adding Column Filters********************************/
            onTableColumnFilterButtonPress: function () {
                var oModel = this.getView().getModel("oSearchCustomerJModel");
                var oGet_dat = oModel.getProperty("/CustomersData");
                if (oGet_dat.length > 0) {
                    if (!this._oColumnFilterDialog) {
                        this._oColumnFilterDialog = sap.ui.xmlfragment("idColumnFiltersFrag", "com.pso.customerattribute.fragment.ColumnFilters", this);
                        this.getView().addDependent(this._oColumnFilterDialog)
                    }
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragCustName").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragMailingName").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragBillingentity").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragStreetAdd").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragStreetNo").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idFragCity").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragZipcode").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragNoofLines").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragSrvCenter").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragCableNo").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragpswdigram").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragPrimerySrvRep").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragAccRep").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragSubstation").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragSketchNo").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragCircuit").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragGeneration").setValue("");

                    this._oColumnFilterDialog.open();
                }
            },
            onValidReportsColumnFilterConfirm: function () {
                var oTable = this.getView().byId("idCustomerListTable");
                var oItems = oTable.getBinding("items");
                var sCust_Name = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragCustName").getValue()
                    , sMailing_Name = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragMailingName").getValue()
                    , sBillingEntity = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragBillingentity").getValue()
                    , sStreet_Add = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragStreetAdd").getValue()
                    , sStreet_No = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragStreetNo").getValue()
                    , sCity = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idFragCity").getValue()
                    , sZip = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragZipcode").getValue()
                    , sNoofLines = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragNoofLines").getValue()
                    , sSrv_center = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragSrvCenter").getValue()
                    , sCable_No = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragCableNo").getValue()
                    , sPSW_Diagram = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragpswdigram").getValue()
                    , sPrimerySrv_rep = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragPrimerySrvRep").getValue()
                    , sAccount_rep = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragAccRep").getValue()
                    , sSubstation = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragSubstation").getValue()
                    , sSketch_no = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragSketchNo").getValue()
                    , sCircuit = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragCircuit").getValue()
                    , sGeneration = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragGeneration").getValue();
                if (sCust_Name === "" && sMailing_Name === "" && sBillingEntity === "" && sStreet_Add === "" && sStreet_No === "" && sCity === "" && sZip === ""
                    && sNoofLines === "" && sSrv_center === "" && sCable_No === "" && sPSW_Diagram === "" && sPrimerySrv_rep === ""
                    && sAccount_rep === "" && sSubstation === "" && sSketch_no === "" && sCircuit === "" && sGeneration === "") {
                    oItems.filter([])
                } else {
                    var oArray = [];
                    if (sCust_Name !== "") {
                        oArray.push(new Filter("cust_name", FilterOperator.EQ, sCust_Name))
                    }
                    if (sMailing_Name !== "") {
                        oArray.push(new Filter("mail_name", FilterOperator.EQ, sMailing_Name))
                    }
                    if (sBillingEntity !== "") {
                        oArray.push(new Filter("conn_obj", FilterOperator.EQ, sBillingEntity))
                    }
                    if (sStreet_Add !== "") {
                        oArray.push(new Filter("street_name", FilterOperator.EQ, sStreet_Add))
                    }
                    if (sStreet_No !== "") {
                        oArray.push(new Filter("street_no", FilterOperator.EQ, sStreet_No))
                    }
                    if (sCity !== "") {
                        oArray.push(new Filter("city", FilterOperator.EQ, sCity))
                    }
                    if (sZip !== "") {
                        oArray.push(new Filter("zip_code", FilterOperator.EQ, sZip))
                    }
                    if (sNoofLines !== "") {
                        oArray.push(new Filter("no_of_lines", FilterOperator.EQ, sNoofLines))
                    }
                    if (sSrv_center !== "") {
                        oArray.push(new Filter("srv_centre", FilterOperator.EQ, sSrv_center))
                    }
                    if (sCable_No !== "") {
                        oArray.push(new Filter("cable_no", FilterOperator.EQ, sCable_No))
                    }
                    if (sPSW_Diagram !== "") {
                        oArray.push(new Filter("psw", FilterOperator.EQ, sPSW_Diagram))
                    }
                    if (sPrimerySrv_rep !== "") {
                        oArray.push(new Filter("psr", FilterOperator.EQ, sPrimerySrv_rep))
                    }
                    if (sAccount_rep !== "") {
                        oArray.push(new Filter("acc_rep", FilterOperator.EQ, sAccount_rep))
                    }
                    if (sSubstation !== "") {
                        oArray.push(new Filter("sub_station", FilterOperator.EQ, sSubstation))
                    }
                    if (sSketch_no !== "") {
                        oArray.push(new Filter("sketch_no", FilterOperator.EQ, sSketch_no))
                    }
                    if (sCircuit !== "") {
                        oArray.push(new Filter("circuit", FilterOperator.EQ, sCircuit))
                    }
                    if (sGeneration !== "") {
                        oArray.push(new Filter("generation", FilterOperator.EQ, sGeneration))
                    }
                    var sConsData = new Filter(oArray, true);
                    oItems.filter(sConsData)
                }
            },
            //********************************End*********************************/

            //*****************************Removing Column Filters***********************/
            onValidReportsColumnFilterCancel: function () {
                var oTable = this.getView().byId("idCustomerListTable");
                var oItems = oTable.getBinding("items");
                oItems.filter([]);
            },
            onValidReportsColumnFilterRemove: function () {
                var oTable = this.getView().byId("idCustomerListTable");
                var oItems = oTable.getBinding("items");
                oItems.filter([])
            },

            //********************************Add Sorting in table******************************/  
            onValidReportsTableSorting: function (e) {
                this._getValidReportsTableSortDialog().open()
            },
            _getValidReportsTableSortDialog: function () {
                var e = this.getView().getModel("oSearchCustomerJModel");
                if (!this._oValidReportsTableSortDialog) {
                    this._oValidReportsTableSortDialog = sap.ui.xmlfragment(this.createId("idValidReportsTableSortFrag"), "com.pso.customerattribute.fragment.TableSort", this);
                    this.getView().addDependent(this._oValidReportsTableSortDialog)
                }
                return this._oValidReportsTableSortDialog
            },
            onTableSortConfirm: function (e) {
                var sKey = e.getParameter("sortItem").getKey()
                    , sSortDece = e.getParameter("sortDescending");
                var sTable = this.getView().byId("idCustomerListTable")
                    , sTableButton = this.getView().byId("idTableSort");
                this._oValidReportsTableSortSelection = {
                    path: sKey,
                    desc: sSortDece
                };
                sTableButton.setType("Emphasized");
                var sSorter = new sap.ui.model.Sorter(this._oValidReportsTableSortSelection.path, this._oValidReportsTableSortSelection.desc);
                sTable.getBinding("items").sort(sSorter)
            },
            //********************************End*********************************/

            //*************************Export table records in excel*********************/
            onValidReportsTableExport: function () {
                var oClumn_Config, oRecords, oObject, oSpradeSheet, oText;
                var oModel = this.getView().getModel("oSearchCustomerJModel");
                var oRecords = oModel.getProperty("/CustomersData");
                var oReource = this.getResourceBundle();
                oText = oReource.getText("customerReport");
                if (oRecords.length > 0) {
                    oClumn_Config = this.getColumnConfig(oReource);
                    oObject = {
                        workbook: {
                            columns: oClumn_Config
                        },
                        dataSource: oRecords,
                        fileName: oText + ".xlsx",
                        worker: true,
                        sheetName: "Customer Records",
                        metaSheetName: "Customer Records",
                        title: "Customer Records",
                        application: "Records"
                    };
                    oSpradeSheet = new Spreadsheet(oObject);
                    oSpradeSheet.build().finally(function () {
                        oSpradeSheet.destroy()
                    })
                }
            },
            getColumnConfig: function (oClumn_Config) {
                var oRecords = [];
                oRecords.push({
                    label: oClumn_Config.getText("Fcutname"),
                    type: sap.ui.export.EdmType.String,
                    property: "cust_name",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("FMailingname"),
                    type: sap.ui.export.EdmType.String,
                    property: "mail_name",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("FBillingEntity"),
                    type: sap.ui.export.EdmType.String,
                    property: "conn_obj",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("FStreetAdd"),
                    type: sap.ui.export.EdmType.String,
                    property: "street_name",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("FStreetNo"),
                    type: sap.ui.export.EdmType.String,
                    property: "street_no",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("Fcity"),
                    type: sap.ui.export.EdmType.String,
                    property: "city",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("FZipcod"),
                    type: sap.ui.export.EdmType.String,
                    property: "zip_code",
                    width: 20,
                    wrap: true
                });

                oRecords.push({
                    label: oClumn_Config.getText("FNumberoflines"),
                    type: sap.ui.export.EdmType.String,
                    property: "no_of_lines",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("Fsrvcenter"),
                    type: sap.ui.export.EdmType.String,
                    property: "srv_centre",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("Fcableno"),
                    type: sap.ui.export.EdmType.String,
                    property: "cable_no",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("Fsrvsktchno"),
                    type: sap.ui.export.EdmType.String,
                    property: "sketch_no",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("Fpswidigram"),
                    type: sap.ui.export.EdmType.String,
                    property: "psw",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("Fprimeryrvrep"),
                    type: sap.ui.export.EdmType.String,
                    property: "psr",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("Faccountrp"),
                    type: sap.ui.export.EdmType.String,
                    property: "acc_rep",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("Fsustatoin"),
                    type: sap.ui.export.EdmType.String,
                    property: "sub_station",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("Fcircuit"),
                    type: sap.ui.export.EdmType.String,
                    property: "circuit",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("FOnSiteGeneration"),
                    type: sap.ui.export.EdmType.String,
                    property: "generation",
                    width: 20,
                    wrap: true
                });

                return oRecords
            },
            //********************************End*********************************/

            //*************************Get value of resorce model***************************/
            getResourceBundle: function () {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },

            //***********************Clearing all filters*************************/
            onClear: function () {
                var oSearchCustomerJModel = this.getOwnerComponent().getModel("oSearchCustomerJModel");
                oSearchCustomerJModel.setProperty("/CustomersData", []);
                this.getView().byId("idcustomer").setValue();
                this.getView().byId("idMailingname").setValue();
                this.getView().byId("idStreetAdd").setValue();
                this.getView().byId("idStreetNo").setValue();
                this.getView().byId("idCity").setValue();
                this.getView().byId("idzipcode").setValue();
                this.getView().byId("idNoofline").setValue();
                this.getView().byId("idsrvcenter").setValue();
                this.getView().byId("idcableno").setValue();
                this.getView().byId("idPswdigram").setValue();
                this.getView().byId("idPrimarySRep").setSelectedKey();
                this.getView().byId("idAcRep").setValue();
                this.getView().byId("idSubstation").setValue();
                this.getView().byId("idSrvSketchno").setValue();
                this.getView().byId("idCircuit").setValue();
                this.getView().byId("idOnSiteGeneration").setSelectedKey();
                this.getView().byId("idNoofRec").setText("0");
            },
            //********************************End*********************************/

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
            }
            //********************************End*********************************/


        });
    });
