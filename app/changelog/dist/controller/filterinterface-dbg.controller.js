sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter"
],
    function (Controller, Fragment, Filter) {
        "use strict";

        return Controller.extend("com.pso.changelog.controller.filterinterface", {
            onInit: function () {
                this.model = this.getOwnerComponent().getModel();
                this.localModel = this.getOwnerComponent().getModel("localModel");
                this.localModel.setProperty('/tableItemsCount', `Items(0)`);
                this.readApprByVH();
                // this.oBundle = this.getView().getModel("i18n").getResourceBundle();
                // this.byId('idTable').refreshItems(false)
                // this.byId('idTable').attachUpdateFinished(function(oEvent){
                    
                //     // debugger;
                // }.bind(this))
            },
            readApprByVH: function (aFilters) {
                let data = this.model.bindList('/PSOSpecials',undefined, undefined, aFilters);
                let aData = [];
                let oApprBy = { 'dataToDisplay': [] };
                let oConnObj = { 'dataToDisplay': [] };
                let oRecStats = { 'dataToDisplay': [] };
                data.requestContexts(0, Infinity).then(function (aContext) {
                    aContext.forEach(context => {
                        let data = context.getObject();
                        data.createdAt = new Date(data.createdAt).toLocaleString()
                        aData.push(data);

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

                        let record_status = context.getObject()['record_status'];
                        if (!oRecStats.hasOwnProperty(record_status)) {
                            oRecStats[record_status] = context.getObject()['record_status'];
                            oRecStats['dataToDisplay'].push({
                                "key": record_status,
                                "text": record_status.replace(/^./, record_status[0].toUpperCase())
                            })
                        }


                    });
                    // this.localModel.setProperty('/PSOSpecials', aData);
                    if(!aFilters){
                    this.localModel.setProperty('/approvedByVH', oApprBy.dataToDisplay);
                    this.localModel.setProperty('/connectionObjVH', oConnObj.dataToDisplay);
                    this.localModel.setProperty('/recordStatsVH', oRecStats.dataToDisplay);
                    }
                    else{
                        this.localModel.setProperty('/tableItemsCount', `Items(${aData.length})`);
                        this.localModel.setProperty('/PSOSpecials', aData);
                        this.byId('idTable').setBusy(false);
                    }
                    
                    // this.byId('idTable').bindAggregation("items", {
                    //     path: "localModel>/PSOSpecials",
                    //     model : "localModel"
                    // });
                    this.localModel.refresh(true);
                }.bind(this))
            },
            onBasicSearch : async function(oEvent){
                let field = this.byId(this._tokensForInput).getParent().getName();
                if(field == 'approvedBy'){
                    let oVHTable = await this.apprDialog.getTableAsync();
                    if(oVHTable.bindRows){
                        oVHTable.getBinding('rows').filter(new Filter(this.byId(field,'Contains',oEvent.getParameter('newValue'))))                       
                    }
                    else if(oVHTable.bindItems){
                        oVHTable.getBinding('items').filter(new Filter(this.byId(field,'Contains',oEvent.getParameter('newValue'))))
                    }
                }
                else if(field == 'connection_object'){
                    let oVHTable = await this.conObjDialog.getTableAsync();
                    if(oVHTable.bindRows){
                        oVHTable.getBinding('rows').filter(new Filter(field,'Contains',oEvent.getParameter('newValue')))                       
                    }
                    else if(oVHTable.bindItems){
                        oVHTable.getBinding('items').filter(new Filter(field,'Contains',oEvent.getParameter('newValue')))
                    }
                }
            },
            onValueHelpApprovedBy: function (oEvent) {
                this._tokensForInput = oEvent.getSource().getId();
                this.readApprByVH();
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
                            liveChange : [that.onBasicSearch,that],
                            value : '{localModel>/basicSearch}',
                            showSearchButton : true
                        }))
                        this.apprDialog.getTableAsync().then(oTable => {
                            oTable.setModel(that.localModel);
                            if (oTable.bindRows) {
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
                    this.readApprByVH();
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
                            liveChange : [that.onBasicSearch,that],
                            value : '{localModel>/basicSearch}',
                            showSearchButton : true
                        }))
                        this.conObjDialog.getTableAsync().then(oTable => {
                            oTable.setModel(that.localModel);
                            if (oTable.bindRows) {
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
                        this.conObjDialog.open()
                    })
                }
                else {
                    this.conObjDialog.open();
                }
            },
            onValueHelpCancelPress: function (oEvent) {
                this._tokensForInput = undefined;
                oEvent.getSource().close();
            },
            onValueHelpOkPress: function (oEvent) {
                if (this._tokensForInput !== undefined) {
                    this.byId(this._tokensForInput).setTokens(oEvent.getSource()._getTokenizer().getTokens());
                }
                this._tokensForInput = undefined;
                oEvent.getSource().close();

            },
            onRowSelect: function (oEvent) {
                this.getOwnerComponent().getModel('localModel').setProperty('/selectedItem', oEvent.getParameters().listItem.getBindingContext('localModel').getObject());
                this.getOwnerComponent().getRouter().navTo('RoutedetailPage', {
                    ID: oEvent.getParameters().listItem.getBindingContext('localModel').getObject().ID,
                    connection_object: oEvent.getParameters().listItem.getBindingContext('localModel').getObject().connection_object
                })
            },
            onFilterBarSearch: function (oEvent) {
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
                        aFilters.push(
                            new Filter(filterItem.getParent().getName(), 'EQ',filterItem.getSelectedItem().getKey())
                        )
                    }

                });

                // this.byId('idTable').getBinding('items').filter(aFilters);
                this.readApprByVH(aFilters);
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

                }
            }
        });
    });
