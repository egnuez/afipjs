### WSPCI

La clase Wspci permite consultar datos de un contribuyente dado un numero de CUIT

1.  Obtener un token para el webservice correspondiente

```javascript
const { Wsaa, Wspci } = require('./afipjs')
var pem = fs.readFileSync('path/to/CertTest.pem', 'utf8')
var key = fs.readFileSync('path/to/keyTest.pem', 'utf8')
const conf =  {
  prod: false,
  debug: true,
  service: Wspci.SERVICE_NAME,
}
const wsaa = new Wsaa(conf)
wsaa.setCertificate(pem)
wsaa.setKey(key)
```

2. Crear un TRA

```javascript
const tra = wsaa.createTRA()
```

3. Pedir un TA

```javascript
const newTa = await tra.supplicateTA()
```

3. Crear el cliente y verificar si funciona el Web Service

```javascript
const wspci = new Wspci(TA);
const response = await wspci.dummy();
console.log(response)
```

4. Consultar un CUIT

```javascript
response = await wspci.getPersona_v2({
  cuitRepresentada: '20278650988',
  idPersona: '23246180709'
});
console.dir(response, { depth: null });
```

```javascript
{
  personaReturn: {
    datosGenerales: {
      apellido: 'MEASURE',
      domicilioFiscal: {
        codPostal: '1644',
        descripcionProvincia: 'BUENOS AIRES',
        direccion: 'CARLOS PELLEGRINI 3966',
        idProvincia: 1,
        localidad: 'VICTORIA',
        tipoDomicilio: 'FISCAL'
      },
      estadoClave: 'ACTIVO',
      idPersona: '23246180709',
      mesCierre: 12,
      nombre: 'ROMARICO',
      tipoClave: 'CUIT',
      tipoPersona: 'FISICA'
    },
    datosMonotributo: {
      actividad: [
        {
          descripcionActividad: 'PRODUCCIÓN DE LANA Y PELO DE OVEJA Y CABRA (CRUDA)',
          idActividad: '14710',
          nomenclador: 883,
          orden: 2,
          periodo: 201403
        },
        {
          descripcionActividad: 'SERVICIOS DE CONSULTORES EN EQUIPO DE INFORMÁTICA',
          idActividad: '620200',
          nomenclador: 883,
          orden: 1,
          periodo: 201311
        },
        {
          descripcionActividad: 'SERVICIOS PERSONALES N.C.P.',
          idActividad: '960990',
          nomenclador: 883,
          orden: 3,
          periodo: 201603
        }
      ],
      actividadMonotributista: {
        descripcionActividad: 'SERVICIOS DE CONSULTORES EN EQUIPO DE INFORMÁTICA',
        idActividad: '620200',
        nomenclador: 883,
        orden: 1,
        periodo: 201311
      },
      categoriaMonotributo: {
        descripcionCategoria: 'B LOCACIONES DE SERVICIO',
        idCategoria: 36,
        idImpuesto: 20,
        periodo: 202102
      },
      impuesto: [
        {
          descripcionImpuesto: 'MONOTRIBUTO',
          idImpuesto: 20,
          periodo: 200903
        }
      ]
    },
    metadata: { fechaHora: 2021-07-22T16:57:54.798Z, servidor: 'setiwsh2' }
  }
}
```