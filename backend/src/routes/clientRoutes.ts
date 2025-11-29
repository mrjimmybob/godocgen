import { Router } from "express";
import { 
    getClientController, 
    getClientFromDealerController
} from "../controllers/clientController";

const router = Router();

router.get("/client/:cif", getClientController);

router.post("/client/fromDealer", getClientFromDealerController);

export default router;
