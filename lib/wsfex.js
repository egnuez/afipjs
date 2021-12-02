'use strict';

const soap = require('soap');
const bwipjs = require('bwip-js');
const fs = require('fs');
const { TA } = require('./tickets/ta');
const FE_DUMMY = "FEXDummy";

const _default = {
    config : {
        prod:false,
        url_wdsl_devel:"https://wswhomo.afip.gov.ar/wsfexv1/service.asmx?WSDL",
        url_wdsl_prod:"https://servicios1.afip.gov.ar/wsfexv1/service.asmx?WSDL",
        service:"wsfex",
        debug: true,
        url_wdsl:this.url_wdsl_devel,
        cuit:"",
    }
};

class Wsfex {

    constructor (TA, config){

        this.config = {
            ..._default.config, 
            ...config,
        };

        this.config.url_wdsl = 
            (this.config.prod)?
                this.config.url_wdsl_prod :
                this.config.url_wdsl_devel;

        this.setTA(TA);

    }

    /**
     * Llama al webservice de AFIP especificado en el primer parametro con los datos
     * especifiados en el el segundo argumento.
     * @param {String} service 
     * @param {Object} args 
     * @returns {Promise} Devuelve una promesa con la respuesta
     */

    _callWsfex (service, args){

        let debug = this.config.debug;
        let wdsl = this.config.url_wdsl;

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
        return this._callWsfex(FE_DUMMY, args);   
    };

}

[
    'FEXGetPARAM_Idiomas',
    'FEXGetPARAM_Cbte_Tipo',
    'FEXGetPARAM_DST_CUIT',
    'FEXGetPARAM_DST_pais',
    'FEXGetPARAM_PtoVenta',
    'FEXGetPARAM_MON',
    'FEXGetPARAM_MON_CON_COTIZACION',
    'FEXGetPARAM_Ctz',
    'FEXGetPARAM_Tipo_Expo',
    'FEXGetLast_ID',
    'FEXGetCMP',
    'FEXGetPARAM_UMed',
    'FEXAuthorize'
].forEach((service) => {
    Wsfex.prototype[service] = function (args) {
        return this._callWsfex(service, {
            ...this.hAuth,
            ...args,
        });
    }
});


[
    'FEXGetLast_CMP',
].forEach((service) => {
    Wsfex.prototype[service] = function (args) {
        const Auth = { ... this.hAuth.Auth, ...args}
        return this._callWsfex(service, {
            Auth
        });
    }
});


module.exports= {
    Wsfex
};