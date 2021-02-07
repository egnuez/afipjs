'use strict';

const { TRA } = require('./tickets/tra');
const { TA } = require('./tickets/ta');
const { Certificate } = require('@fidm/x509');
const url_wdsl_devel = 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms?WSDL'
const url_wdsl_prod = 'https://wsaa.afip.gov.ar/ws/services/LoginCms?WSDL'

const _default = {
  config : {
    prod: false,
    service: "wsfe",
    debug: false,
  }
};

class Wsaa {
  constructor(config){
    this.config = {
      ..._default.config, 
      ...config,
    };
    this.config.url_wdsl = 
      (this.config.prod)?url_wdsl_prod:url_wdsl_devel;
  }

  setCertificate(txtCertificate){
    this.txtCertificate = txtCertificate
    let cert = Certificate.fromPEM(txtCertificate)
    this.certificate = {
      validFrom: cert.validFrom,
      validTo: cert.validTo,
      version: cert.version,
      serialNumber: cert.serialNumber,
      issuer: { 
        CN: cert.issuer.commonName,
        C: cert.issuer.countryName,
        O: cert.issuer.organizationName, 
      },
      subject: { 
        CN: cert.subject.commonName,
        SN: cert.subject.serialName,
      }
    }
  }

  setKey(txtKey){
    this.txtKey = txtKey
  }

  createTRA(){
    return new TRA(this.config, this.txtCertificate, this.txtKey)
  }

  createTAFromString(strTA){
    return new TA(strTA)
  }

}

module.exports= {
  Wsaa
};