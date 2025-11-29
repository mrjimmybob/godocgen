import sql from "mssql";
import { getDealerByEmp, getDealerConnection } from "./dealerService";

//
// Returned structure for both PLAN A and PLAN B
//
export interface ContractResult {
  Cif: string;
  Nombre: string;
  Apellidos: string;
  Telefono: string;
  Direccion: string;
  CodigoPostal: string;
  Poblacion: string;
  Provincia: string;
  CorreoE: string;
  Modelo: string;
  Matricula: string;
  Chasis: string;
  PrimeraMatriculacion: string;
  Importe: string;
  FormaDePago: string;
  Dia: string;
  Mes: string;
  Año: string;
  TipoCare: string;
  Emp: number;
  Concesionario: string;
  Vendedor: string;
  CodCliente: string;
  VehiculoMaestro: string;
}


export async function getContractByCif(
  cif: string
): Promise<ContractResult | null> {
  const pool = new sql.ConnectionPool({
    user: process.env.SQL_USER!,
    password: process.env.SQL_PASSWORD!,
    server: process.env.SQL_SERVER!,
    database: process.env.SQL_DATABASE!,   // GO
    options: { trustServerCertificate: true },
    port: Number(process.env.SQL_PORT) || 1433,
  });

  await pool.connect();

  const result = await pool
    .request()
    .input("cif", sql.VarChar, cif)
    .query(`
      SELECT 
        Agente AS Concesionario,
        Emp,
        Vendedor,
        CodCliente,
        VehiculoMaestro,
        Tipo AS TipoCare,
        Cif,
        Nombre, 
        Apellidos,
        Telefono,
        Direccion,
        CodigoPostal,
        Poblacion,
        Provincia,
        email AS CorreoE,
        Modelo,
        Matricula,
        Chasis,
        FORMAT(FechaMatriculacion, 'dd/MM/yyyy') AS PrimeraMatriculacion,
        ImporteFinal AS Importe,
        FormaDePago,
        DAY(Fecha) AS Dia,
        MONTH(Fecha) AS Mes,
        YEAR(Fecha) AS Año
      FROM CARE_Contrato
      WHERE LOWER(Cif) = LOWER(@cif)
    `);

  await pool.close();

  return result.recordset[0] ?? null;
}

// Query Autonet (based on dealer)
export async function getClientFromDealer({
  dealerEmp,
  cif,
  vin,
}: {
  dealerEmp: number;
  cif: string;
  vin: string;
}): Promise<ContractResult | null> {
  const dealer = getDealerByEmp(dealerEmp);
  if (!dealer) throw new Error("Dealer not found");

  const connection = getDealerConnection(dealerEmp);

  const pool = new sql.ConnectionPool({
    user: connection.user,
    password: connection.password,
    server: connection.server,
    database: connection.database,
    port: 1433, // fixed (same for all)
    options: { trustServerCertificate: true },
  });

  await pool.connect();

  const result = await pool
    .request()
    .input("cif", sql.VarChar, cif)
    .input("vin", sql.VarChar, vin)
    .input("dealerName", sql.VarChar, dealer.nombre)
    .input("dealerEmp", sql.Int, dealer.emp)
    .query(`
      SELECT TOP 1
        @dealerName AS Concesionario,
        @dealerEmp AS Emp,
        '' AS Vendedor,
        c.Codigo AS CodCliente,
        v.VehiculoMaestro,
        TRIM(c.Cif) AS Cif,
        UPPER(TRIM(c.Nombre)) AS Nombre, 
        UPPER(CONCAT_WS(' ', NULLIF(TRIM(c.Apellido1), ''), NULLIF(TRIM(c.Apellido2), ''))) AS Apellidos,
        CONCAT_WS(' | ', NULLIF(TRIM(c.NumTel1), ''), NULLIF(TRIM(c.NumTel2), '')) AS Telefono,
        TRIM(c.Direccion) AS Direccion,
        TRIM(c.CPostal) AS CodigoPostal,
        TRIM(pb.Descrip) AS Poblacion,
        TRIM(pr.Descrip) AS Provincia,
        TRIM(c.email) AS CorreoE,
        v.Modelo,
        v.Matric AS Matricula,
        v.Chasis,
        FORMAT(v.FecMatricPrimera, 'dd/MM/yyyy') AS PrimeraMatriculacion,
        '' AS Importe,
        '' AS FormaDePago,
        '' AS Dia,
        '' AS Mes,
        '' AS Año
      FROM tgCliente c
      INNER JOIN tgPobla pb ON pb.Id = c.Pobla
      INNER JOIN tgProvin pr ON pr.Id = c.Provin
      INNER JOIN tcVeh v ON v.Chasis = @vin
      WHERE LOWER(c.CIF) = LOWER(TRIM(@cif))
    `);

  await pool.close();

  return result.recordset[0] ?? null;
}
