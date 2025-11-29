// src/services/buildPdfCareModel.ts
import { PdfCareModel } from "../types/index";

// Extend these types as needed
export interface FrontendPayload {
  contacto: {
    cif: string;
    nombre: string;
    apellidos: string;
    telefono: string;
    direccion: string;
    codigoPostal: string;
    poblacion: string;
    provincia: string;
    correoE: string;
  };
  vehiculo: {
    modelo: string;
    matricula: string;
    chasis: string;
    primeraMatriculacion: string;
  };
  contrato?: {
    tipo: number;
    importe: string;
    formaDePago: string;
    fecha: string; // yyyy-mm-dd
  };
  concesionario: {
    agente: string;
    direccion1: any;
    direccion2?: any;
    direccion3?: any;
  };
}

export function buildPdfCareModel(data: FrontendPayload): PdfCareModel {
  const fecha = data.contrato?.fecha
    ? new Date(data.contrato.fecha)
    : new Date();

  const dia = fecha.getDate().toString();
  const año = fecha.getFullYear().toString();
  const mes = fecha.toLocaleString("es-ES", { month: "long" });

  return {
    agente: data.concesionario.agente,

    datosModelo: {
      direccion1: data.concesionario.direccion1,
      direccion2: data.concesionario.direccion2 ?? {
        linea1: "",
        linea2: "",
        linea3: "",
        telefono: ""
      },
      direccion3: data.concesionario.direccion3 ?? {
        linea1: "",
        linea2: "",
        linea3: "",
        telefono: ""
      }
    },

    cif: data.contacto.cif,
    nombre: data.contacto.nombre,
    apellidos: data.contacto.apellidos,
    telefono: data.contacto.telefono,
    direccion: data.contacto.direccion,
    codigoPostal: data.contacto.codigoPostal,
    poblacion: data.contacto.poblacion,
    provincia: data.contacto.provincia,
    correoE: data.contacto.correoE,

    modelo: data.vehiculo.modelo,
    matricula: data.vehiculo.matricula,
    chasis: data.vehiculo.chasis,
    primeraMatriculacion: data.vehiculo.primeraMatriculacion,

    importe: data.contrato?.importe ?? "",
    formaDePago: data.contrato?.formaDePago ?? "",
    dia,
    mes,
    año
  };
}
