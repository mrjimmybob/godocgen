import { Request, Response } from "express";
import { searchContract, getCareContractData, getDealerContractData } from "../services/contractService";

export const searchContractController = async (req: Request, res: Response) => {
    try {
        const { cif, dealerId, vin, mode } = req.body;

        if (!cif && !vin) {
            return res.status(400).json({ error: "Missing required parameters: cif or vin" });
        }

        if (mode === 'care') {
            const contract = await getCareContractData(cif);
            return res.json({ contract, dealer: null });
        }

        if (mode === 'dealer') {
            if (!dealerId) return res.status(400).json({ error: "Missing dealerId for dealer search" });
            const dealer = await getDealerContractData(cif, parseInt(dealerId), vin);
            return res.json({ contract: null, dealer });
        }

        // Default / Legacy: Combined search (if needed, or remove)
        // For now, let's stick to the split modes as requested by UI logic.
        // But if we want to support the old way:
        if (cif && dealerId) {
             const result = await searchContract(cif, parseInt(dealerId));
             return res.json(result);
        }

        return res.status(400).json({ error: "Invalid search parameters or mode" });

    } catch (err: any) {
        console.error("Error searching contract:", err);
        return res.status(500).json({ error: err.message });
    }
};
