import express from 'express'
import authMiddleware from '../middleware/Auth.js';
import { addIncome,deleteIncome,downloadIncomeExcel,getALLIncome,getIncomeOverview,updateIncome } from '../controllers/incomeController.js';   
const incomeRouter= express.Router();

incomeRouter.post("/add",authMiddleware,addIncome);
incomeRouter.get("/get", authMiddleware,getALLIncome);

incomeRouter.put("/update/:id",authMiddleware,updateIncome);
incomeRouter.get("/downloadexcel", authMiddleware,downloadIncomeExcel);

incomeRouter.delete("/delete/:id",authMiddleware,deleteIncome);
incomeRouter.get("/overview",authMiddleware,getIncomeOverview);

export default incomeRouter;