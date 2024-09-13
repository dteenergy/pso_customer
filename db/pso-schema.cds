namespace com.pso.specials;

using { cuid, managed } from '@sap/cds/common';

entity PSOSpecials : cuid, managed {
    key connection_object: String;
    work_desc: String;
    meter_number: String;
    
    record_status: String; // draft,  submitted, approved, rejected
    
    workflow_id: UUID; 
    approvedBy: String; 
    approvedOn: Timestamp;
    approverComment : String; 

   
    pSNumber          : String;
    completionDate    : String;
    fedFrom           : String;
    cableDescription: String;
    cableFootage    : String;
    ductType        : String;
    cts             : String;
    pts             : String;
    k               : String;
    m               : String;
    fusesAt         : String;
    size            : String;
    typeCR          : String;
    curve           : String;
    voltage         : String;

    
    manufacturer    : String;
    model           : String;
    continuousCurrent: String;
    loadIntRating   : String;
    kAMomentaryLBD  : String;
    typeLBD         : String;
    faultClosing    : String;
    bilLBD          : String;
    serviceVoltage  : String;
    CycWithstand60  : String;
   
    circuitBreakerMake: String;
    serialNo        : String;
    kAMomentaryCB   : String;
    amps            : String;
    typeCB          : String;
    faultDuty       : String;
    bilCB           : String;
    
}