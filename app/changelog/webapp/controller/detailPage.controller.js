sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter"
],
function (Controller,Filter) {
    "use strict";

    return Controller.extend("com.pso.changelog.controller.detailPage", {
        onInit: function () {
            this.getOwnerComponent().getRouter().attachRoutePatternMatched(this._initialize,this);
        },
        
        selectAIR : function(val){
            if(val == 'Air'){
                return true;
            }
            else{
                return false;
            }
        },
        selectSF6 : function(val){
            if(val == 'Air'){
                return true;
            }
            else{
                return false;
            }
        },
        selectVAC : function(val){
            if(val == 'Air'){
                return true;
            }
            else{
                return false;
            }
        },
        selectOIL : function(val){
            if(val == 'Air'){
                return true;
            }
            else{
                return false;
            }
        },
        _initialize : function(oEvent){

            //Fuses
            this.getOwnerComponent().getModel('localModel').setProperty('/fuses',[]);
            let connection_object = location.hash.split('PSOSpecials')[1].split('connection_object=')[1].replaceAll(')','').replaceAll("'",""); //location.hash.split('PSOSpecials')[1].split('ID=')[1].split(',')[0];
            var oListBind = this.getOwnerComponent().getModel().bindList("/Fuses",undefined, undefined, [new Filter('psospecials_connection_object','EQ',connection_object)]);
            
            oListBind.requestContexts().then(function(data){
                let aData = [];
                if(data.length > 0){
                    data.forEach(item=>{
                        aData.push(item.getObject())
                        
                    })
                    this.getOwnerComponent().getModel('localModel').setProperty('/fuses',aData);
                    this.getOwnerComponent().getModel('localModel').refresh(true)
                }
            }.bind(this))


            //Transformer
            this.getOwnerComponent().getModel('localModel').setProperty('/transformers',[]);
            let t_connection_object = location.hash.split('PSOSpecials')[1].split('connection_object=')[1].replaceAll(')','').replaceAll("'",""); //location.hash.split('PSOSpecials')[1].split('ID=')[1].split(',')[0];
            var oListBind = this.getOwnerComponent().getModel().bindList("/Transformers",undefined, undefined, [new Filter('psospecials_connection_object','EQ',t_connection_object)]);
            
            oListBind.requestContexts().then(function(data){
                let aData = [];
                if(data.length > 0){
                    data.forEach(item=>{
                        aData.push(item.getObject())
                        
                    })
                    this.getOwnerComponent().getModel('localModel').setProperty('/transformers',aData);
                    this.getOwnerComponent().getModel('localModel').refresh(true)
                }
            }.bind(this))




            //-
            this.byId('ObjectPageLayout').bindElement({
                path : '/PSOSpecials'+location.hash.split('PSOSpecials')[1] 
                // ,
                // parameters: {
                //     expand: "fuses"
                //   }
            });

            
        }
    });
});
