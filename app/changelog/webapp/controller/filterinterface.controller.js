sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    'sap/ui/export/Spreadsheet',
    'sap/ui/export/library',
    'sap/ui/model/Sorter'
],
    function (Controller, Fragment, Filter, Spreadsheet, library, Sorter) {
        "use strict";

        return Controller.extend("com.pso.changelog.controller.filterinterface", {
            onInit: function () {
                this.model = this.getOwnerComponent().getModel();
                this.localModel = this.getOwnerComponent().getModel("localModel");
                this.localModel.setProperty('/tableItemsCount', `Items(0)`);
                this.readApprByVH();
                // this.checkAuth();
            },
            EdmType: library.EdmType,
            checkAuth: function () {
                let oContext = this.getOwnerComponent().getModel().bindContext('/userDetails(...)');
                var that = this;
                oContext.execute().then((context) => {
                    let data = oContext.getBoundContext().getObject();
                    if (data.hasCustomerDisplayAccess & data.hasSpecialsDisplayAccess) {
                        that.localModel.setProperty('/filterVisible', {
                            'apprvBy': false,
                            'recrdStats': false
                        })
                    }
                    else {
                        that.localModel.setProperty('/filterVisible', {
                            'apprvBy': true,
                            'recrdStats': true
                        })
                    }
                })
            },
            filterVH: function (aFilters, vhname) {
                let data = this.model.bindList('/PSOSpecials', undefined, undefined, aFilters);
                let oApprBy = { 'dataToDisplay': [] };
                let oConnObj = { 'dataToDisplay': [] };

                data.requestContexts(0, Infinity).then(function (aContext) {
                    aContext.forEach(context => {
                        let appryBy = context.getObject()['approvedBy'];
                        if (!oApprBy.hasOwnProperty(appryBy)) {
                            oApprBy[appryBy] = context.getObject()['approvedBy'];
                            oApprBy['dataToDisplay'].push({
                                "approvedBy": appryBy
                            })
                        }

                        let connObj = context.getObject()['connection_object'];
                        if (!oConnObj.hasOwnProperty(connObj)) {
                            oConnObj[connObj] = context.getObject()['connection_object'];
                            oConnObj['dataToDisplay'].push({
                                "connection_object": connObj
                            })
                        }


                    });

                    this.localModel.refresh(true);
                }.bind(this))
                if (vhname == 'approvedBy') {
                    this.localModel.setProperty('/connectionObjVH', oConnObj.dataToDisplay);

                }
                else if (vhname == 'connection_object') {
                    this.localModel.setProperty('/approvedByVH', oApprBy.dataToDisplay);

                }
            },
            readApprByVH: function (aFilters, aSort) {
                let data = this.model.bindList('/PSOSpecials', undefined, undefined, aFilters);
                if (aSort) {
                    data.sort(aSort);
                }
                let aData = [];
                let oApprBy = { 'dataToDisplay': [] };
                let oConnObj = { 'dataToDisplay': [] };
                let oRecStats = { 'dataToDisplay': [{ key: 'All', text: 'All' }] };
                let oCustName = { 'dataToDisplay': [] };
                let oStreetNumber = { 'dataToDisplay': [] };
                let oStreetName = { 'dataToDisplay': [] };
                data.requestContexts(0, Infinity).then(function (aContext) {
                    aContext.forEach(context => {
                        let data = context.getObject();
                        data.createdAt = data.createdAt != null ? new Date(data.createdAt).toLocaleString() : data.createdAt;
                        data.approvedOn = data.approvedOn != null ? new Date(data.approvedOn).toLocaleString() : data.approvedOn;
                        aData.push(data);

                        let appryBy = context.getObject()['approvedBy'];
                        if (appryBy != null && appryBy != "") {
                            if (!oApprBy.hasOwnProperty(appryBy)) {
                                oApprBy[appryBy] = context.getObject()['approvedBy'];
                                oApprBy['dataToDisplay'].push({
                                    "approvedBy": appryBy
                                })
                            }
                        }


                        let connObj = context.getObject()['connection_object'];
                        if (connObj != null && connObj != "") {
                            if (!oConnObj.hasOwnProperty(connObj)) {
                                oConnObj[connObj] = context.getObject()['connection_object'];
                                oConnObj['dataToDisplay'].push({
                                    "connection_object": connObj
                                })
                            }
                        }


                        let customerName = context.getObject()['customerName'];
                        if (customerName != null && customerName != "") {
                            if (!oCustName.hasOwnProperty(customerName)) {
                                oCustName[customerName] = context.getObject()['customerName'];
                                oCustName['dataToDisplay'].push({
                                    "customerName": customerName
                                })
                            }
                        }


                        let streetNumber = context.getObject()['streetNumber'];
                        if (streetNumber != null && streetNumber != "") {
                            if (!oStreetNumber.hasOwnProperty(streetNumber)) {
                                oStreetNumber[streetNumber] = context.getObject()['streetNumber'];
                                oStreetNumber['dataToDisplay'].push({
                                    "streetNumber": streetNumber
                                })
                            }
                        }


                        let streetName = context.getObject()['streetName'];
                        if (streetName != null && streetName != "") {
                            if (!oStreetName.hasOwnProperty(streetName)) {
                                oStreetName[streetName] = context.getObject()['streetName'];
                                oStreetName['dataToDisplay'].push({
                                    "streetName": streetName
                                })
                            }
                        }


                        let record_status = context.getObject()['record_status'];
                        if (record_status != null && record_status != "") {
                            if (!oRecStats.hasOwnProperty(record_status.toLowerCase())) {
                                oRecStats[record_status.toLowerCase()] = context.getObject()['record_status'].toLowerCase();
                                oRecStats['dataToDisplay'].push({
                                    "key": record_status,
                                    "text": record_status.replace(/^./, record_status[0].toUpperCase())
                                })
                            }
                        }



                    });
                    // this.localModel.setProperty('/PSOSpecials', aData);
                    if (!aFilters) {
                        this.localModel.setProperty('/approvedByVH', oApprBy.dataToDisplay);
                        this.localModel.setProperty('/connectionObjVH', oConnObj.dataToDisplay);
                        this.localModel.setProperty('/recordStatsVH', oRecStats.dataToDisplay.sort());
                        this.localModel.setProperty('/custNameVH', oCustName.dataToDisplay);
                        this.localModel.setProperty('/streetNumberVH', oStreetNumber.dataToDisplay);
                        this.localModel.setProperty('/streetNameVH', oStreetName.dataToDisplay);
                    }
                    else {
                        this.localModel.setProperty('/tableItemsCount', `Items(${aData.length})`);
                        this.localModel.setProperty('/PSOSpecials', aData);
                        this.byId('idTable').setBusy(false);
                        if (aData.length > 0) {
                            this.byId('idExcel').setEnabled(true);
                            this.byId('idSort').setEnabled(true);
                        }

                    }

                    // this.byId('idTable').bindAggregation("items", {
                    //     path: "localModel>/PSOSpecials",
                    //     model : "localModel"
                    // });
                    this.localModel.refresh(true);
                }.bind(this))
            },
            onBasicSearch: async function (oEvent) {
                let field = this.byId(this._tokensForInput).getParent().getName();
                if (field == 'approvedBy') {
                    let oVHTable = await this.apprDialog.getTableAsync();
                    if (oVHTable.bindRows) {
                        oVHTable.getBinding('rows').filter(new Filter(this.byId(field, 'Contains', oEvent.getParameter('newValue'))))
                    }
                    else if (oVHTable.bindItems) {
                        oVHTable.getBinding('items').filter(new Filter(this.byId(field, 'Contains', oEvent.getParameter('newValue'))))
                    }
                }
                else if (field == 'connection_object') {
                    let oVHTable = await this.conObjDialog.getTableAsync();
                    if (oVHTable.bindRows) {
                        oVHTable.getBinding('rows').filter(new Filter(field, 'Contains', oEvent.getParameter('newValue')))
                    }
                    else if (oVHTable.bindItems) {
                        oVHTable.getBinding('items').filter(new Filter(field, 'Contains', oEvent.getParameter('newValue')))
                    }
                }
                else if (field == 'customerName') {
                    let oVHTable = await this.conObjDialog.getTableAsync();
                    if (oVHTable.bindRows) {
                        oVHTable.getBinding('rows').filter(new Filter(field, 'Contains', oEvent.getParameter('newValue')))
                    }
                    else if (oVHTable.bindItems) {
                        oVHTable.getBinding('items').filter(new Filter(field, 'Contains', oEvent.getParameter('newValue')))
                    }
                }
                else if (field == 'streetName') {
                    let oVHTable = await this.conObjDialog.getTableAsync();
                    if (oVHTable.bindRows) {
                        oVHTable.getBinding('rows').filter(new Filter(field, 'Contains', oEvent.getParameter('newValue')))
                    }
                    else if (oVHTable.bindItems) {
                        oVHTable.getBinding('items').filter(new Filter(field, 'Contains', oEvent.getParameter('newValue')))
                    }
                }
                else if (field == 'streetNumber') {
                    let oVHTable = await this.conObjDialog.getTableAsync();
                    if (oVHTable.bindRows) {
                        oVHTable.getBinding('rows').filter(new Filter(field, 'Contains', oEvent.getParameter('newValue')))
                    }
                    else if (oVHTable.bindItems) {
                        oVHTable.getBinding('items').filter(new Filter(field, 'Contains', oEvent.getParameter('newValue')))
                    }
                }
            },
            onValueHelpApprovedBy: function (oEvent) {
                this._tokensForInput = oEvent.getSource().getId();
                //start
                let aApprVHTokens = this.byId('idConnObj').getTokens();
                if (aApprVHTokens.length > 0) {
                    let aFilters = [];
                    aApprVHTokens.forEach(token => {
                        aFilters.push(new Filter(this.byId('idConnObj').getParent().getName(), 'EQ', token.getKey()));
                    });
                    this.filterVH(aFilters, this.byId('idConnObj').getParent().getName());
                }
                else {
                    this.readApprByVH();
                }
                //end
                // this.readApprByVH();
                var that = this;
                if (!this.apprDialog) {
                    Fragment.load({
                        name: "com.pso.changelog.fragments.approvedby",
                        type: "XML",
                        controller: this
                    }).then(oDialog => {
                        oDialog.setModel(this.localModel);
                        this.apprDialog = oDialog;
                        this.getView().addDependent(this.apprDialog);

                        this.apprDialog.getFilterBar().setBasicSearch(new sap.m.SearchField({
                            liveChange: [that.onBasicSearch, that],
                            value: '{localModel>/basicSearch}',
                            showSearchButton: true
                        }))
                        this.apprDialog.getTableAsync().then(oTable => {
                            oTable.setModel(that.localModel);
                            if (oTable.bindRows) {
                                oTable.removeAllExtension();
                                oTable.attachRowSelectionChange(function (oEvent) {
                                    // this.onValueHelpOkPress();
                                    this.apprDialog.getButtons()[0].firePress({
                                        mParameters: {
                                            tokens: this.apprDialog._getTokenizer().getTokens(),
                                            _tokensHaveChanged: this.apprDialog._bInitTokensHaveChanged,
                                            id: this.apprDialog.getId()
                                        }
                                    })
                                }.bind(this));
                                oTable.setSelectionMode('Single');
                                oTable.bindAggregation("rows", {
                                    path: "/approvedByVH",
                                    events: {
                                        dataReceived: function () {
                                            oDialog.update();
                                        }
                                    }
                                });
                            }

                            oTable.addColumn(new sap.ui.table.Column({
                                label: "Approved By",
                                template: new sap.m.Text({
                                    text: "{approvedBy}"
                                })
                            }))

                            if (oTable.bindItems) {
                                oTable.setMode('SingleSelect');
                                oTable.bindAggregation("items", {
                                    path: "/approvedByVH",
                                    template: new sap.m.ColumnListItem({
                                        cells: [new sap.m.Label({ text: "{approvedBy}" })]
                                    }),
                                    events: {
                                        dataReceived: function () {
                                            oDialog.update();
                                        }
                                    }
                                });

                                oTable.addColumn(new sap.m.Column({
                                    header: new sap.m.Label({ text: "Approved By" })
                                }))
                            }
                        })
                        oDialog.update();
                        sap.ui.getCore().byId('idVhStoreDialog-tokenizerGrid').setVisible(false);
                        this.apprDialog.open()
                    })
                }
                else {
                    this.apprDialog.open();
                }
            },
            onValueHelpConnObj: function (oEvent) {


                this._tokensForInput = oEvent.getSource().getId();
                // if (!this.localModel.getData().hasOwnProperty('PSOSpecials')) {

                //start
                let aApprVHTokens = this.byId('idApprBy').getTokens();
                if (aApprVHTokens.length > 0) {
                    let aFilters = [];
                    aApprVHTokens.forEach(token => {
                        aFilters.push(new Filter(this.byId('idApprBy').getParent().getName(), 'EQ', token.getKey()));
                    });
                    this.filterVH(aFilters, this.byId('idApprBy').getParent().getName());
                }
                else {
                    this.readApprByVH();
                }
                //end
                // }
                if (!this.conObjDialog) {
                    Fragment.load({
                        name: "com.pso.changelog.fragments.connecObj",
                        type: "XML",
                        controller: this
                    }).then(oDialog => {
                        oDialog.setModel(this.localModel);
                        this.conObjDialog = oDialog;
                        this.getView().addDependent(this.conObjDialog);
                        var that = this;
                        this.conObjDialog.getFilterBar().setBasicSearch(new sap.m.SearchField({
                            liveChange: [that.onBasicSearch, that],
                            value: '{localModel>/basicSearch}',
                            showSearchButton: true
                        }))
                        this.conObjDialog.getTableAsync().then(oTable => {
                            oTable.setModel(that.localModel);
                            if (oTable.bindRows) {
                                oTable.removeAllExtension();
                                oTable.attachRowSelectionChange(function (oEvent) {
                                    // this.onValueHelpOkPress();
                                    this.conObjDialog.getButtons()[0].firePress({
                                        mParameters: {
                                            tokens: this.conObjDialog._getTokenizer().getTokens(),
                                            _tokensHaveChanged: this.conObjDialog._bInitTokensHaveChanged,
                                            id: this.conObjDialog.getId()
                                        }
                                    })
                                }.bind(this))
                                oTable.setSelectionMode('Single');
                                oTable.bindAggregation("rows", {
                                    path: "/connectionObjVH",
                                    events: {
                                        dataReceived: function () {
                                            oDialog.update();
                                        }
                                    }
                                });
                            }

                            oTable.addColumn(new sap.ui.table.Column({
                                label: "Connection Object",
                                template: new sap.m.Text({
                                    text: "{connection_object}"
                                })
                            }))

                            if (oTable.bindItems) {
                                oTable.setMode('SingleSelect');
                                oTable.bindAggregation("items", {
                                    path: "/connectionObjVH",
                                    template: new sap.m.ColumnListItem({
                                        cells: [new sap.m.Label({ text: "{connection_object}" })]
                                    }),
                                    events: {
                                        dataReceived: function () {
                                            oDialog.update();
                                        }
                                    }
                                });

                                oTable.addColumn(new sap.m.Column({
                                    header: new sap.m.Label({ text: "Connection Object" })
                                }))
                            }
                        })
                        oDialog.update();
                        sap.ui.getCore().byId('idVhConObjDialog-tokenizerGrid').setVisible(false)
                        this.conObjDialog.open()
                    })
                }
                else {
                    this.conObjDialog.open();
                }
            },
            onValueHelpCustName: function (oEvent) {
                this._tokensForInput = oEvent.getSource().getId();

                if (!this.custNameDialog) {
                    Fragment.load({
                        name: "com.pso.changelog.fragments.custName",
                        type: "XML",
                        controller: this
                    }).then(oDialog => {
                        oDialog.setModel(this.localModel);
                        this.custNameDialog = oDialog;
                        this.getView().addDependent(this.custNameDialog);
                        var that = this;
                        this.custNameDialog.getFilterBar().setBasicSearch(new sap.m.SearchField({
                            liveChange: [that.onBasicSearch, that],
                            value: '{localModel>/basicSearchForCustName}',
                            showSearchButton: true
                        }))
                        this.custNameDialog.getTableAsync().then(oTable => {
                            oTable.setModel(that.localModel);
                            if (oTable.bindRows) {
                                oTable.removeAllExtension();
                                oTable.attachRowSelectionChange(function (oEvent) {
                                    // this.onValueHelpOkPress();
                                    this.custNameDialog.getButtons()[0].firePress({
                                        mParameters: {
                                            tokens: this.custNameDialog._getTokenizer().getTokens(),
                                            _tokensHaveChanged: this.custNameDialog._bInitTokensHaveChanged,
                                            id: this.custNameDialog.getId()
                                        }
                                    })

                                }.bind(this))
                                oTable.setSelectionMode('Single');
                                oTable.bindAggregation("rows", {
                                    path: "/custNameVH",
                                    events: {
                                        dataReceived: function () {
                                            oDialog.update();
                                        }
                                    }
                                });
                            }

                            oTable.addColumn(new sap.ui.table.Column({
                                label: "Customer Name",
                                template: new sap.m.Text({
                                    text: "{customerName}"
                                })
                            }))

                            if (oTable.bindItems) {
                                oTable.setMode('SingleSelect');
                                oTable.bindAggregation("items", {
                                    path: "/custNameVH",
                                    template: new sap.m.ColumnListItem({
                                        cells: [new sap.m.Label({ text: "{customerName}" })]
                                    }),
                                    events: {
                                        dataReceived: function () {
                                            oDialog.update();
                                        }
                                    }
                                });

                                oTable.addColumn(new sap.m.Column({
                                    header: new sap.m.Label({ text: "Customer Name" })
                                }))
                            }
                        })
                        oDialog.update();
                        sap.ui.getCore().byId('idVhCustNameDialog-tokenizerGrid').setVisible(false)
                        this.custNameDialog.open()
                    })
                }
                else {
                    this.custNameDialog.open();
                }
            },
            onValueHelpStreet: function (oEvent) {
                this._tokensForInput = oEvent.getSource().getId();

                if (!this.oStreetNbrDialog) {
                    Fragment.load({
                        name: "com.pso.changelog.fragments.street",
                        type: "XML",
                        controller: this
                    }).then(oDialog => {
                        oDialog.setModel(this.localModel);
                        this.oStreetNbrDialog = oDialog;
                        this.getView().addDependent(this.oStreetNbrDialog);
                        var that = this;
                        this.oStreetNbrDialog.getFilterBar().setBasicSearch(new sap.m.SearchField({
                            liveChange: [that.onBasicSearch, that],
                            value: '{localModel>/basicSearchForStreetNumber}',
                            showSearchButton: true
                        }))
                        this.oStreetNbrDialog.getTableAsync().then(oTable => {
                            oTable.setModel(that.localModel);
                            if (oTable.bindRows) {
                                oTable.removeAllExtension();
                                oTable.attachRowSelectionChange(function (oEvent) {
                                    // this.onValueHelpOkPress();
                                    this.oStreetNbrDialog.getButtons()[0].firePress({
                                        mParameters: {
                                            tokens: this.oStreetNbrDialog._getTokenizer().getTokens(),
                                            _tokensHaveChanged: this.oStreetNbrDialog._bInitTokensHaveChanged,
                                            id: this.oStreetNbrDialog.getId()
                                        }
                                    })
                                }.bind(this))
                                oTable.setSelectionMode('Single');
                                oTable.bindAggregation("rows", {
                                    path: "/streetNumberVH",
                                    events: {
                                        dataReceived: function () {
                                            oDialog.update();
                                        }
                                    }
                                });
                            }

                            oTable.addColumn(new sap.ui.table.Column({
                                label: "Street Number",
                                template: new sap.m.Text({
                                    text: "{streetNumber}"
                                })
                            }))

                            if (oTable.bindItems) {
                                oTable.setMode('SingleSelect');
                                oTable.bindAggregation("items", {
                                    path: "/streetNumberVH",
                                    template: new sap.m.ColumnListItem({
                                        cells: [new sap.m.Label({ text: "{streetNumber}" })]
                                    }),
                                    events: {
                                        dataReceived: function () {
                                            oDialog.update();
                                        }
                                    }
                                });

                                oTable.addColumn(new sap.m.Column({
                                    header: new sap.m.Label({ text: "Street Number" })
                                }))
                            }
                        })
                        oDialog.update();
                        sap.ui.getCore().byId('idVhStreetDialog-tokenizerGrid').setVisible(false)
                        this.oStreetNbrDialog.open()
                    })
                }
                else {
                    this.oStreetNbrDialog.open();
                }
            },
            onValueHelpStreetAddr: function (oEvent) {
                this._tokensForInput = oEvent.getSource().getId();

                if (!this.oStreetAddrDialog) {
                    Fragment.load({
                        name: "com.pso.changelog.fragments.streetAddress",
                        type: "XML",
                        controller: this
                    }).then(oDialog => {
                        oDialog.setModel(this.localModel);
                        this.oStreetAddrDialog = oDialog;
                        this.getView().addDependent(this.oStreetAddrDialog);
                        var that = this;
                        this.oStreetAddrDialog.getFilterBar().setBasicSearch(new sap.m.SearchField({
                            liveChange: [that.onBasicSearch, that],
                            value: '{localModel>/basicSearchForStreetName}',
                            showSearchButton: true
                        }))
                        this.oStreetAddrDialog.getTableAsync().then(oTable => {
                            oTable.setModel(that.localModel);
                            if (oTable.bindRows) {
                                oTable.removeAllExtension();
                                oTable.attachRowSelectionChange(function (oEvent) {
                                    // this.onValueHelpOkPress();
                                    this.oStreetAddrDialog.getButtons()[0].firePress({
                                        mParameters: {
                                            tokens: this.oStreetAddrDialog._getTokenizer().getTokens(),
                                            _tokensHaveChanged: this.oStreetAddrDialog._bInitTokensHaveChanged,
                                            id: this.oStreetAddrDialog.getId()
                                        }
                                    })
                                }.bind(this))
                                oTable.setSelectionMode('Single');
                                oTable.bindAggregation("rows", {
                                    path: "/streetNameVH",
                                    events: {
                                        dataReceived: function () {
                                            oDialog.update();
                                        }
                                    }
                                });
                            }

                            oTable.addColumn(new sap.ui.table.Column({
                                label: "Street Name",
                                template: new sap.m.Text({
                                    text: "{streetName}"
                                })
                            }))

                            if (oTable.bindItems) {
                                oTable.setMode('SingleSelect');
                                oTable.bindAggregation("items", {
                                    path: "/streetNameVH",
                                    template: new sap.m.ColumnListItem({
                                        cells: [new sap.m.Label({ text: "{streetName}" })]
                                    }),
                                    events: {
                                        dataReceived: function () {
                                            oDialog.update();
                                        }
                                    }
                                });

                                oTable.addColumn(new sap.m.Column({
                                    header: new sap.m.Label({ text: "Street Name" })
                                }))
                            }
                        })
                        oDialog.update();
                        sap.ui.getCore().byId('idVhStreetAddrDialog-tokenizerGrid').setVisible(false)
                        this.oStreetAddrDialog.open()
                    })
                }
                else {
                    this.oStreetAddrDialog.open();
                }
            },
            onValueHelpCancelPress: function (oEvent) {
                this._tokensForInput = undefined;
                oEvent.getSource().close();
            },
            onValueHelpOkPress: function (oEvent) {
                if (this._tokensForInput !== undefined) {
                    if (oEvent != undefined) {
                        this.byId(this._tokensForInput).setTokens(oEvent.getSource()._getTokenizer().getTokens());
                        oEvent.getSource().close();
                        this._tokensForInput = undefined;
                    }
                    else {
                        let oDialog;
                        if (this._tokensForInput.includes('idConnObj')) {
                            oDialog = this.conObjDialog;
                        }
                        else if (this._tokensForInput.includes('idApprBy')) {
                            oDialog = this.apprDialog;
                        }
                        else if (this._tokensForInput.includes('idCustName')) {
                            oDialog = this.custNameDialog;
                        }
                        else if (this._tokensForInput.includes('idStreet')) {
                            oDialog = this.oStreetNbrDialog
                        }
                        else if (this._tokensForInput.includes('idStreetAddr')) {
                            oDialog = this.oStreetAddrDialog;
                        }
                        this.byId(this._tokensForInput).setTokens(oDialog._getTokenizer().getTokens());
                        oDialog.close();

                        if (oDialog.getTable().getSelectedIndex() != -1) {
                            this._tokensForInput = undefined;
                        }
                    }

                }



            },
            onRowSelect: function (oEvent) {
                this.getOwnerComponent().getModel('localModel').setProperty('/selectedItem', oEvent.getParameters().listItem.getBindingContext('localModel').getObject());
                this.getOwnerComponent().getRouter().navTo('RoutedetailPage', {
                    ID: oEvent.getParameters().listItem.getBindingContext('localModel').getObject().ID,
                    connection_object: oEvent.getParameters().listItem.getBindingContext('localModel').getObject().connection_object
                })
            },
            onFilterBarClear: function (oEvent) {
                this.byId('idExcel').setEnabled(false);
                this.byId('idSort').setEnabled(false);
                oEvent.mParameters.selectionSet.forEach(filter => {
                    if (filter.getMetadata().getName().toLowerCase().includes('multiinput')) {
                        filter.removeAllTokens();
                    }
                    else if (filter.getMetadata().getName().toLowerCase().includes('select')) {
                        filter.setSelectedKey('Approved');
                    }
                });

                this.localModel.setProperty('/PSOSpecials', []);
                this.localModel.refresh(true);
                // this.byId('idFilterBar').fireSearch({
                //     firedFromFilterBar : true,
                //     selectionSet : oEvent.getParameters().selectionSet
                // })
            },
            onFilterBarSearch: function (oEvent) {
                // if (this.byId('idConnObj').getTokens().length == 0) {
                //     sap.m.MessageBox.error('Please select the connection object!');
                //     return;
                // }
                this.byId('idTable').setBusy(true);
                let aFilters = [];
                oEvent.getParameter('selectionSet').forEach(filterItem => {
                    if (!filterItem.getMetadata().getName().toLowerCase().includes('select')) {
                        filterItem.getTokens().forEach(token => {

                            aFilters.push(
                                new Filter(filterItem.getParent().getName(), 'EQ', token.getKey())
                            )

                        })
                    }
                    else {
                        if (filterItem.getSelectedItem().getKey() != 'All') {
                            aFilters.push(
                                new Filter(filterItem.getParent().getName(), 'EQ', filterItem.getSelectedItem().getKey())
                            )
                        }
                    }

                });

                // this.byId('idTable').getBinding('items').filter(aFilters);
                this.aFilters = aFilters;
                this.readApprByVH(aFilters, []);
                this.byId('idTable').setShowOverlay(false);
            },
            onTokenUpdate: function (oEvent) {
                let tokenLen;
                if (oEvent.getParameter('type') == 'removed') {
                    tokenLen = oEvent.getSource().getTokens().length - 1;
                }
                if (tokenLen == 0) {
                    if (oEvent.getSource().getParent().getName() == 'approvedBy') {
                        if (this.apprDialog) {
                            this.apprDialog._getTokenizer().removeAllTokens();
                            let aIndices = this.apprDialog.getTable().getSelectedIndices().sort();
                            this.apprDialog.getTable().removeSelectionInterval(aIndices[0], aIndices[aIndices.length - 1]);
                            this.apprDialog.getTable()._updateSelection()
                        }
                    }

                    if (oEvent.getSource().getParent().getName() == 'connection_object') {
                        if (this.conObjDialog) {
                            this.conObjDialog._getTokenizer().removeAllTokens();
                            let aIndices = this.conObjDialog.getTable().getSelectedIndices().sort();
                            this.conObjDialog.getTable().removeSelectionInterval(aIndices[0], aIndices[aIndices.length - 1]);
                            this.conObjDialog.getTable()._updateSelection();
                        }
                    }

                    if (oEvent.getSource().getParent().getName() == 'customerName') {
                        if (this.custNameDialog) {
                            this.custNameDialog._getTokenizer().removeAllTokens();
                            let aIndices = this.custNameDialog.getTable().getSelectedIndices().sort();
                            this.custNameDialog.getTable().removeSelectionInterval(aIndices[0], aIndices[aIndices.length - 1]);
                            this.custNameDialog.getTable()._updateSelection();
                        }
                    }

                    if (oEvent.getSource().getParent().getName() == 'streetNumber') {
                        if (this.oStreetNbrDialog) {
                            this.oStreetNbrDialog._getTokenizer().removeAllTokens();
                            let aIndices = this.oStreetNbrDialog.getTable().getSelectedIndices().sort();
                            this.oStreetNbrDialog.getTable().removeSelectionInterval(aIndices[0], aIndices[aIndices.length - 1]);
                            this.oStreetNbrDialog.getTable()._updateSelection();
                        }
                    }

                    if (oEvent.getSource().getParent().getName() == 'streetNumber') {
                        if (this.oStreetAddrDialog) {
                            this.oStreetAddrDialog._getTokenizer().removeAllTokens();
                            let aIndices = this.oStreetAddrDialog.getTable().getSelectedIndices().sort();
                            this.oStreetAddrDialog.getTable().removeSelectionInterval(aIndices[0], aIndices[aIndices.length - 1]);
                            this.oStreetAddrDialog.getTable()._updateSelection();
                        }
                    }

                }
            },
            onExcelDownload: function (oEvent) {
                let aColumns = this.byId('idTable').getColumns();
                let aCells = this.byId('idTable').getItems()[0].getCells();
                this.createColumnConfig(aColumns, aCells);
            },
            createColumnConfig: function (aColumns, aCells) {
                let aCols = [];

                aColumns.forEach((column, index) => {
                    aCols.push({
                        label: column.getHeader().getText(),
                        property: aCells[index].getBindingInfo('text').parts[0].path,
                        width: 25
                    })
                });

                var oSettings = {
                    workbook: {
                        columns: aCols,
                        hierarchyLevel: 'Level',
                        context: {
                            sheetName: 'PSOSpecials'
                        }
                    },
                    dataSource: this.localModel.getData().PSOSpecials,
                    fileName: 'PSOSpecials.xlsx',
                    worker: false // We need to disable worker because we are using a MockServer as OData Service
                };

                var oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });
                // debugger;


            },
            onTableSortConfirm: function (oEvent) {
                this.byId('idTable').setBusy(true);
                let isDesc = oEvent.getParameter('sortDescending');
                let sortProp = oEvent.getParameter('sortItem').getKey();
                this.readApprByVH(this.aFilters, [new Sorter(sortProp, isDesc)]);
                // this.onFilterBarSearch(undefined,[new Sorter(sortProp,isDesc)]);
            },
            onSort: function (oEvent) {
                if (!this.sortDialog) {
                    Fragment.load({
                        name: "com.pso.changelog.fragments.TableSort",
                        type: "XML",
                        controller: this
                    }).then(oDialog => {
                        this.sortDialog = oDialog;
                        this.getView().addDependent(this.sortDialog);
                        this.sortDialog.open();
                    })
                }
                else {
                    this.sortDialog.open();
                }

            },
            onSearFieldInTable: function (oEvent) {
                let query = oEvent.getParameter('query');
                let aFilters = [];
                let aCells = [];
                if (this.byId('idTable').getItems().length > 0) {
                    aCells = this.byId('idTable').getItems()[0].getCells();
                }


                aCells.forEach((property) => {
                    let path = property.getBindingInfo('text').parts[0].path
                    if (path != 'approvedOn' && path !== 'createdAt') {
                        let aCheck = aFilters.filter(item => { return aFilters[0].getPath() == path })
                        if (aCheck == 0) {
                            aFilters.push(
                                new Filter(
                                    {
                                        path: path,
                                        operator: 'Contains',
                                        value1: query,
                                        and : false
                                    }
                                )
                            )
                        }

                    }
                });

                this.readApprByVH([new Filter({
                    filters : aFilters,
                    and : false
                }),...this.aFilters], []);

            }
        });
    });
