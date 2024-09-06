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
        // this.before('CREATE', 'PSOSpecials', async (req) => {
        //     const res = await this.triggerWorkflowPSOSpecials(req.data);
        //     console.log(res);
        //   //  return next();
        //   return ;
        // });

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
            //  workflow_status: req.data.context.workflow_status
            console.log("post success createSpecials: " + oResult);
            return "success updateSpecials....";
        });
        this.on('initiateWFandUpdateDB', async (req) =>{
            console.log(req.data.recordID);
            console.log(req.data.context);
            const wfId = await this.triggerWorkflowPSOSpecials(req.data.recordID,req.data.context);
            if(wfId){
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
            //let recordID = null;
            //create record -> incase of create initial version or edit approved version
            // if(req.data.recordID === null || req.data.recordID === undefined || req.data.recordID === ""){//if record does not exists
            //     recordID = this.createSpecials(req.data.context);
            // }
            let oResult = this.initiateWFandUpdateDB(req.data.recordID, req.data.context);
           // const wfId = await this.triggerWorkflowPSOSpecials(req.data.recordID,req.data.context);
            // req.data.context.workflow_id = wfId;
            // req.data.context.workflow_status = "running";
            // req.data.context.record_status = "submitted";
            // console.log(req.data.context);
            // console.log(req.data.recordID); //fails on direct submit without saving (1st time)
            //  console.log("WF called completed from submit specials: " + wfId);
            // let oResult;
            // if (req.data.recordID) { //update exisitng entry
            //     console.log("in update block");
            //     const recordID = req.data.recordID;
            //     oResult = await UPDATE.entity(PSOSpecials, recordID).set({ 
            //         work_desc: req.data.context.work_desc,
            //         meter_number: req.data.context.meter_number, 
            //         workflow_id: req.data.context.workflow_id,                   
            //         record_status: req.data.context.record_status,
            //         workflow_status: req.data.context.workflow_status });
            // } else { //create  new record
            //     console.log("in insert block");
            //     oResult = await INSERT.into(PSOSpecials).entries(req.data.context);
            // }
            console.log("submit post success : " + oResult);
            return "success submitSpecials....";
        });
        this.on('createAndSubmitSpecials', async (req) => {
          // const recordID = this.createSpecials(req.data.context);
           req.data.context.record_status = "draft"
           const insertResult = await INSERT.into(PSOSpecials).entries(req.data.context);
           console.log("new record created: ");
           const recordID = insertResult.results[0].values[5];
           console.log(recordID);
           const oResult = this.initiateWFandUpdateDB(recordID, req.data.context);
           console.log("submit post success : " + oResult);
           return "success createAndSubmitSpecials....";
        });
        this.on('onApproveRecord', async (req) => {
            const comment = req.data.comment;
            const recordID = req.data.recordID;
            let approvedBy = req.data.approvedBy;
            const record_status= "approved";
            
            approvedBy = "mickey"; //to make it runtime ...mickey
            console.log(comment);
            console.log(recordID);
            const updateResult = await UPDATE.entity(PSOSpecials, recordID).set({ record_status: record_status, approvedBy: approvedBy, approverComment:comment});
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
            const record_status= "rejected";
            
            approvedBy = "mickey"; //to make it runtime ...mickey
            console.log(comment);
            console.log(recordID);
            const updateResult = await UPDATE.entity(PSOSpecials, recordID).set({ record_status: record_status, approvedBy: approvedBy, approverComment:comment});

            console.log("success");
            console.log(updateResult);
            let comment1 = "wf comment";
            let wfType = { "comment": comment1 };
            return wfType;
        });        
        this.on('userDetails', async (req) => {            
            const userID = req.req.user.tokenInfo.getPayload().user_name;
            console.log("logged in user : "+ userID);
            const roles = Object.keys(req.req.user.roles);
            return roles;
        });
        this.on('triggerWorkflowPSOSpecials', async (req) => {
            console.log(req.data);           

            let wfPayload = 
            {
                "definitionId": "us20.fiori-dev-dte.psoapproval.pSOApproval",
                "context": {
                    "customerName": "",
                    "recordID": req.data.recordID,
                    "connectionObject": req.data.context.connection_object,
                    "address": "",
                    "city": "",
                    "pSNumber": "",
                    "workDescription": req.data.context.work_desc,
                    "meterNumber": req.data.context.meter_number,
                    "kWHRRdg": "",
                    "kVARHRdg": "",
                    "fedFrom": "",
                    "cableDescription": "",
                    "cableFootage": "",
                    "ductType": "",
                    "aB": "",
                    "bC": "",
                    "cA": "",
                    "aN": "",
                    "bN": "",
                    "cN": "",
                    "cTs": "",
                    "pTs": "",
                    "_k": "",
                    "_m": "",
                    "fusesAt": "",
                    "size": "",
                    "_type": "",
                    "curve": "",
                    "voltage": "",
                    "ownedByLBD": "DTE Owned",
                    "manufacturer": "",
                    "model": "",
                    "continousCurrent": "",
                    "loadIntRating": "",
                    "kAMomentary": "",
                    "_type_1": "",
                    "faultClosing": "",
                    "bil": "",
                    "serviceVoltage": "",
                    "_60CycWithstand": "",
                    "fusesTable": [
                       
                    ],
                    "fuelTypeCB": "Oil",
                    "ownedByCB": "DTE Owned",
                    "circuitBreakerMake": "",
                    "serialNumber": "",
                    "kAMomentary_1": "",
                    "amps": "",
                    "_type_3": "",
                    "faultDuty": "",
                    "ownedByTransformer": "DTE Owned",
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
            const url = "/destination-configuration/v1/subaccountDestinations/"+ destName;
            console.log(url);
            const destService = xsenv.getServices({ credentials: { label: 'destination' } });
            let Service = { credentials: destService.credentials, label: 'destination', name: 'destination_api' };

            const inMemoryDestination = await transformServiceBindingToDestination(Service);
            await registerDestination(inMemoryDestination);
            // const destinationList = await executeHttpRequest(
            //     { destinationName: 'destination_api' },
            //     { method: 'get', url: `/destination-configuration/v1/subaccountDestinations/Dev-OpenText` }
            // );
            const destinationList = await executeHttpRequest(
                { destinationName: 'destination_api' },
                { method: 'get', url: url }
            );
            console.log(destinationList);
            return destinationList.data.URL;
        });
        // this.on('POST','ServiceRequestCollection',async(req,next)=>{
        //     const service = await cds.connect.to('C4C');
        //     let data = req.data;
        //     // let oDatac4c = {
        //     //     "ProcessingTypeCode": "ZUSR",
        //     //     "Name": "4002602245",
        //     //     "ServiceIssueCategoryID": "SC_2",
        //     //     "IncidentServiceIssueCategoryID": "IC_5",
        //     //     "ProcessorPartyID": "7000066",
        //     //     "InstallationPointID": "148",
        //     //     "ServiceRequestParty": [
        //     //         {
        //     //             "PartyID": "1100233509",
        //     //             "RoleCode": "10"
        //     //         }
        //     //     ]

        //     // };
        //     let response = await service.send({
        //         method: 'POST',
        //         path: "/ServiceRequestCollection",
        //         data: data
        //     });

        //     return response;
        // })
        this.on('createServiceTicket', async (req)=>{
            let c4cPayload = {
                "ProcessingTypeCode": req.data.context.ProcessingTypeCode,
                "Name": req.data.context.Name,
                "ServiceIssueCategoryID": req.data.context.ServiceIssueCategoryID,
                "IncidentServiceIssueCategoryID": req.data.context.IncidentServiceIssueCategoryID,
                "ProcessorPartyID": req.data.context.ProcessorPartyID,
                "InstallationPointID": req.data.context.InstallationPointID                           
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
            let id = res.ID+"";
            console.log(id);
            let result = { "value": id };
            return result;
        //    let id1 = id.toString();
        //    console.log(id1);
            //return id;

        })
        return super.init();

    }
}