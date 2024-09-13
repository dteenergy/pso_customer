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
            },
            readApprByVH: function (aFilters) {
                let data = this.model.bindList('/PSOSpecials');
                let aData = [];
                data.requestContexts(0, Infinity).then(function (aContext) {
                    aContext.forEach(context => {
                        aData.push(context.getObject());
                    });
                    this.localModel.setProperty('/PSOSpecials', aData);
                }.bind(this))
            },
            onValueHelpApprovedBy: function (oEvent) {
                this._tokensForInput = oEvent.getSource().getId();
                this.readApprByVH();
                if (!this.apprDialog) {
                    Fragment.load({
                        name: "com.pso.changelog.fragments.approvedby",
                        type: "XML",
                        controller: this
                    }).then(oDialog => {
                        oDialog.setModel(this.localModel);
                        this.apprDialog = oDialog;
                        this.getView().addDependent(this.apprDialog);
                        var that = this;
                        this.apprDialog.getTableAsync().then(oTable => {
                            oTable.setModel(that.localModel);
                            if (oTable.bindRows) {
                                oTable.bindAggregation("rows", {
                                    path: "/PSOSpecials",
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
                                    path: "/PSOSpecials",
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
                if (!this.localModel.getData().hasOwnProperty('PSOSpecials')) {
                    this.readApprByVH();
                }
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
                        this.conObjDialog.getTableAsync().then(oTable => {
                            oTable.setModel(that.localModel);
                            if (oTable.bindRows) {
                                oTable.bindAggregation("rows", {
                                    path: "/PSOSpecials",
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
                                    path: "/PSOSpecials",
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
                this.getOwnerComponent().getModel('localModel').setProperty('/selectedItem', oEvent.getParameters().listItem.getBindingContext().getObject());
                this.getOwnerComponent().getRouter().navTo('RoutedetailPage', {
                    ID: oEvent.getParameters().listItem.getBindingContext().getObject().ID,
                    connection_object: oEvent.getParameters().listItem.getBindingContext().getObject().connection_object
                })
            },
            onFilterBarSearch: function (oEvent) {
                let aFilters = [];
                oEvent.getParameter('selectionSet').forEach(filterItem => {
                    filterItem.getTokens().forEach(token => {
                        aFilters.push(
                            new Filter(filterItem.getParent().getName(), 'EQ', token.getKey())
                        )
                    })
                });

                this.byId('idTable').getBinding('items').filter(aFilters);
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
