const cds = require('@sap/cds');
const { executeHttpRequest } = require('@sap-cloud-sdk/http-client');
const { transformServiceBindingToDestination, registerDestination } = require('@sap-cloud-sdk/connectivity');
const xsenv = require('@sap/xsenv');
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
            else {
                return res[0];
            }
        });
        this.on('createSpecials', async (req) => {
            console.log("in create specials");
            req.data.context.record_status = "Draft";
            console.log(req.data.context);
            const insertResult = await INSERT.into(PSOSpecials).entries(req.data.context);
            console.log("post success createSpecials: " + insertResult.results[0].affectedRows);
            return insertResult.results[0].affectedRows; //return UUID; ->need UUID in return
        });
        this.on('updateSpecials', async (req) => {
            console.log("in update specials");
            req.data.context.record_status = "Draft";
            const updateResult = await _oUpdateSpecials(req.data.recordID, req.data.context);
            console.log("post success updateSpecials: " + updateResult);
            return "success updateSpecials....";
        });
        this.on('submitSpecials', async (req) => {
            console.log("in submit specials");
            //   let oResult = await initiateWFandUpdateDB(req);
            let oResult = await initiateWFandUpdateDB(req.data.recordID, req.data.context);

            console.log("submit specials success : " + oResult);
            return "success submitSpecials....";
        });
        this.on('createAndSubmitSpecials', async (req) => {
            const connection_object = req.data.context.connection_object;
            req.data.context.record_status = "Draft"
            const insertResult = await INSERT.into(PSOSpecials).entries(req.data.context);
            console.log("new record created: ");
            console.log(insertResult);
            if (insertResult && insertResult.results && insertResult.results.length > 0) {
                const res = await SELECT.from(PSOSpecials).where({ connection_object: connection_object }).orderBy('createdAt desc');
                console.log(res.length);
                if (res.length > 0) {
                    const oResult = await initiateWFandUpdateDB(res[0].ID, res[0]);
                    console.log("trigger and update success : " + oResult);
                    return "success createAndSubmitSpecials....";
                }
                else {
                    console.log("trigger and update  failure : ");
                    return "fail createAndSubmitSpecials...."
                }
            }
            else {
                console.log("create failure : ");
                return "fail createAndSubmitSpecials...."
            }

        });
        this.on('onApproveRecord', async (req) => {
            const recordID = req.data.recordID;
            const comment = req.data.comment;
            const record_status = "Approved";
            console.log(req.data);
            const updateResult = await UPDATE.entity(PSOSpecials, recordID).set({ record_status: record_status, approverComment: comment });
            console.log("success onApproveRecord");
            console.log(updateResult);
            //update ISU POST/Update call

            const isuPOSTResult = await updateSpecialsinISU(req);
            console.log("success isuPOSTResult" + isuPOSTResult);
            let comment1 = "wf comment";
            let wfType = { "comment": comment1 };
            return wfType;
        });
        this.on('onRejectRecord', async (req) => {
            // const recordID = req.data.recordID;
            // const comment = req.data.comment;
            // const record_status = "Rejected";
            // console.log("Rejected WF for "+ req.data.recordID);
            // const updateResult = await UPDATE.entity(PSOSpecials, recordID).set({ record_status: record_status, approverComment: comment });

            // console.log("success");
            // console.log(updateResult);
            // let comment1 = "wf rejected";
            // let wfType = { "comment": comment1 };
            // return wfType;

            const comment = req.data.comment;
            const recordID = req.data.recordID;
            let approvedBy = req.data.approvedBy;
            const record_status = "Rejected";

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
            if (res && res.length > 0) {
                const record_status = res[0].record_status;
                if (record_status === "Approved" || record_status === "Rejected") {
                    return true;
                } else return false;
            }
            return false;
        });

        this.on('userDetails', async (req) => {
            const roles = Object.keys(req.req.user.roles);
            //  roles.push(req.req.user.tokenInfo.getPayload().email);
            roles.push(req.req.authInfo.getEmail());
            console.log(roles);
            // let user = {};
            //req.req.authInfo.getLogonName() ..hd be same as user_name..need to check
            let userName = req.req.user.tokenInfo.getPayload().user_name, //U id if DTE SSO otherwise email
                email = req.req.user.tokenInfo.getPayload().email,
                hasLimitedDisplay = false,
                hasCustomerCreateAccess = false,
                hasCustomerDisplayAccess = false,
                hasCustomerEditAccess = false,
                hasSpecialsCreateAccess = false,
                hasSpecialsDisplayAccess = false,
                hasSpecialsEditAccess = false;

            for (var i = 0; i < roles.length; i++) {
                let scope = roles[i];
                switch (scope) {
                    case "pso_customer_details_create":
                        hasCustomerCreateAccess = true;
                        break;
                    case "pso_customer_details_edit":
                        hasCustomerEditAccess = true;
                        break;
                    case "pso_customer_details_display":
                        hasCustomerDisplayAccess = true;
                        break;
                    case "pso_customer_details_display_limited":
                        hasLimitedDisplay = true;
                        break;
                    case "pso_customer_specials_display":
                        /** Logged in user has limited display and cannot view/edit phone numbers */
                        hasSpecialsDisplayAccess = true;
                        break;
                    case "pso_customer_specials_edit":
                        hasSpecialsEditAccess = true;
                        break;
                    case "pso_customer_specials_create":
                        hasSpecialsCreateAccess = true;
                        break;
                    default:
                    // code block
                }

            }//end for loop
            // console.log(user);
            //  let result = { "value": id };
            let userInfo = {
                "userName": userName,
                "email": email,
                "hasLimitedDisplay": hasLimitedDisplay,
                "hasCustomerCreateAccess": hasCustomerCreateAccess,
                "hasCustomerDisplayAccess": hasCustomerDisplayAccess,
                "hasCustomerEditAccess": hasCustomerEditAccess,
                "hasSpecialsCreateAccess": hasSpecialsCreateAccess,
                "hasSpecialsDisplayAccess": hasSpecialsDisplayAccess,
                "hasSpecialsEditAccess": hasSpecialsEditAccess
            };
            console.log(userInfo);
            return userInfo;

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
                "ServiceRequestUserLifeCycleStatusCode": "1",
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
        });
        // async function _oUpdateSpecials(recordID, req) {
        //   //  const recordID = req.data.recordID;
        //     let oResult = await UPDATE.entity(PSOSpecials, recordID).set({
        //         work_desc: req.data.context.work_desc,
        //         meter_number: req.data.context.meter_number,
        //         record_status: req.data.context.record_status,
        //         workflow_id: req.data.context.workflow_id,

        //         connection_object: req.data.context.connection_object,
        //         approvedBy: req.data.context.approvedBy,
        //         approvedOn: req.data.context.approvedOn,
        //         approverComment: req.data.context.approverComment,
        //         //Customer Record(CR)
        //         pSNumber: req.data.context.pSNumber,
        //         completionDate: req.data.context.completionDate,
        //         fedFrom: req.data.context.fedFrom,
        //         cableDescription: req.data.context.cableDescription,
        //         cableFootage: req.data.context.cableFootage,
        //         ductType: req.data.context.ductType,
        //         cts: req.data.context.cts,
        //         pts: req.data.context.pts,
        //         k: req.data.context.k,
        //         m: req.data.context.m,
        //         fusesAt: req.data.context.fusesAt,
        //         size: req.data.context.size,
        //         typeCR: req.data.context.typeCR,
        //         curve: req.data.context.curve,
        //         voltage: req.data.context.voltage,
        //         //Load Break Disconnect(LBD)
        //         ownedByLBD: req.data.context.ownedByLBD,    //Radiobutton
        //         manufacturer: req.data.context.manufacturer,
        //         model: req.data.context.model,
        //         continuousCurrent: req.data.context.continuousCurrent,
        //         loadIntRating: req.data.context.loadIntRating,
        //         kAMomentaryLBD: req.data.context.kAMomentaryLBD,
        //         typeLBD: req.data.context.typeLBD,
        //         faultClosing: req.data.context.faultClosing,
        //         bilLBD: req.data.context.bilLBD,
        //         serviceVoltage: req.data.context.serviceVoltage,
        //         CycWithstand60: req.data.context.CycWithstand60,
        //         //Circuit Breaker(CB)
        //         fuelTypeCB: req.data.context.fuelTypeCB,    //Radiobutton
        //         ownedByCB: req.data.context.ownedByCB,   //Radiobutton
        //         circuitBreakerMake: req.data.context.circuitBreakerMake,
        //         serialNo: req.data.context.serialNo,
        //         kAMomentaryCB: req.data.context.kAMomentaryCB,
        //         amps: req.data.context.amps,
        //         typeCB: req.data.context.typeCB,
        //         faultDuty: req.data.context.faultDuty,
        //         bilCB: req.data.context.bilCB,
        //         //Transformer
        //         ownedByTransformer: req.data.context.ownedByTransformer,    //Radiobutton

        //         //new fields
        //         meter_number2: req.data.context.meter_number2,
        //         ab: req.data.context.ab,
        //         bc: req.data.context.bc,
        //         ca: req.data.context.ca,
        //         an: req.data.context.an,
        //         bn: req.data.context.bn,
        //         cn: req.data.context.cn,
        //         groundMatResistance: req.data.context.groundMatResistance,
        //         methodUsed: req.data.context.methodUsed,
        //         dateMergered: req.data.context.dateMergered,
        //         comment: req.data.context.comment,
        //         typeofService: req.data.context.typeofService,
        //         typeofTO: req.data.context.typeofTO,
        //         pswDiagramNumber: req.data.context.pswDiagramNumber,
        //         primaryServiceRep: req.data.context.primaryServiceRep

        //     });
        //     console.log("post update specials private: " + oResult);
        //     return "success updateSpecialsprivate....";
        // };
        async function _oUpdateSpecials(recordID, req) {
            //  const recordID = req.data.recordID;
            let oResult = await UPDATE.entity(PSOSpecials, recordID).set({
                work_desc: req.work_desc,
                meter_number: req.meter_number,
                record_status: req.record_status,
                workflow_id: req.workflow_id,

                connection_object: req.connection_object,
                approvedBy: req.approvedBy,
                approvedOn: req.approvedOn,
                approverComment: req.approverComment,
                //Customer Record(CR)
                pSNumber: req.pSNumber,
                completionDate: req.completionDate,
                fedFrom: req.fedFrom,
                cableDescription: req.cableDescription,
                cableFootage: req.cableFootage,
                ductType: req.ductType,
                cts: req.cts,
                pts: req.pts,
                k: req.k,
                m: req.m,
                fusesAt: req.fusesAt,
                size: req.size,
                typeCR: req.typeCR,
                curve: req.curve,
                voltage: req.voltage,
                //Load Break Disconnect(LBD)
                ownedByLBD: req.ownedByLBD,    //Radiobutton
                manufacturer: req.manufacturer,
                model: req.model,
                continuousCurrent: req.continuousCurrent,
                loadIntRating: req.loadIntRating,
                kAMomentaryLBD: req.kAMomentaryLBD,
                typeLBD: req.typeLBD,
                faultClosing: req.faultClosing,
                bilLBD: req.bilLBD,
                serviceVoltage: req.serviceVoltage,
                CycWithstand60: req.CycWithstand60,
                //Circuit Breaker(CB)
                fuelTypeCB: req.fuelTypeCB,    //Radiobutton
                ownedByCB: req.ownedByCB,   //Radiobutton
                circuitBreakerMake: req.circuitBreakerMake,
                serialNo: req.serialNo,
                kAMomentaryCB: req.kAMomentaryCB,
                amps: req.amps,
                typeCB: req.typeCB,
                faultDuty: req.faultDuty,
                bilCB: req.bilCB,
                //Transformer
                ownedByTransformer: req.ownedByTransformer,    //Radiobutton

                //new fields
                meter_number2: req.meter_number2,
                ab: req.ab,
                bc: req.bc,
                ca: req.ca,
                an: req.an,
                bn: req.bn,
                cn: req.cn,
                groundMatResistance: req.groundMatResistance,
                methodUsed: req.methodUsed,
                dateMergered: req.dateMergered,
                comment: req.comment,
                typeofService: req.typeofService,
                typeofTO: req.typeofTO,
                pswDiagramNumber: req.pswDiagramNumber,
                primaryServiceRep: req.primaryServiceRep,
                customerName: req.customerName,
                streetNumber: req.streetNumber,
                streetName: req.streetName

            });
            console.log("post update specials private: " + oResult);
            return "success updateSpecialsprivate....";
        };
        async function initiateWFandUpdateDB(recordID, req) {

            console.log(req);
            const wfId = await triggerWorkflowPSOSpecials(recordID, req);
            if (wfId) {
                req.record_status = "Submitted";
                req.workflow_id = wfId;
            }
            console.log(req);
            const updateResult = await _oUpdateSpecials(recordID, req);
            console.log(updateResult);
            console.log("success initiateWFandUpdateDB");
            return "success initiateWFandUpdateDB";
        };
        async function triggerWorkflowPSOSpecials(recordID, req) {
            console.log(req);
            let comp_date = req.completionDate + "";
            console.log("comp date is: " + comp_date);
            // let recordID = req.data.recordID;
            let wfPayload =
            {
                "definitionId": "us20.fiori-dev-dte.psoapproval.pSOApproval",
                "context": {
                    "recordID": recordID,
                    "connectionObject": req.connection_object,
                    "pSNumber": req.pSNumber,
                    "completionDate": comp_date,
                    "workDescription": req.work_desc,
                    "meterNumber": req.meter_number,
                    "meterNumber2": req.meter_number2,
                    "fedFrom": req.fedFrom,
                    "cableDescription": req.cableDescription,
                    "cableFootage": req.cableFootage,
                    "ductType": req.ductType,
                    "cTs": req.cts,
                    "pTs": req.pts,
                    "_k": req.k,
                    "_m": req.m,
                    "fusesAt": req.fusesAt,
                    "size": req.size,
                    "_type": req.typeCR,
                    "curve": req.curve,
                    "voltage": req.voltage,

                    "ownedByLBD": req.ownedByLBD,
                    "manufacturer": req.manufacturer,
                    "model": req.model,
                    "continousCurrent": req.continuousCurrent,
                    "loadIntRating": req.loadIntRating,
                    "kAMomentaryLBD": req.kAMomentaryLBD,
                    "typeLBD": req.typeLBD,
                    "faultClosing": req.faultClosing,
                    "bilLBD": req.bilLBD,
                    "serviceVoltage": req.serviceVoltage,
                    "_60CycWithstand": req.CycWithstand60,
                    "fusesTable": [

                    ],

                    "fuelTypeCB": req.fuelTypeCB,
                    "ownedByCB": req.ownedByCB,
                    "circuitBreakerMake": req.circuitBreakerMake,
                    "serialNumber": req.serialNo,
                    "kAMomentaryCB": req.kAMomentaryCB,
                    "amps": req.amps,
                    "typeCB": req.typeCB,
                    "faultDuty": req.faultDuty,
                    "bilCB": req.bilCB,

                    "ownedByTransformer": req.ownedByTransformer,
                    "transformerTable": [
                    ],
                    //Other Attributes
                    "ab": req.ab,
                    "bc": req.bc,
                    "ca": req.ca,
                    "an": req.an,
                    "bn": req.bn,
                    "cn": req.cn,
                    "groundMatResistance": req.groundMatResistance,
                    "methodUsed": req.methodUsed,
                    "dateMergered": req.dateMergered,
                    "typeofService": req.typeofService,
                    "typeofTO": req.typeofTO,
                    "primaryServiceRep": req.primaryServiceRep,
                    "pswDiagramNumber": req.pswDiagramNumber,
                    "comment": req.comment
                    //"created_det": oCreatedAt, //req.createdAt,
                    //"created_by": req.createdBy,
                    //"modified_det": oModifiedAt,//req.modifiedAt,
                    //"modified_by": req.modifiedBy,
                }
            }
            console.log(wfPayload);
            const resourceUrl = "/workflow/rest/v1/workflow-instances";
            console.log("#########startingworkflow#####");
            const bp = await cds.connect.to('connectbpa');
            console.log(bp);
            console.log("i am in WF Trigger");
            const res = await bp.send({
                method: 'POST',
                path: resourceUrl,
                data: wfPayload
            });
            console.log("#########:" + res);
            return res.id;
        }

        async function updateSpecialsinISU(req) {

            const recordId = req.data.recordID;
            let relatedRecord = await SELECT.from(PSOSpecials, recordId).columns('connection_object');
            const connection_object = relatedRecord.connection_object;
            let queryResponse = await SELECT.from(PSOSpecials).where({ connection_object: connection_object }).orderBy('createdAt desc');

            console.log(queryResponse);
            const isuRecord = queryResponse[0];


            //    const recordID = req.data.recordID;
            //    const isuRecord = await SELECT.from(PSOSpecials).where({ ID: recordID });
            console.log(isuRecord);
            var oDTEOwnedLBD = "", oCustomerOwnedLBD = "", oNoneLBD = "";
            if (isuRecord.ownedByLBD === "DTE Owned") {
                oDTEOwnedLBD = "X";
            } else if (isuRecord.ownedByLBD === "Customer Owned") {
                oCustomerOwnedLBD = "X";
            } else if (isuRecord.ownedByLBD === "None") {
                oNoneLBD = "X";
            }
            var oAir = "", oOil = "", oVac = "", oSF6 = "";
            if (isuRecord.fuelTypeCB === "Air") {
                oAir = "X";
            } else if (isuRecord.fuelTypeCB === "Oil") {
                oOil = "X";
            } else if (isuRecord.fuelTypeCB === "Vac") {
                oVac = "X";
            } else if (isuRecord.fuelTypeCB === "SF6") {
                oSF6 = "X";
            }
            var oDTEoOwnedCB = "", oCustomerOwnedCB = "";
            if (isuRecord.ownedByCB === "DTE Owned") {
                oDTEoOwnedCB = "X";
            } else if (isuRecord.ownedByCB === "Customer Owned") {
                oCustomerOwnedCB = "X";
            }
            var oCompletionDate = '';
            if (isuRecord.completionDate !== '' && isuRecord.completionDate !== null && isuRecord.completionDate !== undefined) {
                var oCDNewdate = new Date(isuRecord.completionDate);
                var modifiedDate1 = oCDNewdate.toLocaleDateString('en-US');
                // oCompletionDate = modifiedDate1.replace(/\//g, ""); //removing "/"
                oCompletionDate = modifiedDate1.replace(/\/20/, '/');
            }
            var oCreatedAt = '';
            if (isuRecord.createdAt !== '' && isuRecord.createdAt !== null && isuRecord.createdAt !== undefined) {


                var ocreatedAtNewdate = new Date(isuRecord.createdAt);
                var modifiedDate2 = ocreatedAtNewdate.toLocaleDateString('en-US');
                //    oCreatedAt = modifiedDate2.replace(/\//g, ""); //removing "/"
                oCreatedAt = modifiedDate2.replace(/\/20/, '/');
            }
            var oModifiedAt = '';
            if (isuRecord.modifiedAt !== '' && isuRecord.modifiedAt !== null && isuRecord.modifiedAt !== undefined) {
                var oModifiedNewdate = new Date(isuRecord.modifiedAt);
                var modifiedDate3 = oModifiedNewdate.toLocaleDateString('en-US');
                //     oModifiedAt = modifiedDate3.replace(/\//g, ""); //removing "/"
                oModifiedAt = modifiedDate3.replace(/\/20/, '/');
            }
            let oSpecialsISUPayload =
            {
                "conn_obj": isuRecord.connection_object,
                //Customer Record
                "ps_no": isuRecord.pSNumber,
                "com_date": oCompletionDate,
                "work_desc": isuRecord.work_desc,
                "Meter1": isuRecord.meter_number,
                "Meter2": isuRecord.meter_number2,  //Field not available in HANA
                "fed": isuRecord.fedFrom,
                "cable_desc": isuRecord.cableDescription,
                "cable_foot": isuRecord.cableFootage,
                "CTs": isuRecord.cts,
                "PTs": isuRecord.pts,
                "K": isuRecord.k,
                "M": isuRecord.m,
                "duct_type": isuRecord.ductType,
                "fuse_at": isuRecord.fusesAt,
                "size": isuRecord.size,
                "type": isuRecord.typeCR,
                "Curve": isuRecord.curve,
                "voltage": isuRecord.voltage,

                //Load Break Disconnect
                "detto": oDTEOwnedLBD, // DTE Owned Radio button of LBD
                "custo": oCustomerOwnedLBD,// Customer Owned Radio button of LBD
                "none": oNoneLBD,// None Radio button of LBD
                "manuf": isuRecord.manufacturer,
                "model": isuRecord.model,
                "cont_curr": isuRecord.continuousCurrent,
                "lir": isuRecord.loadIntRating,
                "KAM": isuRecord.kAMomentaryLBD,
                "LB_type": isuRecord.typeLBD,
                "fault_closing": isuRecord.faultClosing,
                "lb_bil": isuRecord.bilLBD,
                "serv_volt": isuRecord.serviceVoltage,
                "lb_60_cyc": isuRecord.CycWithstand60,

                //Circuit Breaker
                "air": oAir, //Air Radio button
                "oil": oOil,//Oil Radio button
                "vac": oVac,//Vac Radio button
                "sf6": oSF6, //Sf6 Radio button
                "circ_break": isuRecord.circuitBreakerMake,
                "serial_no": isuRecord.serialNo,
                "cb_detto": oDTEoOwnedCB,// DTE Owned CB Radio button
                "cb_custo": oCustomerOwnedCB,// Customer Owned CB Radio button
                "kamom": "",//KA momentary for CB
                "amp": isuRecord.amps,
                "cb_type": isuRecord.typeCB,
                "fault_duty": isuRecord.faultDuty,
                "cb_bil": isuRecord.bilCB,

                //Other Attributes
                "AB": isuRecord.ab,
                "BC": isuRecord.bc,
                "CA": isuRecord.ca,
                "AN": isuRecord.an,
                "BN": isuRecord.bn,
                "CN": isuRecord.cn,
                "grmatres": isuRecord.groundMatResistance,
                "method_used": isuRecord.methodUsed,
                "Date_megg": isuRecord.dateMergered,
                "Type_serv": isuRecord.typeofService,
                "type_TO": isuRecord.typeofTO,
                "psr": isuRecord.primaryServiceRep,
                "psw": isuRecord.pswDiagramNumber,
                //"comments": isuRecord.comments, 
                "created_det": oCreatedAt, //isuRecord.createdAt,
                "created_by": isuRecord.createdBy,
                "modified_det": oModifiedAt,//isuRecord.modifiedAt,
                "modified_by": isuRecord.modifiedBy,

                //Extra Attributes
                //"Meas_volt": isuRecord.voltage,	//need clearification  
                //"AMA_verif": "",
                "app_by": isuRecord.modifiedBy,
                "app_date": oModifiedAt//isuRecord.modifiedAt
                //"trasdat": "",	//Start Date , Need info
                //"traedat": "",	//End Date , Need info
                //"ID": isuRecord[0].ID,	//Field not available in ISU
                //"approverComment": isuRecord[0].approverComment,//Field not available in ISU
                //"record_status": isuRecord[0].record_status	//Field not available in ISU
                //"workflow_id": isuRecord[0].workflow_id 	//Field not available in ISU

            };

            console.log(oSpecialsISUPayload);
            const isu = await cds.connect.to('ISU');
            /////////////////////////////////new code/////////////////
            let isuUpdateFlag = true;
            let result = '';
            if (queryResponse.length === 1) {
                //create record in ISU  
                isuUpdateFlag = false;
                oSpecialsISUPayload.upd_flag = "X";
                console.log(oSpecialsISUPayload);
                const path = "/sap/opu/odata/sap/ZPSO_CHLD_CO_CRE_UPD_SRV/Primary_service_recordSet";
                //   const path = "/sap/opu/odata/SAP/ZPSO_CHLD_CO_CRE_UPD_SRV/Primary_service_recordSet?$expand=psrtofusenav,psrtotransnav"

                console.log("i am in ISU create");
                try {
                    const res = await isu.send({
                        method: 'POST',
                        path: path,
                        data: oSpecialsISUPayload
                    });
                    console.log(res);
                    result = res;
                } catch (e) {
                    console.log(e);
                }
            }
            else if (queryResponse.length > 1) {
                //update record in ISU
                isuUpdateFlag = true;
                const connection_object = isuRecord.connection_object;
                // delete oSpecialsISUPayload.conn_obj;
                //   oSpecialsISUPayload.upd_flag = "X";
                console.log(oSpecialsISUPayload);
                const path = "/sap/opu/odata/sap/ZPSO_CHLD_CO_CRE_UPD_SRV/Primary_service_recordSet(conn_obj='" + connection_object + "')";

                //const path = "/sap/opu/odata/SAP/ZPSO_CHLD_CO_CRE_UPD_SRV/Primary_service_recordSet?$expand=psrtofusenav,psrtotransnav"
                console.log(path);
                console.log("i am in ISU update");
                try {
                    const res = await isu.send({
                        method: 'PUT',
                        path: path,
                        data: oSpecialsISUPayload
                    });
                    console.log(res);
                    result = res;
                } catch (e) {
                    console.log(e);
                }
            }

            console.log(result);
            // let id = result.ID + "";
            // console.log(id);
            // let result1 = { "value": id };
            return result;
        };
        return super.init();
    }
}