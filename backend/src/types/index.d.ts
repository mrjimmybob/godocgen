export interface TemplateInfo {
    name: string;      // file name
    path: string;      // absolute or relative path
    type: "relax" | "care" | string;
  }
  
  export interface CareDocument {
    id: number;
    title: string;
    createdAt: string;
  }
  
export interface PdfCareModel {
  agente: string;
  datosModelo: {
    direccion1: {
      linea1: string;
      linea2: string;
      linea3: string;
      telefono: string;
    };
    direccion2: {
      linea1: string;
      linea2: string;
      linea3: string;
      telefono: string;
    };
    direccion3: {
      linea1: string;
      linea2: string;
      linea3: string;
      telefono: string;
    };
  };

  cif: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  direccion: string;
  codigoPostal: string;
  poblacion: string;
  provincia: string;
  correoE: string;

  modelo: string;
  matricula: string;
  chasis: string;
  primeraMatriculacion: string;

  importe: string;
  formaDePago: string;

  dia: string;
  mes: string;
  año: string;
}
