const cds = require('@sap/cds');
const { executeHttpRequest } = require('@sap-cloud-sdk/http-client');
const { transformServiceBindingToDestination, registerDestination } = require('@sap-cloud-sdk/connectivity');
const xsenv = require('@sap/xsenv');
const { PSOSpecials } = cds.entities;
module.exports = class PSOService extends cds.ApplicationService {
    init() {
        this.on('userDetails', async (req) => {
            const roles = Object.keys(req.req.user.roles);
            //roles.push(req.req.authInfo.getEmail());
            console.log(roles);
            if (roles.length < 2) {
                console.error("NO PSO Roles assigned!");
                return false;
            }
            let userName = req.req.user.tokenInfo.getPayload().user_name, //U id if DTE SSO otherwise email
                email = req.req.user.tokenInfo.getPayload().email,
                hasSearchAccess = false,
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
                    case "pso_search_customer":
                        hasSearchAccess = true;
                        break;
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

            }
            let userInfo = {
                "userName": userName,
                "email": email,
                "hasSearchAccess": hasSearchAccess,
                "hasLimitedDisplay": hasLimitedDisplay,
                "hasCustomerCreateAccess": hasCustomerCreateAccess,
                "hasCustomerDisplayAccess": hasCustomerDisplayAccess,
                "hasCustomerEditAccess": hasCustomerEditAccess,
                "hasSpecialsCreateAccess": hasSpecialsCreateAccess,
                "hasSpecialsDisplayAccess": hasSpecialsDisplayAccess,
                "hasSpecialsEditAccess": hasSpecialsEditAccess
            };
            //    console.log(userInfo);
            return userInfo;

        });
        this.on('getSpecialsRecord', async (req) => {
            console.log("getSpecialsRecord for : " + req.data.connection_object);
            const result = await _fetchRecordFromHANA(req.data.connection_object);
            return result;
        });
        async function _fetchRecordFromHANA(connection_object) {
            const record_HANA = await SELECT.from(PSOSpecials, a => { a`.*`, a.fuses(b => { b`.*` }), a.transformers(b => { b`.*` }) }).where({ connection_object: connection_object }).orderBy('createdAt desc');
            if (record_HANA.length === 0) {
                const migratedData = await _fetchRecordFromISU(connection_object);
                if (migratedData !== null && migratedData !== undefined && migratedData !== "") {
                    const migratedDataModified = await getUpdatedrecord(migratedData);
                    console.log(migratedDataModified);
                    //    const affectedRows = await _createPSORecord(migratedDataModified);
                    try {
                        const insertResult = await INSERT.into(PSOSpecials).entries(migratedDataModified);
                        if (insertResult.results[0].affectedRows > 0) {
                            const result = await _fetchRecordFromHANA(connection_object);
                            console.log(result);
                            return result;
                        }
                        else return null;
                    } catch (oError) {
                        console.error(oError);
                    }
                }
                else return null; // no data present in ISU/HANA            
            }
            else {
                return record_HANA[0];
            }
        }

        async function _fetchRecordFromISU(connection_object) {
            let path = "/sap/opu/odata/SAP/ZPSO_CHLD_CO_CRE_UPD_SRV/Primary_service_recordSet(conn_obj='" + connection_object + "')?$expand=psrtofusenav,psrtotransnav";
            //  let path = "/sap/opu/odata/SAP/ZPSO_CHLD_CO_CRE_UPD_SRV/Primary_service_recordSet(conn_obj='" + connection_object + "')";

            console.log("i am in ISU GET: " + path);
            try {
                const isu = await cds.connect.to('ISU');
                const migratedData = await isu.send({
                    method: 'GET',
                    path: path
                });
                console.log(migratedData); //ZIFLOT - ZPS_CD_MIGCRDETAILS
                if (migratedData !== null && migratedData !== undefined && migratedData !== "") {
                    return migratedData;
                }
                else return null;
            }
            catch (e) {
                // console.log(e);
                console.error("Run into ISU Get Specials error for " + connection_object);
                console.error("Error " + e.reason.status + " : " + e.reason.code + " : " + e.reason.message);
                //let result = { "value": "Error" };
                return "error";
            }

        }

        async function getUpdatedrecord(result) {

            let record_status = "Approved";
            if (result.mig_details !== null && result.mig_details !== undefined && result.mig_details !== "") {
                // approved migrated data available in ISU 
                record_status = "Approved";
            }
            else {
                record_status = "Draft";
            }

            var oDTEOwnedLBD = "DTE Owned";
            if (result.detto === "X") {
                oDTEOwnedLBD = "DTE Owned";
            } else if (result.custo === "X") {
                oDTEOwnedLBD = "Customer Owned";
            } else if (result.none === "X") {
                oDTEOwnedLBD = "None";
            }
            var oAir = "Air";
            if (result.air === "X") {
                oAir = "Air";
            } else if (result.oil === "X") {
                oAir = "Oil";
            } else if (result.vac === "X") {
                oAir = "Vac";
            } else if (result.sf6 === "X") {
                oAir = "SF6";
            }
            var oDTEoOwnedCB = "DTE Owned";
            if (result.cb_detto === "X") {
                oDTEoOwnedCB = "DTE Owned";
            } else if (result.cb_custo === "X") {
                oDTEoOwnedCB = "Customer Owned";
            }
            let fuses = [];
            for (let i = 0; i < result.psrtofusenav.length; i++) {
                let fuse = {
                    "fuseSize": result.psrtofusenav[i].Size,
                    "fuseType": result.psrtofusenav[i].type,
                    "fuseCurve": result.psrtofusenav[i].curve,
                    "fuseVoltage": result.psrtofusenav[i].vol,
                    "fuseSeqNo": result.psrtofusenav[i].Zseqno,
                    "fusesStartDate": result.psrtofusenav[i].start_date,
                    "fusesEndDate": result.psrtofusenav[i].end_date,                  
                    //"psospecials_ID": result.psrtofusenav[i].psospecials_ID,
                    "psospecials_connection_object": result.conn_obj
                }
                fuses.push(fuse);
            }
            let oDTEoOwnedTrans = "DTE Owned";
            let transformers = [];
            for (let i = 0; i < result.psrtotransnav.length; i++) {
                let trans = {
                    "psospecials_connection_object": result.conn_obj,
                    //"psospecials_ID": recordID,  
                    "transSeqNo": result.psrtotransnav[i].seqno,
                    "manufacturer": result.psrtotransnav[i].man,
                    "imped": result.psrtotransnav[i].imp,
                    "secVolt": result.psrtotransnav[i].sec_vol,
                    "taps": result.psrtotransnav[i].taps,
                    "primVolt": result.psrtotransnav[i].pri_vol,
                    "kva": result.psrtotransnav[i].kva,
                    "serial": result.psrtotransnav[i].serial,
                    "type": result.psrtotransnav[i].type,
                    "transStartDate": result.psrtotransnav[i].start_date,
                    "transEndDate": result.psrtotransnav[i].end_date
                }
                transformers.push(trans);
                if (i === 0) {

                    if (result.psrtotransnav[0].dteo === "X") {
                        oDTEoOwnedTrans = "DTE Owned";
                    } else if (result.psrtotransnav[0].cuso === "X") {
                        oDTEoOwnedTrans = "Customer Owned";
                    }
                }
            }

            const migratedPayload = {
                connection_object: result.conn_obj,
                work_desc: result.work_desc,
                meter_number: result.Meter1,
                record_status: record_status,

                //Customer Record(CR)
                pSNumber: result.ps_no,
                completionDate: result.com_date,
                fedFrom: result.fed,
                cableDescription: result.cable_desc,
                cableFootage: result.cable_foot,
                ductType: result.duct_type,
                cts: result.CTs,
                pts: result.PTs,
                k: result.K,
                m: result.M,
                fusesAt: result.fuse_at,
                size: result.size,
                typeCR: result.type,
                curve: result.Curve,
                voltage: result.voltage,
                //Load Break Disconnect(LBD)
                ownedByLBD: oDTEOwnedLBD,    //Radiobutton- detto,custo,none
                manufacturer: result.manuf,
                model: result.model,
                continuousCurrent: result.cont_curr,
                loadIntRating: result.lir,
                kAMomentaryLBD: result.KAM,
                typeLBD: result.LB_type,
                faultClosing: result.fault_closing,
                bilLBD: result.lb_bil,
                serviceVoltage: result.serv_volt,
                CycWithstand60: result.lb_60_cyc,
                //Circuit Breaker(CB)
                fuelTypeCB: oAir,    //Radiobutton fields air, oil, vac, sf6
                ownedByCB: oDTEoOwnedCB,   //Radiobutton fields cb_detto, cb_custo
                circuitBreakerMake: result.circ_break,
                serialNo: result.serial_no,
                kAMomentaryCB: result.kamom,
                amps: result.amp,
                typeCB: result.cb_type,
                faultDuty: result.fault_duty,
                bilCB: result.cb_bil,
                //Transformer
                ownedByTransformer: oDTEoOwnedTrans,    //Radiobutton

                //new fields
                meter_number2: result.Meter2,
                ab: result.AB,
                bc: result.BC,
                ca: result.CA,
                an: result.AN,
                bn: result.BN,
                cn: result.CN,
                groundMatResistance: result.grmatres,
                methodUsed: result.method_used,
                //dateMergered: result.Date_megg,
                comment: "",
                typeofService: result.Type_serv,
                typeofTO: result.type_TO,
                pswDiagramNumber: result.psw,
                primaryServiceRep: result.psr,
                customerName: "", //result.customerName,
                streetNumber: "", //result.streetNumber,
                streetName: "",  //result.streetName,
                fuses: fuses,
                transformers: transformers

            }
            return migratedPayload;
        }
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
                //"Z_PSO_City_KUT": req.data.context.Z_PSO_City_KUT,
                "Z_PSO_DCPLIND_KUT": req.data.context.Z_PSO_DCPLIND_KUT,
                "Z_PSO_ServiceCenter_KUT": req.data.context.Z_PSO_ServiceCenter_KUT,
                "Z_PSO_Substation_KUT": req.data.context.Z_PSO_Substation_KUT,
                "Z_PSO_Circuit_Trans_KUT": req.data.context.Z_PSO_Circuit_Trans_KUT,
                "Z_PSO_PSCableNo_KUT": req.data.context.Z_PSO_PSCableNo_KUT,
                //"Z_PSO_StreetAddress_KUT": req.data.context.Z_PSO_StreetAddress_KUT,
                "Z_PSO_CustomerName_KUT": req.data.context.Z_PSO_CustomerName_KUT,
                //"Z_PSO_ZIP_KUT": req.data.context.Z_PSO_ZIP_KUT,
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
            try {
                const res = await c4c.send({
                    method: 'POST',
                    path: path,
                    data: c4cPayload
                });
                //  console.log(res);
                let id = res.ID + "";
                console.log("POO Created with id = " + id);
                let result = { "value": id };
                return result;
            }
            catch (e) {
                console.error("Run into POO Creation error.....");
                console.error("Error " + e.reason.status + " : " + e.reason.code + " : " + e.reason.message);
                let result = { "value": "Error" };
                return result;
            }
        });

        this.on('submitSpecials', async (req) => {
            console.log("in submit specials");

            const connection_object = req.data.connection_object;
            const record_HANA = await SELECT.from(PSOSpecials, a => { a`.*`, a.fuses(b => { b`.*` }), a.transformers(b => { b`.*` }) }).where({ connection_object: connection_object }).orderBy('createdAt desc');
            if (record_HANA.length > 0) {
                const record = record_HANA[0];
                const workflow_id = await triggerWorkflowPSOSpecials(record);

                if (workflow_id && workflow_id !== "error") {
                    const record_status = "Submitted";
                    const updateResult = await UPDATE.entity(PSOSpecials, record.ID).set({ record_status: record_status, workflow_id: workflow_id });
                    console.log(updateResult);
                    console.log("submit specials success" + updateResult);
                    //  console.log("submit specials success : " + oResult);
                    return "success";
                }
                else {
                    // return "error";
                    return req.error({ code: "400", messsage: 'Error' });

                }
            }
        });
        async function triggerWorkflowPSOSpecials(req) {
            console.log(req);
            let comp_date;
            if (req.completionDate === null || req.completionDate === undefined) {
                comp_date = '';
            }
            else {
                comp_date = req.completionDate;
            }

            let oDateMergered;
            if (req.dateMergered === null || req.dateMergered === undefined) {
                oDateMergered = '';
            }
            else {
                oDateMergered = req.dateMergered;
            }

            let oFusesStartDate;
            if (req.fusesStartDate === null || req.fusesStartDate === undefined) {
                oFusesStartDate = '';
            }
            else {
                oFusesStartDate = req.fusesStartDate;
            }

            let fusesEndDate;
            if (req.fusesEndDate === null || req.fusesEndDate === undefined) {
                fusesEndDate = '';
            }
            else {
                fusesEndDate = req.fusesEndDate;
            }

            let transStartDate;
            if (req.transStartDate === null || req.transStartDate === undefined) {
                transStartDate = '';
            }
            else {
                transStartDate = req.transStartDate;
            }

            let transEndDate;
            if (req.transEndDate === null || req.transEndDate === undefined) {
                transEndDate = '';
            }
            else {
                transEndDate = req.transEndDate;
            }



            console.log("comp date is: " + comp_date);
            let fuses = [];
            for (let i = 0; i < req.fuses.length; i++) {
                let oFusesStartDate;
                if (req.fuses[i].fusesStartDate === null || req.fuses[i].fusesStartDate === undefined) {
                    oFusesStartDate = '';
                }else{
                    oFusesStartDate = req.fuses[i].fusesStartDate;
                }
                let oFusesEndDate;
                if (req.fuses[i].fusesEndDate === null || req.fuses[i].fusesEndDate === undefined) {
                    oFusesEndDate = '';
                }else{
                    oFusesEndDate = req.fuses[i].fusesStartDate;
                }
                var fuse = {
                    "SeqNo": req.fuses[i].fuseSeqNo,
                    "Size": req.fuses[i].fuseSize,
                    "Type": req.fuses[i].fuseType,
                    "Curve": req.fuses[i].fuseCurve,
                    "Voltage": req.fuses[i].fuseVoltage,
                    "fusesStartDate": oFusesStartDate,
                    "fusesEndDate": oFusesEndDate
                }
                fuses.push(fuse);
            }
            let transformers = [];
            for (let i = 0; i < req.transformers.length; i++) {
                let oTransStartDate;
                if (req.transformers[i].transStartDate === null || req.transformers[i].transStartDate === undefined) {
                    oTransStartDate = '';
                }else{
                    oTransStartDate = req.transformers[i].transStartDate;
                }

                let oTransEndDate;
                if (req.transformers[i].transEndDate === null || req.transformers[i].transEndDate === undefined) {
                    oTransEndDate = '';
                }else{
                    oTransEndDate = req.transformers[i].transEndDate;
                }

                var transformer = {
                    "transSeqNo": req.transformers[i].transSeqNo,
                    "manufacturer": req.transformers[i].manufacturer,
                    "imped": req.transformers[i].imped,
                    "primVolt": req.transformers[i].primVolt,
                    "secVolt": req.transformers[i].secVolt,
                    "taps": req.transformers[i].taps,
                    "kva": req.transformers[i].kva,
                    "type": req.transformers[i].type,
                    "serial": req.transformers[i].serial,
                    "transStartDate": oTransStartDate,
                    "transEndDate": oTransEndDate
                }
                transformers.push(transformer);
            }
            let wfPayload =
            {
                "definitionId": "us20.fiori-dev-dte.psoapproval.pSOApproval",
                "context": {
                    "recordID": req.ID,
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
                    // "table": fuses,

                    fusesTable: fuses,
                    transTable: transformers,
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

                    //Other Attributes
                    "ab": req.ab,
                    "bc": req.bc,
                    "ca": req.ca,
                    "an": req.an,
                    "bn": req.bn,
                    "cn": req.cn,
                    "groundMatResistance": req.groundMatResistance,
                    "methodUsed": req.methodUsed,
                    "dateMergered": oDateMergered,
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
            try {
                const res = await bp.send({
                    method: 'POST',
                    path: resourceUrl,
                    data: wfPayload
                });
                console.log("#########:" + res);
                return res.id;
            }
            catch (e) {
                console.error("Run into Workflow Trigger error.....");
                console.error("Error " + e.reason.status + " : " + e.reason.code + " : " + e.reason.message);
                //    console.error(e);
                return "error";
            }

        }
        this.on('onApproveRecord', async (req) => {
            const recordID = req.data.recordID;
            let comment = req.data.comment;
            let record_status = "Approved";
            const approvedBy = req.req.user.id;
            const Cdate = new Date();
            const approvedOn = Cdate.toLocaleDateString('en-US');
            let value = ""
            try {
                //update ISU
                const isuPOSTResult = await updateSpecialsinISU(req);
                console.log("ISU POST Result = " + isuPOSTResult);
                //update HANA
                if (isuPOSTResult === "success") {
                    const updateResult = await UPDATE.entity(PSOSpecials, recordID).set({ record_status: record_status, approvedBy: approvedBy, approvedOn: approvedOn, approverComment: comment });
                    console.log("DB Update successful " + updateResult);
                    value = "ISU update Successful";
                } else {
                    record_status = "Draft";
                    comment = comment + "*** ISU update Failed, resend for approval."
                    const updateResult = await UPDATE.entity(PSOSpecials, recordID).set({ record_status: record_status, approvedBy: approvedBy, approvedOn: approvedOn, approverComment: comment });
                    value = "ISU update Failed";
                    console.error("ISU update Failed");
                    //    let comment1 = "Update on Approve Failed";
                }

                let result = { "value": value };
                return result;
            }
            catch (oError) {
                console.error(oError);
                value = "DB update Failed";
                let result = { "value": value };
                return result;
            }
        });
        this.on('onRejectRecord', async (req) => {
            const recordID = req.data.recordID;
            const comment = req.data.comment;
            const record_status = "Rejected";
            const approvedBy = req.req.user.id;
            const Cdate = new Date();
            const approvedOn = Cdate.toLocaleDateString('en-US');
            console.log("Rejected WF for " + req.data.recordID);
            const updateResult = await UPDATE.entity(PSOSpecials, recordID).set({ record_status: record_status, approvedBy: approvedBy, approvedOn: approvedOn, approverComment: comment });

            console.log("success");
            console.log(updateResult);
            let value = "Workflow successfully rejected";
            let result = { "value": value };
            return result;
        });
        this.on('onVerifyRecordStatus', async (req) => {
            const workflowID = req.data.workflowID;
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
        async function updateSpecialsinISU(req) {

            const recordId = req.data.recordID;
            let relatedRecord = await SELECT.from(PSOSpecials, recordId).columns('connection_object');
            const connection_object = relatedRecord.connection_object;
            //  let queryResponse = await SELECT.from(PSOSpecials).where({ connection_object: connection_object }).orderBy('createdAt desc');
            const queryResponse = await SELECT.from(PSOSpecials, a => { a`.*`, a.fuses(b => { b`.*` }), a.transformers(b => { b`.*` }) }).where({ connection_object: connection_object }).orderBy('createdAt desc');

            console.log(queryResponse);
            const isuRecord = queryResponse[0];
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
            var oDateMeggered = '';
            if (isuRecord.dateMergered !== '' && isuRecord.dateMergered !== null && isuRecord.dateMergered !== undefined) {
                var oCDNewdateDM = new Date(isuRecord.dateMergered);
                var modifiedDateDM = oCDNewdateDM.toLocaleDateString('en-US');
                // oDateMeggered = modifiedDate1.replace(/\//g, ""); //removing "/"
                oDateMeggered = modifiedDateDM.replace(/\/20/, '/');
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
            //fuses payload
            let fuses = [];
            for (let i = 0; i < isuRecord.fuses.length; i++) {
                var fuse = {
                    "Zseqno": isuRecord.fuses[i].fuseSeqNo,
                    "Ztplnr": isuRecord.connection_object,
                    "Size": isuRecord.fuses[i].fuseSize,
                    "type": isuRecord.fuses[i].fuseType,
                    "curve": isuRecord.fuses[i].fuseCurve,
                    "vol": isuRecord.fuses[i].fuseVoltage,
                    "start_date": isuRecord.fuses[i].fusesStartDate,
                    "end_date": isuRecord.fuses[i].fusesEndDate,
                    "Comments": "",
                    "Comments2": ""
                }
                fuses.push(fuse);
            }

            //transformers payload
            let DTEOwnedTrans = "", CustOwnedTrans = ""
            if (isuRecord.ownedByTransformer === "DTE Owned") {
                DTEOwnedTrans = "X";
            } else if (isuRecord.ownedByTransformer === "Customer Owned") {
                CustOwnedTrans = "X";
            }
            let transformers = [];
            for (let i = 0; i < isuRecord.transformers.length; i++) {
                var transformer = {

                    "seqno": isuRecord.transformers[i].transSeqNo,
                    "dteo": DTEOwnedTrans,
                    "cuso": CustOwnedTrans,
                    "man": isuRecord.transformers[i].manufacturer,
                    "imp": isuRecord.transformers[i].imped,
                    "pri_vol": isuRecord.transformers[i].primVolt,
                    "sec_vol": isuRecord.transformers[i].secVolt,
                    "taps": isuRecord.transformers[i].taps,
                    "kva": isuRecord.transformers[i].kva,
                    "type": isuRecord.transformers[i].type,
                    "serial": isuRecord.transformers[i].serial,
                    "start_date": isuRecord.transformers[i].transStartDate,
                    "end_date": isuRecord.transformers[i].transEndDate,
                    "comments": isuRecord.comment
                }
                transformers.push(transformer);
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
                "air": oAir, 
                "oil": oOil,
                "vac": oVac,
                "sf6": oSF6, 
                "circ_break": isuRecord.circuitBreakerMake,
                "serial_no": isuRecord.serialNo,
                "cb_detto": oDTEoOwnedCB,
                "cb_custo": oCustomerOwnedCB,
                "kamom": isuRecord.kAMomentaryCB,
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
                "Date_megg": oDateMeggered,
                "Type_serv": isuRecord.typeofService,
                "type_TO": isuRecord.typeofTO,
                "psr": isuRecord.primaryServiceRep,
                "psw": isuRecord.pswDiagramNumber,
                //"comments": isuRecord.comments, 
                "created_det": oCreatedAt, 
                "created_by": isuRecord.createdBy,
                "modified_det": oModifiedAt,
                "modified_by": isuRecord.modifiedBy,

                //Extra Attributes
                //"Meas_volt": isuRecord.voltage,	//need clearification  
                //"AMA_verif": "",
                "app_by": isuRecord.modifiedBy,
                "app_date": oModifiedAt   //isuRecord.modifiedAt
                //"trasdat": "",	//Start Date , Need info
                //"traedat": "",	//End Date , Need info
                //"ID": isuRecord[0].ID,	//Field not available in ISU
                //"approverComment": isuRecord[0].approverComment,//Field not available in ISU
                //"record_status": isuRecord[0].record_status	//Field not available in ISU
                //"workflow_id": isuRecord[0].workflow_id 	//Field not available in ISU
                , "psrtofusenav": fuses,
                "psrtotransnav": transformers


            };


            const isu = await cds.connect.to('ISU');
            const path = "/sap/opu/odata/sap/ZPSO_CHLD_CO_CRE_UPD_SRV/Primary_service_recordSet";
            if (queryResponse.length === 1) {
                oSpecialsISUPayload.upd_flag = ""; //create specials in ISU
            }
            else {
                oSpecialsISUPayload.upd_flag = "X";//update specials in ISU
            }
            console.log(oSpecialsISUPayload);
            console.log("i am in ISU POST");
            try {
                const res = await isu.send({
                    method: 'POST',
                    path: path,
                    data: oSpecialsISUPayload
                });
            } catch (e) {
                console.error("Run into ISU POST error.....");
                console.error("Error " + e.reason.status + " : " + e.reason.code + " : " + e.reason.message);
                //   console.error(e);
                return "error";
            }

            console.log("ISU POST Success");
            //  console.log(result);
            return "success";
        };
        return super.init();
    }
}

