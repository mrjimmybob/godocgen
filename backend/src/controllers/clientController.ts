// src/controllers/clientController.ts
// cspell:ignore CONTRATO
import { Request, Response } from "express";
import { getContractByCif } from "../services/clientService";
import { getClientFromDealer } from "../services/clientService";

export const getClientFromDealerController = async (req: Request, res: Response) => {
  try {
    const { dealer, cif, vin } = req.body;

    if (!dealer || !cif || !vin) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const data = await getClientFromDealer({
        dealerEmp: dealer.emp,  // or dealerEmp from body
        cif,
        vin
      });
      
    return res.json({ found: true, source: "AUTONET", data });

  } catch (err: any) {
    console.error("getClientFromDealerController error:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const getClientController = async (req: Request, res: Response) => {
  try {
    const cif = req.params.cif;

    if (!cif) {
      return res.status(400).json({ error: "Missing CIF" });
    }

    const contract = await getContractByCif(cif);

    if (contract) {
      return res.json({ found: true, source: "CARE_Contrato", data: contract });
    }

    return res.json({ found: false, reason: "NOT_IN_CARE_CONTRATO" });

  } catch (err: any) {
    console.error("getClientController error:", err);
    return res.status(500).json({ error: err.message });
  }
};
