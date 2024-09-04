using {com.pso.specials as db} from '../db/pso-schema';

service PSOService {


  entity PSOSpecials as projection on db.PSOSpecials;
  //annotate PSOSpecials with @odata.draft.enabled;

  type wfType {
    comment : String;    
  }

  type SpecialsContext {
    connection_object : String;
    work_desc         : String;
    meter_number      : String;
    record_status     : String;
    workflow_id       : String;
    approvedBy        : String;
    approvedOn        : String;
    approverComment   : String;
  }

  function userDetails()                                           returns array of String;
  function fetchDestinationURL(destName: String)                                     returns String;
  
  function getSpecialsRecord(connection_object : String)           returns String;
  function triggerWorkflowPSOSpecials(recordID: UUID, context : SpecialsContext)                            returns String;
 
  action   onApproveRecord(recordID: UUID, comment : String, approvedBy : String) returns wfType;
  action   onRejectRecord(recordID: UUID, comment : String, approvedBy : String) returns wfType;
  action   createSpecials(context : SpecialsContext);
  action   submitSpecials(recordID: UUID, context : SpecialsContext);
  action   updateSpecials(recordID: UUID, context : SpecialsContext);
  action   initiateWFandUpdateDB(recordID: UUID, context : SpecialsContext);
  
  action   createAndSubmitSpecials(context : SpecialsContext);

}
