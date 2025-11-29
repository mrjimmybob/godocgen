import { pool, poolConnect } from "../db/sql";

export async function getCareDocuments(): Promise<any[]> {
    await poolConnect; // ensures connection
  
    const request = pool.request();
    const result = await request.query(`
        SELECT Tipo, Nombre, Descripcion FROM CARE_Tipo
    `);
  
    return result.recordset;
  }
