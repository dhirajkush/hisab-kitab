import express from 'express'
import authMiddleware from '../middleware/Auth.js';
import {
  addExpense,
  deleteExpense,
  getALLExpense,
  updateExpense,
  downloadExpenseExcel,
  getExpenseOverview
} from '../controllers/expenseController.js';
const expenseRouter=express.Router();



expenseRouter.post("/add",authMiddleware,addExpense);
expenseRouter.get("/get", authMiddleware,getALLExpense);

expenseRouter.put("/update/:id",authMiddleware,updateExpense);
expenseRouter.get("/downloadexcel", authMiddleware,downloadExpenseExcel);

expenseRouter.delete("/delete/:id",authMiddleware,deleteExpense);
expenseRouter.get("/overview",authMiddleware,getExpenseOverview);


export default expenseRouter;
