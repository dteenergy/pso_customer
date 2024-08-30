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

        // this.on('onApproveRecord', async (req) => {
        //     let comment = req.data.comment;
        //     console.log(comment);
        //     //update HANA Cloud Record
        //     //Trigger oData POST call
        //     //Unlock record in UI screen
        // });

        this.on('createSpecials', async (req) => {
            console.log("in create specials");
            req.data.context.record_status = "draft";
            console.log(req.data.context);
            const insertResult = await INSERT.into(PSOSpecials).entries(req.data.context);
            console.log("post success createSpecials: " + insertResult.results[0].affectedRows);
            return insertResult.results[0].affectedRows;
        });
        
        this.on('updateSpecials', async (req) => {
            console.log("in update specials");
            console.log(req.data.context);
            console.log(req.data.ID);
            const recordID = req.data.ID;
            req.data.context.record_status = "draft";
            let oResult = await UPDATE.entity(PSOSpecials, recordID).set({ 
                work_desc: req.data.context.work_desc,
                meter_number: req.data.context.meter_number,                    
                record_status: req.data.context.record_status,
            });
            console.log("post success createSpecials: " + oResult);
            return "success updateSpecials....";
        });
        this.on('submitSpecials', async (req) => {
            console.log("in submit specials");
            const wfId = await this.triggerWorkflowPSOSpecials();
            req.data.context.workflow_id = wfId;
            req.data.context.workflow_status = "running";
            req.data.context.record_status = "submitted";
            console.log(req.data.context);
            console.log(req.data.recordID); //fails on direct submit without saving (1st time)
            //  console.log("WF called completed from submit specials: " + wfId);
            let oResult;
            if (req.data.recordID) { //update exisitng entry
                console.log("in update block");
                const recordID = req.data.recordID;
                oResult = await UPDATE.entity(PSOSpecials, recordID).set({ 
                    work_desc: req.data.context.work_desc,
                    meter_number: req.data.context.meter_number, 
                    workflow_id: req.data.context.workflow_id,                   
                    record_status: req.data.context.record_status,
                    workflow_status: req.data.context.workflow_status });
            } else { //create  new record
                console.log("in insert block");
                oResult = await INSERT.into(PSOSpecials).entries(req.data.context);
            }
            console.log("submit post success : " + oResult);
            return "success submitSpecials....WF POST";
        });
        this.on('onApproveRecord1', async (req) => {
            const comment = req.data.comment;
            const recordID = req.data.recordID;
            console.log(comment);
            console.log(recordID);
            req.data.approvedBy = "mickey";
            const workflow_status = "approved";
            const approvedBy = req.data.approvedBy;
            //   const updateResult = await UPSERT.into(PSOSpecials).entries({ID:'bfc20b16-a989-4ccb-bd9a-abe80f4e0d00', approvedBy:'mickey'});
            const updateResult = await UPDATE.entity(PSOSpecials, recordID).set({ approvedBy: approvedBy , workflow_status: workflow_status});

            console.log("success");
            console.log(updateResult);
            //     console.log("update success : "+ updateResult.results[0].affectedRows);
            let comment1 = "wf comment";
            let wfType = { "comment": comment1 };
            return wfType;
            // await UPDATE.entity(PSOSpecials, 'a1157686-af0c-4dc1-933d-028f3cae6818')
            // .set({meter_number:'meter 333'});

            // await UPDATE.entity(PSOSpecials, 'a1157686-af0c-4dc1-933d-028f3cae6818')
            //...set({comment:comment});
            //console.log("metre 333");
            //Trigger oData POST call
            //Unlock record in UI screen
            //console.log("success");
        });
        this.on('onRejectRecord', async (req) => {
            let comment = req.data.comment;
            console.log(comment);
            //update HANA Cloud Record          
            //Unlock record in UI screen
        });
        this.on('userDetails', async (req) => {
            //    let a = [];
            //    console.log("start");
            //    console.log(JSON.stringify(req.req.user.roles));// {"openid":1,"pso_search_customer":1} -> keys
            //    let userRoles = JSON.stringify(req.req.user.roles);

            //    console.log(roles);
            //    console.log(JSON.stringify(req.req.user.tokenInfo.getPayload().scope[1]));//psocustomerecord-primaryserviceorg-PrimaryServiceTeam-Dev!t1203.pso_search_customer
            //    let scopes = req.req.user.tokenInfo.getPayload().scope;
            //    for (let i = 0; i < scopes.length; i++) {
            //        a.push(scopes[i]);
            //    a.push({ scope: scopes[i] });
            //    }

            //add to global model
            //    console.log(a);
            //  let b = req.req.user.roles;
            //  a.push({scope:"success"});
            //    console.log("end");
            const roles = Object.keys(req.req.user.roles);
            return roles;
        });
        this.on('triggerWorkflowPSOSpecials', async (req) => {
            let wfPayload = {
                "definitionId": "us20.fiori-dev-dte.psoapproval.pSOApproval",
                "context": {
                    "recordID": "bfc20b16-a989-4ccb-bd9a-abe80f4e0d00",
                    "customerID": "123456789",
                    "customerName": "",
                    "address": "",
                    "city": "",
                    "pSNumber": "",
                    "workDescription": "",
                    "meterNumber": "",
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
                    "newChoice_3": "DTE Owned",
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
                    "newTable": [
                    ],
                    "newChoice": "Air",
                    "newChoice_1": "DTE Owned",
                    "circuitBreakerMake": "",
                    "serialNumber": "",
                    "kAMomentary_1": "",
                    "amps": "",
                    "_type_3": "",
                    "faultDuty": "",
                    "newChoice_2": "DTE Owned",
                    "newTable_1": [
                    ]
                }
            }
            const bp = await cds.connect.to('connectbpa');
            const path = "/workflow/rest/v1/workflow-instances";
            console.log("i am in WF Trigger");
            //   console.log("payload from services: " + wfPayload.context.inputpayload);
            const res = await bp.send({
                method: 'POST',
                path: path,
                data: wfPayload
            });
            //       console.log("WF triggered : " + res.id);
            console.log(res);
            return res.id;

        });

        this.on('launchOpenTextURL', async (req) => {
            const destService = xsenv.getServices({ credentials: { label: 'destination' } });
            let Service = { credentials: destService.credentials, label: 'destination', name: 'destination_api' };

            const inMemoryDestination = await transformServiceBindingToDestination(Service);
            await registerDestination(inMemoryDestination);
            const destinationList = await executeHttpRequest(
                { destinationName: 'destination_api' },
                { method: 'get', url: `/destination-configuration/v1/subaccountDestinations/Dev-OpenText` }
            );
            console.log(destinationList);
            return destinationList.data.URL;
        });

        return super.init();

    }
}