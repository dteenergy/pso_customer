const cds = require('@sap/cds');
const { executeHttpRequest } = require('@sap-cloud-sdk/http-client');
const { transformServiceBindingToDestination, registerDestination } = require('@sap-cloud-sdk/connectivity');
const xsenv = require('@sap/xsenv');

module.exports = class PSOService extends cds.ApplicationService {
    init() {

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

        this.on('userDetails', async (req) => {
            let a = [];
            console.log("start");
            console.log(JSON.stringify(req.req.user.roles));// {"openid":1,"pso_search_customer":1} -> keys
            //const keys = Object.keys(person);
            console.log(JSON.stringify(req.req.user.tokenInfo.getPayload().scope[1]));//psocustomerecord-primaryserviceorg-PrimaryServiceTeam-Dev!t1203.pso_search_customer
            let scopes = req.req.user.tokenInfo.getPayload().scope;
            for (let i = 0; i < scopes.length; i++) {
                a.push(scopes[i]);
                //    a.push({ scope: scopes[i] });
            }

            //add to global model
            console.log(a);
            //  let b = req.req.user.roles;
            //  a.push({scope:"success"});
            console.log("end");
            return a;

        });


        
        this.on('triggerWorkflowPSOSpecials', async (req) => {
            let wfPayload = {
                "definitionId": "us20.fiori-dev-dte.testproject.testProcess",
                "context": {
                    "customerName": "Rohit",
                    "address": "CHD",
                    "city": "Chandigarh",
                    "pSNumber": "ALFKI",
                    "workDescription": "",
                    "meterNumber": "",
                    "kWHRRdg": "",
                    "kVARHRdg": "",
                    "fedFrom": "",
                    "cableDesciption": "",
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
                    "size_1": "",
                    "_type": "",
                    "curve": "",
                    "voltage": "",
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
                    "circuitBreakerMake": "",
                    "serialNumber": "",
                    "kAMomentary_1": "",
                    "amps": "",
                    "_type_3": "",
                    "faultDuty": ""
                }
            };
            const bp = await cds.connect.to('connectbpa');
            const path = "/workflow/rest/v1/workflow-instances";
            console.log("i am here");
            //   console.log("payload from services: " + wfPayload.context.inputpayload);
            const res = await bp.send({
                method: 'POST',
                path: path,
                data: wfPayload
            });
            console.log("WF triggered for : " + res);
            return res;

        });



        return super.init();

    }
}