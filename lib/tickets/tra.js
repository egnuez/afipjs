'use strict';

const forge = require('node-forge');
const xml2js = require('xml2js');
const soap = require('soap');
const { TA } = require('./ta');
require('../utils');

const TRA_tpl = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
  "<loginTicketRequest version=\"1.0\">" +
  "<header>" +
  "<uniqueId>_unique_id_</uniqueId>" +
  "<generationTime>_generation_time_</generationTime>" +
  "<expirationTime>_expiration_time_</expirationTime>" +
  "</header>" +
  "<service>_service_</service>" +
  "</loginTicketRequest>";

class TRA {

  constructor(config, pem, key){

    this.config = config;

    const now = new Date();

    this.TRA = TRA_tpl.allReplace({
      _unique_id_: Math.floor(now.valueOf() / 1000),
      _generation_time_: now.subTime(0,1).toIsoString(),
      _expiration_time_: now.addTime(0,2).toIsoString(),
      _service_:this.config.service,
    });

    this.TRA_parsed = this._parse();
    this.cms = this._createCms(pem, key);

  }

  _parse(){
    let TRA_parsed = "";
    xml2js.Parser().parseString(this.TRA, function (err, result) {
        TRA_parsed = err?err:result;
    });
    
    return TRA_parsed;
  }

  _createCms(pem, key){
    var p7 = forge.pkcs7.createSignedData();
    p7.content = forge.util.createBuffer(this.TRA, 'utf8');
    p7.addCertificate(pem);
    p7.addSigner({
        key: key,
        certificate: pem,
    });
    p7.sign();
    let cms = forge.pkcs7.messageToPem(p7).allReplace({
        "-----BEGIN PKCS7-----":"",
        "-----END PKCS7-----":""
    }).allReplace({"\r\n":""});
    return cms
  }

  supplicateTA(){

    var url = this.config.url_wdsl;
    var args = {in0: this.cms};

    var soapOptions = {
        returnFault: true,
    };

    let debug = this.config.debug;

    return new Promise(function (resolve, reject){
      soap.createClient(url, soapOptions, function (err, client) {
        if( err ) return reject( err );
        client.loginCms(args, function (err, result,  rawResponse, soapHeader, rawRequest) {
          if (debug){
            console.log('Header: ', soapHeader);
            console.log('Request: ', rawRequest);
            console.log('Response:', rawResponse);
          }
          if( err ) return reject( err );
          return resolve( new TA(result.loginCmsReturn) );
        });
      });
    });

  }

  createTAFromString(s){
    return new TA(s)
  }

};

module.exports= {
    TRA
};