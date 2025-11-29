export interface DealerAddress {
    linea1: string;
    linea2: string;
    linea3: string;
    telefono: string;
}

export interface DealerConfig {
    nombre: string;
    esGrupo?: boolean;
    marca: string;
    razon: string;
    direccionPostal: string;
    direccion1: DealerAddress;
    direccion2?: DealerAddress;   // optional because not all dealers may have a second address
    direccion3?: DealerAddress;   // optional, if you ever store a 3rd one
    emp: number;
}
