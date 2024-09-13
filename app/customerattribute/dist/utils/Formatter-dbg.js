jQuery.sap.declare('com.pso.customerattribute.utils.Formatter');

com.pso.customerattribute.utils.Formatter = {
    //Display Icon
    setIcon:function(status){
        if(status ==="X"){
            return "sap-icon://tree";
        }
    },

    setColor:function(status){
        if(status ==="X"){
            return "#007c91";
        }
    }
};