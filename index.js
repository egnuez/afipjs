'use strict';

/**
  * The entry point.
  *
  * @module Afipjs
  */

module.exports= {
    Wsaa : require('./lib/wsaa').Wsaa,
    Wsfe : require('./lib/wsfe').Wsfe,
    Wsfex : require('./lib/wsfex').Wsfex,
    Wspci: require('./lib/wspci').Wspci,
};