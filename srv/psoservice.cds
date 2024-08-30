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
    workflow_status   : String;
  }

  function userDetails()                                           returns array of String;
  function launchOpenTextURL()                                     returns String;
  //function getSpecialsRecord(connection_object: String, meter_number: String) returns  String;
  function getSpecialsRecord(connection_object : String)           returns String;
  function triggerWorkflowPSOSpecials()                            returns String;
  function onApproveRecord(comment : String)                       returns String;
  action   onApproveRecord1(recordID: UUID, comment : String, approvedBy : String) returns wfType;
  action   createSpecials(context : SpecialsContext); //context : SpecialsContext
  //function  createSpecials1() returns String;//context : SpecialsContext
  action   submitSpecials(recordID: UUID, context : SpecialsContext);
  action   updateSpecials(ID: UUID, context : SpecialsContext);

}
