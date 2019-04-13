# AFIPJS

Libreria para uso de los Webservices de AFIP con Node.js

## Instalacion

```bash
npm install afipjs
```
## Ejemplo rapido de uso

```javascript
const { Wsaa, Wsfe1 } = require('./afipjs');
var wsaa = new Wsaa();
let miTRA = wsaa.createTRA();
const miTA = await miTRA.supplyTA();
const wsfe = new Wsfe1(miTA);
const puntoDeVenta = 1;
const ultimoAutorizado = 48
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

### Documentos:

- Autenticacion [WSAA](doc/wsaa.md)
- Factura electronica [WSFEV1](doc/wsfev1.md)