import sql from "mssql";
import { getDealerConnection } from "./dealerService";
import { DealerConfig } from "../types/DealerConfig";

export async function getCompanyHeader(dealer: DealerConfig) {
  const connection = getDealerConnection(dealer.emp);
  const config: sql.config = {
    server: connection.server,
    database: connection.database,
    user: connection.user,
    password: connection.password,
    options: {
      encrypt: false,
      trustServerCertificate: true
    }
  };

  const pool = new sql.ConnectionPool(config);
  await pool.connect();

  try {
    const request = pool.request();
    request.input("Emp", dealer.emp);

    const result = await request.query(`
      SELECT
        Razon AS RazonSocial,
        CIF AS Direccion1,
        Direccion AS Direccion2,
        TRIM(CPostal) + ' ' + TRIM(pb.Descrip) + ' (' + TRIM(pr.Descrip) + ')' AS Direccion3,
        e.NumTel1 AS Telefono
      FROM tgEmpresa e
      INNER JOIN tgPobla pb ON pb.Id = e.Pobla
      INNER JOIN tgProvin pr ON pr.Id = e.Provin
      WHERE Emp = @Emp
    `);

    return result.recordset[0] ?? null;
  } finally {
    await pool.close();
  }
}
