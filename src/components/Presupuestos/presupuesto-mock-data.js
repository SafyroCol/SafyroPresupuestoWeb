export const presupuestoPorRubros = {
  "Resumen Global": [
    { ETAPA: "Subtotal Materiales", VALOR: 35000000 },
    { ETAPA: "Subtotal Mano de Obra", VALOR: 16000000 },
    { ETAPA: "Subtotal Equipos", VALOR: 3500000 },
    { ETAPA: "Subtotal Servicios de Terceros", VALOR: 2600000 },
    { ETAPA: "Subtotal Costos Indirectos", VALOR: 1800000 },
    { ETAPA: "Indirectos", VALOR: 1300000 },
    { ETAPA: "Utilidad", VALOR: 2200000 },
    { ETAPA: "IVA", VALOR: 7600000 },
    { ETAPA: "Total", VALOR: 72000000 }
  ],
  "Estructura": [
    {
      "ITEM": 1,
      "CODIGO": "2.01",
      "DESCRIPCION": "Puerta de ducha en vidrio",
      "UNIDAD": "día",
      "CANTIDAD": 23.15,
      "VALOR_UNITARIO": 882200,
      "VALOR_TOTAL": 20422930,
      "OBSERVACIONES": "Incluye mano de obra y materiales"
    },
    {
      "ITEM": 2,
      "CODIGO": "2.02",
      "DESCRIPCION": "Pintura esmalte en puertas metálicas",
      "UNIDAD": "kg",
      "CANTIDAD": 15.78,
      "VALOR_UNITARIO": 61800,
      "VALOR_TOTAL": 975204,
      "OBSERVACIONES": "Aplicar normativa NSR-10"
    }
    // ...puedes añadir más ítems
  ],
  "Redes Hidrosanitarias": [
    {
      "ITEM": 3,
      "CODIGO": "4.03",
      "DESCRIPCION": "Mampostería en bloque de arcilla estructural",
      "UNIDAD": "m",
      "CANTIDAD": 28.25,
      "VALOR_UNITARIO": 731000,
      "VALOR_TOTAL": 20650750,
      "OBSERVACIONES": "Incluye transporte y descargue"
    }
    // ...puedes añadir más ítems
  ],
  // ...agrega el resto de rubros igual que arriba
};
