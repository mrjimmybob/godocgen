// No changes needed, just verifying content.
import sql from "mssql";
import dealersData from "../config/dealers.json";
import connectionsData from "../config/connections.json";
import { DealerConfig } from "../types/DealerConfig";
import { DealerConnection } from "../types/DealerConnections";

const dealers: DealerConfig[] = dealersData.dealers;
const connections: DealerConnection[] = connectionsData;

export function getDealers(): DealerConfig[] {
  return dealers;
}

export function getDealerByEmp(emp: number): DealerConfig | undefined {
  return dealers.find((d) => d.emp === emp);
}

export function getDealerConnection(emp: number): DealerConnection {
  const dealerConfig = getDealerByEmp(emp);
  if (!dealerConfig) {
    throw new Error(`Dealer config not found for emp ${emp}`);
  }
  const connection = connections.find((c) => c.name === dealerConfig.nombre);
  if (!connection) {
    throw new Error(`Connection not found for dealer ${dealerConfig.nombre}`);
  }
  return connection;
}

export async function getDealerDetails(emp: number): Promise<DealerConfig> {
  const dealerConfig = getDealerByEmp(emp);
  if (!dealerConfig) {
    throw new Error(`Dealer config not found for emp ${emp}`);
  }

  const connection = connections.find((c) => c.name === dealerConfig.nombre);
  if (!connection) {
    throw new Error(`Connection not found for dealer ${dealerConfig.nombre}`);
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

  await pool.connect();

  try {
    const result = await pool.request().input("Emp", sql.Int, emp).query(`
      SELECT CIF
            ,Razon
            ,DescripCorto
            ,Direccion
            ,CPostal
            ,pr.Descrip AS Provincia
            ,pb.Descrip AS Poblacion
            ,NumTel1
            ,NumTel2
            ,NumFax
            ,EMail
        FROM tgEmpresa e
        INNER JOIN tgPobla pb ON pb.Id=e.Pobla
        INNER JOIN tgProvin pr ON pr.Id=e.Provin
        WHERE Emp=@Emp;
    `);

    const dbData = result.recordset[0];

    if (!dbData) {
      // If no data in DB, return config as is (or throw?)
      // User said "fill the dealer data with the dirrecciones from the json file (lets override the db address data with the json data)"
      // implying we prioritize JSON.
      return dealerConfig;
    }

    // Map DB data to DealerConfig structure (if needed) or just return dealerConfig since we override DB address.
    // However, we might want other fields from DB like 'Razon' if it differs?
    // User said "override the db address data with the json data".
    // So we take DB data, and overlay JSON address data.
    // But DealerConfig structure is specific.
    // Let's assume we return DealerConfig.

    // Actually, the user might want the merged object to be used for PDF generation which expects specific fields.
    // The DealerConfig interface has: nombre, esGrupo, marca, razon, direccionPostal, direccion1, direccion2, emp.
    // The DB returns: CIF, Razon, DescripCorto, Direccion, CPostal, Provincia, Poblacion, NumTel1...

    // If we are strictly returning DealerConfig, we are just returning what's in JSON because JSON has all the address info.
    // UNLESS the DB has some info we need that is NOT in JSON?
    // The user said "get the dealer data using the query... and after that fill the dealer data with the dirrecciones from the json file".
    // This suggests the result should be a mix.
    // But `getDealerDetails` returns `DealerConfig`.
    // Does `DealerConfig` have fields for `CIF` or `DescripCorto`? No.
    // So maybe I should return a merged type or `any`?
    // `pdfService` uses `RazonSocial`, `Direccion1`, `Direccion2`, `Direccion3`, `Telefono`.
    // The query returns `Razon`, `Direccion`, `CPostal`, `Provincia`, `Poblacion`, `NumTel1`.

    // I will return the DealerConfig as defined in the type, but maybe I should update DealerConfig to include DB fields if they are needed?
    // Or maybe the return type should be `Promise<any>` to support the PDF generation needs?
    // The `pdfService` expects `dealerHeader` with `RazonSocial`, `Direccion1`, `Direccion2`, `Direccion3`, `Telefono`.
    // The DB query returns `Razon` (maps to RazonSocial), `Direccion` (maps to Direccion2?), `CPostal`...
    
    // But the user said "override the db address data with the json data".
    // JSON `direccion1` has `linea1`, `linea2`, `linea3`, `telefono`.
    
    // So I will construct an object that satisfies what `pdfService` likely needs, but typed as `DealerConfig`?
    // No, `DealerConfig` is the configuration.
    // Maybe I should return `DealerConfig` AND the DB data?
    
    // Let's look at `pdfService` again.
    // It calls `getDealerHeader`.
    // `getDealerHeader` returned `RazonSocial`, `Direccion1`, `Direccion2`, `Direccion3`, `Telefono`.
    
    // I will update `DealerConfig` to include these fields? No, that's mixing concerns.
    // I will return an intersection of DealerConfig and the DB result, or just `any` for now to be safe, or a new type.
    // Given the constraints and the user's prompt "fill the dealer data with the dirrecciones from the json file",
    // I will return the `DealerConfig` object, but I will ensure `razon` comes from DB (or JSON?), and addresses come from JSON.
    
    // Actually, `dealers.json` has `razon`.
    // So if we override DB with JSON, we basically just return JSON.
    // What is the point of the DB query then?
    // Maybe to get `CIF`? `dealers.json` doesn't have `CIF`.
    // `pdfService` uses `cif` from `data` (which comes from `sample.json` or user input), not dealer header.
    // Wait, `pdfService` `getDealerHeader` query returned `CIF AS Direccion1`. That was weird.
    
    // The user's query: `SELECT CIF, Razon...`
    // User: "fill the dealer data with the dirrecciones from the json file (lets override the db address data with the json data)".
    
    // So:
    // 1. Get DB data.
    // 2. Overwrite with JSON data.
    
    // I will return a merged object.
    
    return {
        ...dbData,
        ...dealerConfig,
        // Ensure JSON address fields are present
        direccion1: dealerConfig.direccion1,
        direccion2: dealerConfig.direccion2,
        direccion3: dealerConfig.direccion3,
    };

  } finally {
    await pool.close();
  }
}
