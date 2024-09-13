using PSOService as service from '../../srv/psoservice';


annotate service.PSOSpecials with {
    
    approvedBy @Common.ValueList: {
        $Type          : 'Common.ValueListType',
        CollectionPath : 'PSOSpecials',
        SearchSupported: true,
        Parameters     : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: approvedBy,
            ValueListProperty: 'approvedBy',
        }]
    }
};
