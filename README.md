# afipjs

Libreria para uso de los Webservices de AFIP con Node.js

### WSAA Y WSFE1

La clase Wsaa permite manejar Tickets, la clase Wsfe1 permite acceder a los servicio de facturacion.

```javascript
const { Wsaa, Wsfe1 } = require('./afipjs');
var wsaa = new Wsaa();
console.log(wsaa);
```

```javascript
Wsaa {
  config:
   { crt: 'crt_homo.crt',
     key: 'key_homo.key',
     prod: false,
     wsaa_wdsl_devel: 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms?WSDL',
     wsaa_wdsl_prod: 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms?WSDL',
     tmpTAFile: 'TA.xml',
     service: 'wsfe',
     debug: false,
     wsaa_wdsl: 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms?WSDL',
     mock: false },
  certifcate:
   { validFrom: 2018-08-01T23:11:35.000Z,
     validTo: 2020-07-31T23:11:35.000Z,
     version: 3,
     serialNumber: '6d52ef949e466a87',
     issuer: { CN: 'Computadores Test', C: 'AR', O: 'AFIP' },
     subject: { CN: 'invoicedev', SN: 'CUIT 20278650988' } } }
```
Cuaquier de la opciones de configuracion se pueden cambiar en el constructor de la clase, por ejemplo, si quiero habilitar el debug:


```javascript
var wsaa = new Wsaa();
//var wsaa = new Wsaa({debug:true}); // Habilita el debug
```

Las mas importantes son:

- *debug*: Muestra (o no) datos de ejecucion como los datos enviados y recibidos a/y desde el webservice.
- *crt*: Ruta al certificado firmado por la AFIP. [Como obtener certificados](https://www.afip.gob.ar/ws/WSAA/WSAA.ObtenerCertificado.pdf)
- *key*: La ruta a la clave privada.
- *prod*: Indica si se va a utilizar el entoro de Produccion o el Homologacion.
- *service*: Indica para que web service se solicitara acceso, por ahora solo wsfe1 esta disponible.
- *tmpTAFile*: Ruta al archivo que contendra' el tiket generado en caso de guardarlo con el metodo *save* o leerlo con *createTAFromFile*

El campo *certifcate* solo muestra informacion del certificado en *crt*

### Crear un TRA

Un TRA es un Solicitud o Requerimiento de Ticket de Acceso (TA), necesario para luego poder llamar a los demas servicios, como los de Facturacion Electronica por ejemplo.
Una TRA no es mas que un XML que se encripta con tu certificado.
Para generar un TRA se usa el metodo *createTRA*

```javascript
let miTRA = wsaa.createTRA();
console.dir(miTRA,  { depth: null })
```

```javascript
TRA {
  config:
   { crt: 'crt_homo.crt',
     key: 'key_homo.key',
     prod: false,
     wsaa_wdsl_devel: 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms?WSDL',
     wsaa_wdsl_prod: 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms?WSDL',
     tmpTAFile: 'TA.xml',
     service: 'wsfe',
     debug: false,
     wsaa_wdsl: 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms?WSDL',
     mock: false },
  TRA:
   '<?xml version="1.0" encoding="UTF-8"?><loginTicketRequest version="1.0"><header><uniqueId>1554575143</uniqueId><generationTime>2019-04-06T18:24:43+00:00</generationTime><expirationTime>2019-04-06T18:26:43+00:00</expirationTime></header><service>wsfe</service></loginTicketRequest>',
  TRA_parsed:
   { loginTicketRequest:
      { '$': { version: '1.0' },
        header:
         [ { uniqueId: [ '1554575143' ],
             generationTime: [ '2019-04-06T18:24:43+00:00' ],
             expirationTime: [ '2019-04-06T18:26:43+00:00' ] } ],
        service: [ 'wsfe' ] } },
  cms:
   'MIIGEwYJKoZIhvcNAQcCoIIGBDCCBgACAQExCz...' }
```

Alli arriba se puede ver el TRA en texto crudo sin encriptar (xml) y el TRA encriptado, el cual se llama CMS (Cryptographic Message Syntax).

Ahora deberiamos obtener un Ticket de Acceso (TA) valido, para eso se utiliza el metodo *supplyTA* de la clase TRA.

```javascript
const miTA = await miTRA.supplyTA();
console.log(miTA);
```
```javascript
TA {
  config:
   { crt: 'crt_homo.crt',
     key: 'key_homo.key',
     prod: false,
     wsaa_wdsl_devel: 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms?WSDL',
     wsaa_wdsl_prod: 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms?WSDL',
     tmpTAFile: 'TA.xml',
     service: 'wsfe',
     debug: false,
     wsaa_wdsl: 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms?WSDL' },
  TA:
   '\n<loginTicketResponse version="1.0">\n    <header>\n        <source>CN=wsaahomo, O=AFIP, C=AR, SERIALNUMBER=CUIT 33693450239</source>\n        <destination>SERIALNUMBER=CUIT 20xxxxxxxx8, CN=invoicedev</destination>\n        <uniqueId>190169448</uniqueId>\n        <generationTime>2019-04-04T13:42:31.804-03:00</generationTime>\n
     <expirationTime>2019-04-05T01:42:31.804-03:00</expirationTime>\n    </header>\n    <credentials>\n        <token>PD94bWwgdmVyc2....</token>\n        <sign>....</sign>\n    </credentials>\n</loginTicketResponse>\n',
  TA_parsed:
   { generationTime: '2019-04-04T13:42:31.804-03:00',
     expirationTime: '2019-04-05T01:42:31.804-03:00',
     token:
      'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0i....',
     sign:
      'IhDUsUWjZ+8jCqi...',
     cuit: '20xxxxxxxx8' } }
```

Arriba se ve el TA crudo en XML, y parseado para acceder mas facilmete a los datos del ticket.

Tambien se puede ver si el ticket es valido (no esta expirado)

```javascript
console.log(miTA.isValid());
```

```javascript
true
```

Para guardar el TA:

```javascript
miTA.save();
```

```
λ ls
afip.js  afipjs/  crt_homo.crt  key_homo.key  package-lock.json  TA.xml
```

Como se ve arriba, se genera el archivo TA.xml (indicado en *tmpTAFile*), en este caso, en el directorio actual.

Ahora, para crear un TA desde un archivo se utiliza el metodo *createTAFromFile* de la siguiente manera:

```javascript
const miTA2 = wsaa.createTAFromFile();
console.log(miTA2);
```

```javascript
{ generationTime: '2019-04-04T13:42:31.804-03:00',
  expirationTime: '2019-04-05T01:42:31.804-03:00',
  token:
   'PD94bWwgdmVyc2lvbj0i....',
  sign:
   'IhDUsUWjZ+8jCqiM.....',
  cuit: '20xxxxxxxx8' }
```
```javascript
console.log(miTA2.isValid());
```

```javascript
true
```

Ahora que ya hay un ticket valido creado, se puede empezar a utilizar los servicio de Factura Electronica, provisto por el Webservice Wsfe1, para es necesario crear un objeto Wsfe1 y luego llamar al servicio que necesitemos:

```javascript
const wsfe = new Wsfe1(TA);
const response = await wsfe.FEDummy({});
console.log(response);
```

```javascript
{ FEDummyResult: { AppServer: 'OK', DbServer: 'OK', AuthServer: 'OK' } }
```

Arriba se ve la respuesta del Webservice.

## Servicios

Los parametros de cada servicio se pueden encontrar en la [documentacion oficial] de la AFIP(http://www.afip.gob.ar/ws/documentacion/ws-factura-electronica.asp)

### FEParamGetTiposIva (Obtiene los tipo de IVA)

```javascript
response = await wsfe.FEParamGetTiposIva({});
console.dir(response, { depth: null });
```

```javascript
{ FEParamGetTiposIvaResult:
   { ResultGet:
      { IvaTipo:
         [ { Id: '3', Desc: '0%', FchDesde: '20090220', FchHasta: 'NULL' },
           { Id: '4', Desc: '10.5%', FchDesde: '20090220', FchHasta: 'NULL' },
           { Id: '5', Desc: '21%', FchDesde: '20090220', FchHasta: 'NULL' },
           { Id: '6', Desc: '27%', FchDesde: '20090220', FchHasta: 'NULL' },
           { Id: '8', Desc: '5%', FchDesde: '20141020', FchHasta: 'NULL' },
           { Id: '9', Desc: '2.5%', FchDesde: '20141020', FchHasta: 'NULL' } ] } } }
```

### FECompUltimoAutorizado (Obtiene el numero del ultimo comprobate autrizado)

```javascript
response = await wsfe.FECompUltimoAutorizado({
    PtoVta:1,
    CbteTipo:11
});
console.dir(response, { depth: null });
```

```javascript
{ FECompUltimoAutozizadoResult: { PtoVta: 1, CbteTipo: 11, CbteNro: 48 } }
```

### FECAESolicitar (Autoriza un comprobante)

```javascript
    const puntoDeVenta = 1;
    const ultimoAutorizado = 48 // desde FECompUltimoAutorizado

    const factura = {
        FeCAEReq:{
            FeCabReq:{
                CantReg:1,
                PtoVta:puntoDeVenta,
                CbteTipo:11
            },
            FeDetReq:{
                FECAEDetRequest:{
                    Concepto:1,
                    DocTipo:80,
                    DocNro:"23000000000",
                    CbteDesde:ultimoAutorizado + 1,
                    CbteHasta:ultimoAutorizado + 1,
                    CbteFch:'20190407',
                    ImpTotal:1.00,
                    ImpTotConc:0.00,
                    ImpNeto:1.00,
                    ImpOpEx:0.00,
                    ImpTrib:0.00,
                    ImpIVA:0.00,
                    MonId:"PES",
                    MonCotiz:1
                }
            }
        }
    };

    response = await wsfe.FECAESolicitar(factura);
    console.dir(response, { depth: null });
```

```javascript
{ FECAESolicitarResult:
   { FeCabResp:
      { Cuit: '20278650988',
        PtoVta: 1,
        CbteTipo: 11,
        FchProceso: '20190407162734',
        CantReg: 1,
        Resultado: 'A',
        Reproceso: 'N' },
     FeDetResp:
      { FECAEDetResponse:
         [ { Concepto: 1,
             DocTipo: 80,
             DocNro: '23000000000',
             CbteDesde: '49',
             CbteHasta: '49',
             CbteFch: '20190407',
             Resultado: 'A',
             CAE: '69148738398949',
             CAEFchVto: '20190417' } ] } } }
```

### FECompConsultar (Consulta un comprobante autorizado)

```javascript
response = await wsfe.FECompConsultar({
        FeCompConsReq:{
            PtoVta:1,
            CbteTipo:11,
            CbteNro:49,
        }
    });
    console.log(response);
```

```javascript
{ FECompConsultarResult:
   { ResultGet:
      { Concepto: 1,
        DocTipo: 80,
        DocNro: '23000000000',
        CbteDesde: '49',
        CbteHasta: '49',
        CbteFch: '20190407',
        ImpTotal: '1',
        ImpTotConc: '0',
        ImpNeto: '1',
        ImpOpEx: '0',
        ImpTrib: '0',
        ImpIVA: '0',
        FchServDesde: '',
        FchServHasta: '',
        FchVtoPago: '',
        MonId: 'PES',
        MonCotiz: '1',
        Resultado: 'A',
        CodAutorizacion: '69148738398949',
        EmisionTipo: 'CAE',
        FchVto: '20190417',
        FchProceso: '20190407162734',
        PtoVta: 1,
        CbteTipo: 11 } } }
```