export interface ContractData {
    // Client Data
    cif: string;
    nombre: string;
    apellidos: string;
    telefono: string;
    email: string;
    direccion: string;
    codigoPostal: string;
    poblacion: string;
    provincia: string;

    // Vehicle Data
    matricula: string;
    modelo: string;
    chasis: string;
    fechaMatriculacion: string; // DD/MM/YYYY

    // Contract Data
    contrato?: string; // Number or string ID
    tipo?: number;
    importe?: number;
    formaDePago?: string;
    
    // Date components for contract
    dia?: string;
    mes?: string;
    año?: string;
}

export interface DualSourceData {
    contract: ContractData | null;
    dealer: ContractData | null;
}
