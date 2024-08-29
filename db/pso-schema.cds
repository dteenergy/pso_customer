namespace com.pso.specials;

using { cuid, managed } from '@sap/cds/common';

entity PSOSpecials : cuid, managed {
    key connection_object: String;
    work_desc: String;
    meter_number: String;
    
    record_status: String; // draft,  submitted, logged,
    
    workflow_id: UUID; 
    approvedBy: String; 
    approvedOn: Timestamp;
    workflow_status : String; //running, approved, rejected


    
}