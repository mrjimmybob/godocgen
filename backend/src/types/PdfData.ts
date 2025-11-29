export interface DealerAddress {
    linea1: string;
    linea2: string;
    linea3: string;
    telefono: string;
}

export interface DealerModel {
    direccion1: DealerAddress;
    direccion2?: DealerAddress;
    direccion3?: DealerAddress;
}

export interface PdfData {
    agente: string;
    datosModelo: DealerModel;
    
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
