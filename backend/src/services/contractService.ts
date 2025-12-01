import sql from "mssql";
import { pool } from "../db/sql";
import { getDealerConnection } from "./dealerService";
import { ContractData, DualSourceData } from "../types/ContractData";

export async function getCareContractData(cif: string): Promise<ContractData | null> {
    try {
        const result = await pool.request()
            .input("cif", sql.VarChar, cif)
            .query(`
                SELECT TOP 1
                    Fecha, Agente, Emp, Vendedor,
                    VehiculoMaestro, Chasis, Matricula, Modelo, CodMarca, FechaMatriculacion,
                    CodCliente, Cif, Nombre, Apellidos, Telefono, Email, Direccion, CodigoPostal, Poblacion, Provincia,
                    Contrato, Tipo, ImporteFinal, ImporteRecomendado, FormaDePago
                FROM CARE_Contrato
                WHERE Cif = @cif
            `);

        if (result.recordset.length === 0) return null;

        const row = result.recordset[0];

        // Parse Fecha for contract date
        let dia = "";
        let mes = "";
        let año = "";

        if (row.Fecha) {
            const date = new Date(row.Fecha);
            dia = date.getDate().toString();
            const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            mes = meses[date.getMonth()];
            año = date.getFullYear().toString();
        }

        // Format FechaMatriculacion to DD/MM/YYYY
        let fechaMatriculacion = row.FechaMatriculacion;
        if (fechaMatriculacion) {
            const date = new Date(fechaMatriculacion);
            if (!isNaN(date.getTime())) {
                const day = date.getDate().toString().padStart(2, "0");
                const month = (date.getMonth() + 1).toString().padStart(2, "0");
                const year = date.getFullYear();
                fechaMatriculacion = `${day}/${month}/${year}`;
            }
        }

        return {
            // Client
            cif: row.Cif,
            nombre: row.Nombre,
            apellidos: row.Apellidos,
            telefono: row.Telefono,
            email: row.Email,
            direccion: row.Direccion,
            codigoPostal: row.CodigoPostal,
            poblacion: row.Poblacion,
            provincia: row.Provincia,

            // Vehicle
            matricula: row.Matricula,
            modelo: row.Modelo,
            chasis: row.Chasis,
            fechaMatriculacion: fechaMatriculacion, 

            // Contract
            contrato: row.Contrato,
            tipo: row.Tipo,
            importe: row.ImporteFinal, 
            formaDePago: row.FormaDePago,
            
            // Date components
            dia,
            mes,
            año
        };
    } catch (err) {
        console.error("Error fetching CARE contract:", err);
        return null;
    }
}

export async function getDealerContractData(cif: string, dealerId: number, vin?: string): Promise<ContractData | null> {
    let connection;
    try {
        connection = getDealerConnection(dealerId);
    } catch (e) {
        console.warn(`Skipping dealer fetch: ${e}`);
        return null;
    }

    const pool = new sql.ConnectionPool({
        user: connection.user,
        password: connection.password,
        server: connection.server,
        database: connection.database,
        options: {
            trustServerCertificate: true,
        },
    });

    try {
        await pool.connect();

        // 1. Fetch Client Data
        const clientResult = await pool.request()
            .input("cif", sql.VarChar, cif)
            .query(`
                SELECT TOP 1
                    c.Codigo AS CodCliente,
                    TRIM(c.Cif) AS Cif,
                    UPPER(TRIM(c.Nombre)) AS Nombre, 
                    UPPER(CONCAT_WS(' ', NULLIF(TRIM(c.Apellido1), ''), NULLIF(TRIM(c.Apellido2), ''))) AS Apellidos,
                    CONCAT_WS(' | ', NULLIF(TRIM(c.NumTel1), ''), NULLIF(TRIM(c.NumTel2), '')) AS Telefono,
                    TRIM(c.email) AS Email,
                    TRIM(c.Direccion) AS Direccion,
                    TRIM(c.CPostal) AS CodigoPostal,
                    TRIM(pb.Descrip) AS Poblacion,
                    TRIM(pr.Descrip) AS Provincia
                FROM tgCliente c
                    INNER JOIN tgPobla pb ON pb.Id = c.Pobla
                    INNER JOIN tgProvin pr ON pr.Id = c.Provin
                WHERE LOWER(TRIM(c.CIF)) = LOWER(TRIM(@cif))
            `);
        
        const clientRow = clientResult.recordset[0];
        if (!clientRow && !vin) return null; // No client and no VIN to search vehicle

        // 2. Fetch Vehicle Data (if VIN provided)
        let vehicleRow = null;
        if (vin) {
            const vehicleResult = await pool.request()
                .input("vin", sql.VarChar, vin)
                .query(`
                    SELECT TOP 1
                        v.VehiculoMaestro AS VehiculoMaestro,
                        v.Chasis AS Chasis,
                        v.Matric AS Matricula,
                        v.Modelo AS Modelo,
                        v.Marca AS CodMarca,
                        FORMAT(v.FecMatricPrimera, 'dd/MM/yyyy') AS FechaMatriculacion
                    FROM tcVeh v 
                    WHERE LOWER(v.Chasis) = LOWER(TRIM(@vin))
                `);
            vehicleRow = vehicleResult.recordset[0];
        }

        // 3. Construct Data
        return {
            // Client
            cif: clientRow?.Cif || "",
            nombre: clientRow?.Nombre || "",
            apellidos: clientRow?.Apellidos || "",
            telefono: clientRow?.Telefono || "",
            email: clientRow?.Email || "",
            direccion: clientRow?.Direccion || "",
            codigoPostal: clientRow?.CodigoPostal || "",
            poblacion: clientRow?.Poblacion || "",
            provincia: clientRow?.Provincia || "",

            // Vehicle
            matricula: vehicleRow?.Matricula || "",
            modelo: vehicleRow?.Modelo || "",
            chasis: vehicleRow?.Chasis || "",
            fechaMatriculacion: vehicleRow?.FechaMatriculacion || "",

            // Contract (Defaults)
            contrato: "",
            tipo: 1,
            importe: 0.00,
            formaDePago: "Contado"
        };

    } catch (err) {
        console.error("Error fetching Dealer contract:", err);
        return null;
    } finally {
        await pool.close();
    }
}

export async function searchContract(cif: string, dealerId: number): Promise<DualSourceData> {
    const contractData = await getCareContractData(cif);
    
    // Use VIN from contract if available to fetch dealer vehicle data
    const vin = contractData?.chasis;
    
    const dealerData = await getDealerContractData(cif, dealerId, vin);

    return {
        contract: contractData,
        dealer: dealerData
    };
}
