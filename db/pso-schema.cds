namespace com.pso.specials;

using {
    cuid,
    managed
} from '@sap/cds/common';

entity PSOSpecials : cuid, managed {
    key connection_object   : String;
        work_desc           : String;
        meter_number        : String;
        record_status       : String; // draft,  submitted, approved, rejected
        workflow_id         : UUID;
        approvedBy          : String;
        approvedOn          : Timestamp;
        approverComment     : String;
        pSNumber            : String;
        completionDate      : String;
        fedFrom             : String;
        cableDescription    : String;
        cableFootage        : String;
        ductType            : String;
        cts                 : String;
        pts                 : String;
        k                   : String;
        m                   : String;
        fusesAt             : String;
        size                : String;
        typeCR              : String;
        curve               : String;
        voltage             : String;
        ownedByLBD          : String;
        manufacturer        : String;
        model               : String;
        continuousCurrent   : String;
        loadIntRating       : String;
        kAMomentaryLBD      : String;
        typeLBD             : String;
        faultClosing        : String;
        bilLBD              : String;
        serviceVoltage      : String;
        CycWithstand60      : String;
        fuelTypeCB          : String;
        ownedByCB           : String;
        circuitBreakerMake  : String;
        serialNo            : String;
        kAMomentaryCB       : String;
        amps                : String;
        typeCB              : String;
        faultDuty           : String;
        bilCB               : String;
        ownedByTransformer  : String;
        ab                  : String;
        bc                  : String;
        ca                  : String;
        an                  : String;
        bn                  : String;
        cn                  : String;
        groundMatResistance : String;
        methodUsed          : String;
        dateMergered        : String;
        amaVerifiedBy       : String;
        comment             : String;
        typeofService       : String;
        typeofTO            : String;
        pswDiagramNumber    : String;
        primaryServiceRep   : String;
//approvedBy : String;
//approvedDate : String; //approvedOn

}
