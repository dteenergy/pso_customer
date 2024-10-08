const cds = require('@sap/cds');
const { executeHttpRequest } = require('@sap-cloud-sdk/http-client');
const { transformServiceBindingToDestination, registerDestination } = require('@sap-cloud-sdk/connectivity');
const xsenv = require('@sap/xsenv');
const { PSOSpecials } = cds.entities;
module.exports = class PSOService extends cds.ApplicationService {
    init() {

        async function _fetchRecordFromHANA(connection_object) {
            const record_HANA = await SELECT.from(PSOSpecials).where({ connection_object: connection_object }).orderBy('createdAt desc');
            console.log(record_HANA.length);
            if (record_HANA.length === 0) {
                //no specials exists in HANA, fetch from ISU
                const migratedData = await _fetchRecordFromISU(connection_object);
                if (migratedData !== null && migratedData !== undefined && migratedData !== "") {
                    //Insert Specials record from ISU to HANA
                    const migratedDataModified = await getUpdatedrecord(migratedData);
                    console.log(migratedDataModified);
                    const affectedRows = await _createPSORecord(migratedDataModified);
                    if (affectedRows > 0) {
                        const result = await _fetchRecordFromHANA(connection_object);
                        console.log(result);
                        return result;
                    }
                    else return null;
                }
                else return null; // no data present in ISU/HANA            
            }
            else {
                return record_HANA[0];
            }
        }

        async function _fetchRecordFromISU(connection_object) {
            let path = "/sap/opu/odata/SAP/ZPSO_CHLD_CO_CRE_UPD_SRV/Primary_service_recordSet(conn_obj='" + connection_object + "')";
            console.log("i am in ISU GET: " + path);
            try {
                const isu = await cds.connect.to('ISU');
                const migratedData = await isu.send({
                    method: 'GET',
                    path: path
                });
                console.log(migratedData);
                if (migratedData !== null && migratedData !== undefined && migratedData !== "") {
                    return migratedData;
                }
                else return null;
            }
            catch (e) {
                console.log(e);
            }

        }
        this.on('getSpecialsRecord', async (req) => {
            console.log(req.data.connection_object);
            const result = await _fetchRecordFromHANA(req.data.connection_object);
            return result;
        });

        async function getUpdatedrecord(result) {

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
            const migratedPayload = {
                connection_object: result.conn_obj,
                work_desc: result.work_desc,
                meter_number: result.Meter1,
                record_status: "Approved",

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
                ownedByTransformer: "",    //Radiobutton

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
                streetName: "" //result.streetName
            }
            return migratedPayload;
        }

        this.on('createSpecials', async (req) => {
            console.log("in create specials");
            req.data.context.record_status = "Draft";
            console.log(req.data.context);
            const affectedRows = await _createPSORecord(req.data.context);
            return affectedRows;
        });
        async function _createPSORecord(record) {
            console.log("in _createPSORecord");
            const insertResult = await INSERT.into(PSOSpecials).entries(record);
            console.log("Insert Record Successful: " + record.connection_object);
            return insertResult.results[0].affectedRows;
        }

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
            const approvedBy = req.req.user.id;
            const Cdate = new Date();
            const approvedOn = Cdate.toLocaleDateString('en-US');
            console.log(req.data);
            const updateResult = await UPDATE.entity(PSOSpecials, recordID).set({ record_status: record_status, approvedBy: approvedBy, approvedOn: approvedOn, approverComment: comment });
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
            let comment1 = "wf rejected";
            let wfType = { "comment": comment1 };
            return wfType;

            // const comment = req.data.comment;
            // const recordID = req.data.recordID;
            // let approvedBy = req.data.approvedBy;
            // const record_status = "Rejected";

            // approvedBy = "mickey"; //to make it runtime ...mickey
            // console.log(comment);
            // console.log(recordID);
            // const updateResult = await UPDATE.entity(PSOSpecials, recordID).set({ record_status: record_status, approvedBy: approvedBy, approverComment: comment });

            // console.log("success");
            // console.log(updateResult);
            // let comment1 = "wf comment";
            // let wfType = { "comment": comment1 };
            // return wfType;
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

            }
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
                //"ProcessorPartyID": req.data.context.ProcessorPartyID,
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

        async function _oUpdateSpecials(recordID, req) {
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

            console.log("comp date is: " + comp_date);
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
                "Date_megg": oDateMeggered,
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
            return result;
        };
        return super.init();
    }
}