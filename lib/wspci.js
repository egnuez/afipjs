'use strict';

const soap = require('soap');
const SERVICE_NAME = "ws_sr_constancia_inscripcion"

const _default = {
  config: {
    prod: false,
    url_wdsl_devel: "https://awshomo.afip.gov.ar/sr-padron/webservices/personaServiceA5?WSDL",
    url_wdsl_prod: "https://aws.afip.gov.ar/sr-padron/webservices/personaServiceA5?WSDL",
    service: SERVICE_NAME,
    debug: false,
    url_wdsl: this.url_wdsl_devel,
  }
};

class Wspci {
  static SERVICE_NAME = SERVICE_NAME
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

  _callWspci (service, args){
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
        token:this.TA.TA_parsed.token,
        sign:this.TA.TA_parsed.sign,
      };
    }
  }

  dummy (){
    return this._callWspci("dummy", {});   
  };
}

[
  'getPersona_v2',
].forEach((service) => {
  Wspci.prototype[service] = function (args) {
    return this._callWspci(service, {
      ...this.hAuth,
      ...args,
    });
  }
});

module.exports= {
  Wspci
};