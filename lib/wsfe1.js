'use strict';

const soap = require('soap');
const { TA } = require('./tickets/ta');
const FE_DUMMY = "FEDummy";

const _default = {
    config : {
        prod:false,
        wsfe1_wdsl_devel:"https://wswhomo.afip.gov.ar/wsfev1/service.asmx?WSDL",
        wsfe1_wdsl_prod:"https://wswhomo.afip.gov.ar/wsfev1/service.asmx?WSDL",
        service:"wsfe",
        debug:false,
        wsfe1_wdsl:this.wsfe1_wdsl_devel,
        cuit:"",
    }
};

class Wsfe1 {

    constructor (TA, config){

        this.config = {
            ..._default.config, 
            ...config,
        };

        this.config.wsfe1_wdsl = 
            (this.config.prod)?
                this.config.wsfe1_wdsl_prod :
                this.config.wsfe1_wdsl_devel;

        this.setTA(TA);

    }

    /**
     * Llama al webservice de AFIP especificado en el primer parametro con los datos
     * especifiados en el el segundo argumento.
     * @param {String} service 
     * @param {Object} args 
     * @returns {Promise} Devuelve una promesa con la respuesta
     */

    _callWsfev1 (service, args){

        let debug = this.config.debug;
        let wdsl = this.config.wsfe1_wdsl;

        return new Promise(function(resolve, reject){
            
            soap.createClient(wdsl, { returnFault: true }, function (err, client) {
                if(err) return reject(err);
                client[service](args, function (err, result, rawResponse, soapHeader, rawRequest) {
                    if(debug){
                        console.log('Request: ', rawRequest);
                        console.log('Response:', rawResponse);
                    }
                    if(err) return reject(err);
                    return resolve(result);
                });
            });
        });
    }

    setTA(TA){

        this.TA = TA;

        if (TA != undefined){
            this.hAuth = {
                Auth:{
                    Token:this.TA.TA_parsed.token,
                    Sign:this.TA.TA_parsed.sign,
                    Cuit:this.TA.TA_parsed.cuit
                }
            };
        }
    }

    FEDummy (args){
        return this._callWsfev1(FE_DUMMY, args);   
    };

}

[

    'FEParamGetTiposIva',
    'FECompUltimoAutorizado',
    'FECAESolicitar',

].forEach((service) => {
    Wsfe1.prototype[service] = function (args) {
         return this._callWsfev1(service, {
            ...this.hAuth,
            ...args,
        });
    }
});

module.exports= {
    Wsfe1
};