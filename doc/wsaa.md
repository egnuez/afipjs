### WSAA

La clase Wsaa permite manejar Tickets, la clase Wsfe1 permite acceder a los servicio de facturacion.

Opciones de configuracion:

- *debug*: Muestra (o no) datos de ejecucion como los datos enviados y recibidos a/y desde el webservice.
- *prod*: Indica si se va a utilizar el entoro de Produccion o el Homologacion.
- *service*: Indica para que web service se solicitara acceso, por ahora solo wsfe1 esta disponible.


```javascript
const { Wsaa, Wsfe } = require('./afipjs');
var pem = fs.readFileSync('path/to/CertTest.pem', 'utf8')
var key = fs.readFileSync('path/to/keyTest.pem', 'utf8')
const conf =  {
    prod: false,
    debug: true,
}
const wsaa = new Wsaa(conf)
wsaa.setCertificate(pem)
wsaa.setKey(key)
console.log(wsaa.certificate)
```

```javascript
{
  validFrom: 2021-02-06T21:03:28.000Z,
  validTo: 2023-02-06T21:03:28.000Z,
  version: 3,
  serialNumber: '6e28eedea2f859c3',
  issuer: { CN: 'Computadores Test', C: 'AR', O: 'AFIP' },
  subject: { CN: 'IbrickInvoice', SN: 'CUIT 20278650988' }
}
```

### Crear un TRA

Un TRA es un Solicitud o Requerimiento de Ticket de Acceso (TA), necesario para luego poder llamar a los demas servicios, como los de Facturacion Electronica por ejemplo.
Una TRA no es mas que un XML que se encripta con tu certificado.
Para generar un TRA se usa el metodo *createTRA*

```javascript
const tra = wsaa.createTRA()
console.log(tra)
```

```javascript
TRA {
  config: {
    prod: false,
    service: 'wsfe',
    debug: true,
    url_wdsl: 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms?WSDL'
  },
  TRA: '<?xml version="1.0" encoding="UTF-8"?><loginTicketRequest version="1.0"><header><uniqueId>1612733511</uniqueId><generationTime>2021-02-07T18:30:51-03:00</generationTime><expirationTime>2021-02-07T18:32:51-03:00</expirationTime></header><service>wsfe</service></loginTicketRequest>',
  TRA_parsed: {
    loginTicketRequest: { '$': [Object], header: [Array], service: [Array] }
  },
  cms: 'MIIGFgYJKoZIhvcNAQcCoIIGBzCCBgMCAQExCzAJBgUrDgM......'
}
```

```javascript
try {
  const newTa = await tra.supplicateTA()
  console.log(newTa)
} catch(err) {
  console.log(err.root)
}
```

```javascript
TA {
  TA: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
    '<loginTicketResponse version="1.0">\n' +
    '    <header>\n' +
    '        <source>CN=wsaahomo, O=AFIP, C=AR, SERIALNUMBER=CUIT 33693450239</source>\n' +
    '        <destination>SERIALNUMBER=CUIT 20278650988, CN=ibrickinvoice</destination>\n' +
    '        <uniqueId>3326504285</uniqueId>\n' +
    '        <generationTime>2021-02-07T18:31:52.043-03:00</generationTime>\n' +
    '        <expirationTime>2021-02-08T06:31:52.043-03:00</expirationTime>\n' +
    '    </header>\n' +
    '    <credentials>\n' +
    '        <token>PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0i...</token>\n' +
    '        <sign>PnZJ3icY7WAWWiVWzbA7PQ...</sign>\n' +
    '    </credentials>\n' +
    '</loginTicketResponse>',
  TA_parsed: {
    generationTime: '2021-02-07T18:31:52.043-03:00',
    expirationTime: '2021-02-08T06:31:52.043-03:00',
    token: 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZG....',
    sign: 'PnZJ3icY7WAWWiVWzbA7PQV7UNbcsYzlcPCDlf...',
    cuit: '20278650988'
  }
}
```

# Tomar un TA desde un string y verificar su validez

```javascript
const prev_ta =  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
  '<loginTicketResponse version="1.0">\n' +
  '    <header>\n' +
  '        <source>CN=wsaahomo, O=AFIP, C=AR, SERIALNUMBER=CUIT 33693450239</source>\n' +
  '        <destination>SERIALNUMBER=CUIT 20278650988, CN=ibrickinvoice</destination>\n' +
  '        <uniqueId>940678721</uniqueId>\n' +
  '        <generationTime>2021-02-07T16:38:37.317-03:00</generationTime>\n' +
  '        <expirationTime>2021-02-08T04:38:37.317-03:00</expirationTime>\n' +
  '    </header>\n' +
  '    <credentials>\n' +
  '        <token>PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNv....</token>\n' +
  '        <sign>tBgdeCigauhYL2i7L5C4FAKTP6SxxhrEo7KQKsAyAIC...</sign>\n' +
  '    </credentials>\n' +
  '</loginTicketResponse>'

  const ta = wsaa.createTAFromString(prev_ta)
  console.log(ta)
  console.log(ta.isValid())
```

```javascript
TA {
  TA: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
    '<loginTicketResponse version="1.0">\n' +
    '    <header>\n' +
    '        <source>CN=wsaahomo, O=AFIP, C=AR, SERIALNUMBER=CUIT 33693450239</source>\n' +
    '        <destination>SERIALNUMBER=CUIT 20278650988, CN=ibrickinvoice</destination>\n' +
    '        <uniqueId>940678721</uniqueId>\n' +
    '        <generationTime>2021-02-07T16:38:37.317-03:00</generationTime>\n' +
    '        <expirationTime>2021-02-08T04:38:37.317-03:00</expirationTime>\n' +
    '    </header>\n' +
    '    <credentials>\n' +
    '        <token>PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGlu...</token>\n' +
    '        <sign>tBgdeCigauhYL2i7L5C4FAKTP6Sxx...</sign>\n' +
    '    </credentials>\n' +
    '</loginTicketResponse>',
  TA_parsed: {
    generationTime: '2021-02-07T16:38:37.317-03:00',
    expirationTime: '2021-02-08T04:38:37.317-03:00',
    token: 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNv...',
    sign: 'tBgdeCigauhYL2i7L5C4FAKTP6Sxxh..',
    cuit: '20278650988'
  }
}
true
```

Ahora que ya hay un ticket valido creado, se puede empezar a utilizar los servicio de Factura Electronica, provisto por el Webservice Wsfe1, para es necesario crear un objeto Wsfe1 y luego llamar al servicio que necesitemos:

- Factura electronica [WSFEV1](wsfev1.md)
