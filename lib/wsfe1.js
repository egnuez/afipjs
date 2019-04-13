'use strict';

const soap = require('soap');
const bwipjs = require('bwip-js');
const fs = require('fs');
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

    /**
     * Genera los archivos PNG con los codigos de barra y devuelve los
     * codigos de barra en una lista.
     * La entrada a este servicio es la salida de FECAESolititar,
     * recordar que devuelve una lista de facturas autorizadas.
     * @param {*} invoices 
     */

    BarCodes(invoices){

        const cuit = invoices.FECAESolicitarResult.FeCabResp.Cuit;
        const point = (""+invoices.FECAESolicitarResult.FeCabResp.PtoVta).padStart(4,0);
        const type = invoices.FECAESolicitarResult.FeCabResp.CbteTipo;
        const BarcodePrefix = `${cuit}${point}${type}`;
        var barCodes = [];

        invoices.FECAESolicitarResult.FeDetResp.FeDetResp.forEach(invoice => {
            
            const cae = invoice.CAE;
            const caeVto = invoice.CAEFchVto;

            const barcode = `${BarcodePrefix}${cae}${caeVto}`;
            const file = `${cae}.png`;
            barCodes.push(file);

            bwipjs.toBuffer({
                bcid:        'interleaved2of5',
                text:        `${barcode}`,
                scale:       1,
                height:      12,
                includetext: true,
                includecheck: true,
                includecheckintext: true,
                textxalign:  'justify',
                backgroundcolor: "FFFFFF",
            }, function (err, png) {
                if (err) {
                    console.log(err);
                } else {
                    fs.writeFileSync(file, png);
                }
            });

        });

        return barCodes;
    }

    DocType2Code(type) {
        return {
            C:"11"
        }
    };

}

[

    'FEParamGetTiposIva',
    'FECompUltimoAutorizado',
    'FECAESolicitar',
    'FECompConsultar',
    'FEParamGetTiposCbte',
    'FEParamGetTiposConcepto',
    'FEParamGetTiposDoc',
    'FEParamGetTiposMonedas',
    'FEParamGetTiposOpcional',
    'FEParamGetTiposTributos',
    'FEParamGetPtosVenta',
    'FEParamGetCotizacion'

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