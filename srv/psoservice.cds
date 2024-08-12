service PSOService {


    type userScope{
         scope: String;
    }
    function userDetails() returns array of String;  

    function launchOpenTextURL() returns String;

    function triggerWorkflowPSOSpecials() returns String;
    

}