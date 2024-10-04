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
    },

    formatDate: function(date) {
        if (!date) {
            return "";
        }

        // Ensure date is a Date object
        if (typeof date === "string") {
            date = new Date(date);
        }

        // Use the built-in Intl.DateTimeFormat for formatting
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).format(date);
    }
};