export interface CareClientData {
    Agente: string;
    Emp: number;
    Vendedor: string;
    CodCliente: string;
    VehiculoMaestro: string;

    TipoCare: number;

    CIF: string;
    VIN: string;
    Cliente: string;
    Matricula: string;
    Modelo: string;
    Chasis: string;

    PrimeraMatriculacion: string; // dates from SQL always string unless parsed

    ImporteFinal: number | null;
    Importe: number | null;

    FormaDePago: string;

    Dia: number | null;
    Mes: number | null;
    Año: number | null;

    CorreoE: string;
    Direccion: string;
    CodigoPostal: string;
    Poblacion: string;
    Provincia: string;
    Telefono: string;

    Nombre: string;
    Apellidos: string;
}


export interface CareTemplateInfo {
    name: string;
}
