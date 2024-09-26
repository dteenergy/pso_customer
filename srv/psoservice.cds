using {com.pso.specials as db} from '../db/pso-schema';
//using {c4c} from './external/c4c';

service PSOService {

  entity PSOSpecials as projection on db.PSOSpecials;

  type wfType {
    comment : String;
  }

  type result {
    value : String;
  }

  type SpecialsContext {
    connection_object  : String;
    work_desc          : String;
    meter_number       : String;
    record_status      : String;
    workflow_id        : String;
    approvedBy         : String;
    approvedOn         : String;
    approverComment    : String;
    //Customer Record(CR)
    pSNumber           : String;
    completionDate     : String;
    fedFrom            : String;
    cableDescription   : String;
    cableFootage       : String;
    ductType           : String;
    cts                : String;
    pts                : String;
    k                  : String;
    m                  : String;
    fusesAt            : String;
    size               : String;
    typeCR             : String;
    curve              : String;
    voltage            : String;
    //Load Break Disconnect(LBD)
    ownedByLBD         : String; //Radiobutton
    manufacturer       : String;
    model              : String;
    continuousCurrent  : String;
    loadIntRating      : String;
    kAMomentaryLBD     : String;
    typeLBD            : String;
    faultClosing       : String;
    bilLBD             : String;
    serviceVoltage     : String;
    CycWithstand60     : String;
    //Circuit Breaker(CB)
    fuelTypeCB         : String; //Radiobutton
    ownedByCB          : String; //Radiobutton
    circuitBreakerMake : String;
    serialNo           : String;
    kAMomentaryCB      : String;
    amps               : String;
    typeCB             : String;
    faultDuty          : String;
    bilCB              : String;
    //Transformer
    ownedByTransformer : String; //Radiobutton

    //new fields
    meter_number2       : String;
    ab                  : String;
    bc                  : String;
    ca                  : String;
    an                  : String;
    bn                  : String;
    cn                  : String;
    groundMatResistance : String;
    methodUsed          : String;
    dateMergered        : String;
    comment             : String;
    typeofService       : String;
    typeofTO            : String;
    pswDiagramNumber    : String;
    primaryServiceRep   : String;
  }

  type user {
    userName                 : String;
    email                    : String;
    hasLimitedDisplay        : Boolean;
    hasRecordCreateAccess    : Boolean;
    hasRecordDisplayAccess   : Boolean;
    hasRecordEditAccess      : Boolean;
    hasSpecialsCreateAccess  : Boolean;
    hasSpecialsDisplayAccess : Boolean;
    hasSpecialsEditAccess    : Boolean;
  }

  type C4CPayload {
    ProcessingTypeCode             : String;
    Name                           : String;
    ServiceIssueCategoryID         : String;
    IncidentServiceIssueCategoryID : String;
    ProcessorPartyID               : String;
    InstallationPointID            : String;
    PartyID                        : String;
    RoleCode                       : String;
    Z_PSO_City_KUT                 : String;
    Z_PSO_DCPLIND_KUT              : String;
    Z_PSO_ServiceCenter_KUT        : String;
    Z_PSO_Substation_KUT           : String;
    Z_PSO_Circuit_Trans_KUT        : String;
    Z_PSO_PSCableNo_KUT            : String;
    Z_PSO_StreetAddress_KUT        : String;
    Z_PSO_CustomerName_KUT         : String;
    Z_PSO_ZIP_KUT                  : String;
  }

  function userDetails()                                      returns array of String;
 // function userDetails()                                                           returns user;
  function fetchDestinationURL(destName : String)                                  returns String;
  function getSpecialsRecord(connection_object : String)                           returns String;
  function triggerWorkflowPSOSpecials(recordID : UUID, context : SpecialsContext)  returns String;
  action   onApproveRecord(recordID : UUID, comment : String, approvedBy : String) returns wfType;
  action   onRejectRecord(recordID : UUID, comment : String, approvedBy : String)  returns wfType;
  action   createSpecials(context : SpecialsContext);
  action   submitSpecials(recordID : UUID, context : SpecialsContext);
  action   updateSpecials(recordID : UUID, context : SpecialsContext);
  action   initiateWFandUpdateDB(recordID : UUID, context : SpecialsContext);
  action   createAndSubmitSpecials(context : SpecialsContext);
  //entity   ServiceRequestCollection as projection on c4c.ServiceRequestCollection;
  action   createServiceTicket(context : C4CPayload)                               returns result;
  function onVerifyRecordStatus(workflowID : UUID)                                 returns Boolean;
}
