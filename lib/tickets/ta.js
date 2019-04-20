'use strict';

const xml2js = require('xml2js');
const fs = require('fs');

class TA {

    constructor(loginCmsReturn, config){
        this.config = config;
        this.TA = loginCmsReturn;
        this.TA_parsed = this._parse();
    }

    _parse(){

        let TA_parsed = "";
        xml2js.Parser().parseString(this.TA, function (err, result) {
            if (err) TA_parsed = reject(err);
            else {
                const header = result.loginTicketResponse.header[0];
                const credentials = result.loginTicketResponse.credentials[0];
                const cuit = header.destination[0].match(/CUIT (\d{11})/i)[1];
                TA_parsed = {
                    generationTime:header.generationTime[0],
                    expirationTime:header.expirationTime[0],
                    token:credentials.token[0],
                    sign:credentials.sign[0],
                    cuit:cuit
                };
            }
        });

        return TA_parsed;

    }

    save(){
        const filename = `${this.config.tmpTAFileDir}/TA-${this.config.service}.xml`;
        fs.writeFileSync(filename, this.TA);
    }

    getService(){
        return this.config.service;
    }

    isValid(){
        if(this.TA_parsed.expirationTime){
            let expiration = new Date(this.TA_parsed.expirationTime);
            expiration = Math.floor(expiration.getTime() / 1000);
            let now = Math.floor((new Date()).getTime() / 1000);
            return (expiration > now);
        }
        return false;
    }

};

module.exports= {
    TA
};