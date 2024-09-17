const cds = require('@sap/cds');
const { executeHttpRequest } = require('@sap-cloud-sdk/http-client');
const { transformServiceBindingToDestination, registerDestination } = require('@sap-cloud-sdk/connectivity');
const xsenv = require('@sap/xsenv');
const { nextTick } = require('process');
const { PSOSpecials } = cds.entities;
module.exports = class PSOService extends cds.ApplicationService {
    init() {
        this.on('getSpecialsRecord', async (req) => {
            let connection_object = req.data.connection_object;
            console.log(connection_object);
            let res = await SELECT.from(PSOSpecials).where({ connection_object: connection_object }).orderBy('createdAt desc');
            console.log(res.length);
            if (res.length === 0) {
                return null;
            }
            else return res;
        });

        this.on('createSpecials', async (req) => {
            console.log("in create specials");
            req.data.context.record_status = "draft";
            console.log(req.data.context);
            const insertResult = await INSERT.into(PSOSpecials).entries(req.data.context);
            console.log("post success createSpecials: " + insertResult.results[0].affectedRows);
            return insertResult.results[0].affectedRows; //return UUID; ->need UUID in return
        });

        this.on('updateSpecials', async (req) => {
            console.log("in update specials");
            console.log(req.data.context);
            console.log(req.data.recordID);
            const recordID = req.data.recordID;
            //req.data.context.record_status = "draft";
            let oResult = await UPDATE.entity(PSOSpecials, recordID).set({
                work_desc: req.data.context.work_desc,
                meter_number: req.data.context.meter_number,
                record_status: req.data.context.record_status,
                workflow_id: req.data.context.workflow_id
            });
            console.log("post success createSpecials: " + oResult);
            return "success updateSpecials....";
        });
        this.on('initiateWFandUpdateDB', async (req) => {
            console.log(req.data.recordID);
            console.log(req.data.context);
            const wfId = await this.triggerWorkflowPSOSpecials(req.data.recordID, req.data.context);
            if (wfId) {
                req.data.context.record_status = "submitted";
                req.data.context.workflow_id = wfId;
                //    req.data.context.workflow_status = "running";
            }
            console.log(req.data.context);
            const updateResult = this.updateSpecials(req.data.recordID, req.data.context);
            console.log(updateResult);
            console.log("success initiateWFandUpdateDB");
            return "success initiateWFandUpdateDB";

        });
        this.on('submitSpecials', async (req) => {
            console.log("in submit specials");
            let oResult = this.initiateWFandUpdateDB(req.data.recordID, req.data.context);
            console.log("submit specials success : " + oResult);
            return "success submitSpecials....";
        });
        this.on('createAndSubmitSpecials', async (req) => {
            req.data.context.record_status = "draft"
            const insertResult = await INSERT.into(PSOSpecials).entries(req.data.context);
            console.log("new record created: ");
            console.log(insertResult);
            const recordID = insertResult.results[0].values[40]; // need to optimize this
            console.log(recordID);
            const oResult = this.initiateWFandUpdateDB(recordID, req.data.context);
            console.log("submit post success : " + oResult);
            return "success createAndSubmitSpecials....";
        });
        this.on('onApproveRecord', async (req) => {
            const comment = req.data.comment;
            const recordID = req.data.recordID;
            let approvedBy = req.data.approvedBy;
            const record_status = "approved";
            //approver =>req.user.id
            approvedBy = "mickey"; //to make it runtime ...mickey
            console.log(comment);
            console.log(recordID);
            const updateResult = await UPDATE.entity(PSOSpecials, recordID).set({ record_status: record_status, approvedBy: approvedBy, approverComment: comment });
            console.log("success");
            console.log(updateResult);
            let comment1 = "wf comment";
            let wfType = { "comment": comment1 };
            return wfType;
        });
        this.on('onRejectRecord', async (req) => {
            const comment = req.data.comment;
            const recordID = req.data.recordID;
            let approvedBy = req.data.approvedBy;
            const record_status = "rejected";

            approvedBy = "mickey"; //to make it runtime ...mickey
            console.log(comment);
            console.log(recordID);
            const updateResult = await UPDATE.entity(PSOSpecials, recordID).set({ record_status: record_status, approvedBy: approvedBy, approverComment: comment });

            console.log("success");
            console.log(updateResult);
            let comment1 = "wf comment";
            let wfType = { "comment": comment1 };
            return wfType;
        });
        this.on('onVerifyRecordStatus', async (req) => {
            const workflowID = req.data.workflowID;
           // console.log(recordID);
            let res = await SELECT.from(PSOSpecials).where({ workflow_id: workflowID }).columns('record_status');
            console.log(res);
            
            if(res && res.lenght>0){
                const record_status = res[0].record_status;
                if (record_status === "approved" || record_status === "rejected") {
                    return true;
                } else return false;
            }
            return false;
        });
        this.on('userDetails', async (req) => {
            //const user_name = req.req.user.tokenInfo.getPayload().user_name;
            //console.log("logged in user : " + user_name);
            //let userId=req.req.user.id; //U66183 if DTE SSO
            const roles = Object.keys(req.req.user.roles);
            roles.push(req.req.user.tokenInfo.getPayload().email);
            console.log(roles);
            let user=[];
            user.userName= req.req.user.tokenInfo.getPayload().user_name; //U id if DTE SSO otherwise email
            user.email = req.req.user.tokenInfo.getPayload().email; 
            user.hasLimitedDisplay = false;
            user.hasRecordCreateAccess = false;
            user.hasRecordDisplayAccess = false;
            user.hasRecordEditAccess = false;
            user.hasSpecialsCreateAccess = false;
            user.hasSpecialsDisplayAccess = false;
            user.hasSpecialsEditAccess = false;

            for (var i = 0; i < roles.length; i++) {
                /** Logged in user has limited display and cannot view/edit phone numbers */

                let scope = roles[i];
                switch (scope) {
                    
                    case "pso_customer_details_create":
                        user.hasRecordCreateAccess = true;
                        break;
                    case "pso_customer_details_edit":
                        user.hasRecordEditAccess = true;
                        break;
                    case "pso_customer_details_display":
                        user.hasRecordDisplayAccess = true;
                        break;
                    case "pso_customer_details_display_limited":
                        user.hasLimitedDisplay = true;
                        break;
                    case "pso_customer_specials_display":
                        user.hasSpecialsDisplayAccess = true;
                        break;
                    case "pso_customer_specials_edit":
                        user.hasSpecialsEditAccess = true;
                        break;
                    case "pso_customer_specials_create":
                        user.hasSpecialsCreateAccess = true;
                        break;
                    default:
                    // code block
                }
                
            }//end for loop
            console.log(user);
            return roles;

        });
        this.on('triggerWorkflowPSOSpecials', async (req) => {
            console.log(req.data);
            //"completionDate": req.data.context.completionDate,
            let wfPayload =
            {
                "definitionId": "us20.fiori-dev-dte.psoapproval.pSOApproval",
                "context": {
                    "recordID": req.data.recordID,
                    "connectionObject": req.data.context.connection_object,
                    "pSNumber": req.data.context.pSNumber,

                    "workDescription": req.data.context.work_desc,
                    "meterNumber": req.data.context.meter_number,
                    "fedFrom": req.data.context.fedFrom,
                    "cableDescription": req.data.context.cableDescription,
                    "cableFootage": req.data.context.cableFootage,
                    "ductType": req.data.context.ductType,
                    "cTs": req.data.context.cts,
                    "pTs": req.data.context.pts,
                    "_k": req.data.context.k,
                    "_m": req.data.context.m,
                    "fusesAt": req.data.context.fusesAt,
                    "size": req.data.context.size,
                    "_type": req.data.context.typeCR,
                    "curve": req.data.context.curve,
                    "voltage": req.data.context.voltage,

                    "ownedByLBD": req.data.context.ownedByLBD,
                    "manufacturer": req.data.context.manufacturer,
                    "model": req.data.context.model,
                    "continousCurrent": req.data.context.continousCurrent,
                    "loadIntRating": req.data.context.loadIntRating,
                    "kAMomentaryLBD": req.data.context.kAMomentaryLBD,
                    "typeLBD": req.data.context.typeLBD,
                    "faultClosing": req.data.context.faultClosing,
                    "bilLBD": req.data.context.bilLBD,
                    "serviceVoltage": req.data.context.serviceVoltage,
                    "_60CycWithstand": req.data.context.CycWithstand60,
                    "fusesTable": [

                    ],

                    "fuelTypeCB": req.data.context.fuelTypeCB,
                    "ownedByCB": req.data.context.ownedByCB,
                    "circuitBreakerMake": req.data.context.circuitBreakerMake,
                    "serialNumber": req.data.context.serialNo,
                    "kAMomentaryCB": req.data.context.kAMomentaryCB,
                    "amps": req.data.context.amps,
                    "typeCB": req.data.context.typeCB,
                    "faultDuty": req.data.context.faultDuty,
                    "bilCB": req.data.context.bilCB,

                    "ownedByTransformer": req.data.context.ownedByTransformer,
                    "transformerTable": [

                    ]
                }               
            }
            const bp = await cds.connect.to('connectbpa');
            const path = "/workflow/rest/v1/workflow-instances";
            console.log("i am in WF Trigger");
            const res = await bp.send({
                method: 'POST',
                path: path,
                data: wfPayload
            });
            console.log(res);
            return res.id;

        });
        this.on('fetchDestinationURL', async (req) => {
            const destName = req.data.destName;
            const url = "/destination-configuration/v1/subaccountDestinations/" + destName;
            console.log(url);
            const destService = xsenv.getServices({ credentials: { label: 'destination' } });
            let Service = { credentials: destService.credentials, label: 'destination', name: 'destination_api' };

            const inMemoryDestination = await transformServiceBindingToDestination(Service);
            await registerDestination(inMemoryDestination);

            const destinationList = await executeHttpRequest(
                { destinationName: 'destination_api' },
                { method: 'get', url: url }
            );
            console.log(destinationList);
            return destinationList.data.URL;
        });
        this.on('createServiceTicket', async (req) => {

            let c4cPayload = {
                "ProcessingTypeCode": req.data.context.ProcessingTypeCode,
                "Name": req.data.context.Name,
                "ServiceIssueCategoryID": req.data.context.ServiceIssueCategoryID,
                "IncidentServiceIssueCategoryID": req.data.context.IncidentServiceIssueCategoryID,
                "InstallationPointID": req.data.context.InstallationPointID,
                "ProcessorPartyID": req.data.context.ProcessorPartyID,
                "Z_PSO_City_KUT": req.data.context.Z_PSO_City_KUT,
                "Z_PSO_DCPLIND_KUT": req.data.context.Z_PSO_DCPLIND_KUT,
                "Z_PSO_ServiceCenter_KUT": req.data.context.Z_PSO_ServiceCenter_KUT,
                "Z_PSO_Substation_KUT": req.data.context.Z_PSO_Substation_KUT,
                "Z_PSO_Circuit_Trans_KUT": req.data.context.Z_PSO_Circuit_Trans_KUT,
                "Z_PSO_PSCableNo_KUT": req.data.context.Z_PSO_PSCableNo_KUT,
                "Z_PSO_StreetAddress_KUT": req.data.context.Z_PSO_StreetAddress_KUT,
                "Z_PSO_CustomerName_KUT": req.data.context.Z_PSO_CustomerName_KUT,
                "Z_PSO_ZIP_KUT": req.data.context.Z_PSO_ZIP_KUT,
                "ServiceRequestParty": [
                    {
                        "PartyID": req.data.context.PartyID,
                        "RoleCode": req.data.context.RoleCode
                    }
                ]
            };
            console.log(c4cPayload);
            const c4c = await cds.connect.to('C4C');
            const path = "/ServiceRequestCollection";
            console.log("i am in C4C Trigger");
            const res = await c4c.send({
                method: 'POST',
                path: path,
                data: c4cPayload
            });
            console.log(res);
            let id = res.ID + "";
            console.log(id);
            let result = { "value": id };
            return result;
        })
        return super.init();

    }
}