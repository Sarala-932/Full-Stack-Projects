import express from "express";
import authenticate from "./middleware/authentication.mjs";
import registerUser from "./controllers/userController.mjs";
import {createAccount, getUserAccounts, getDashboardData} from "./controllers/dashboardController.mjs";
import {
    getAccountWithTransactions,
    updateDefaultAccount,
    bulkDeleteTransactions,
} from "./controllers/accountController.mjs";
import {getCurrentBudget, updateBudget} from "./controllers/budgetController.mjs";
import {
    bulkCreateTransactions,
    createTransaction,
    scanReceipt,
    getTransaction,
    updateTransaction
} from "./controllers/transactionController.mjs";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/api", (req, res) => {
    res.send("API running successfully");
});

// create a user
router.post("/api/register", authenticate, registerUser);

// create a account
router.post("/create-account", authenticate, createAccount);

// get user accounts
router.get("/user-accounts", authenticate, getUserAccounts);

// get dashboard transactions
router.get("/dashboard", authenticate, getDashboardData);

// update default account
router.patch("/account/:accountId", authenticate, updateDefaultAccount);

// get account with transactions
router.get("/account/:accountId", authenticate, getAccountWithTransactions);

// delete transactions
router.delete("/account/:accountId/bulk-delete", authenticate, bulkDeleteTransactions);

// get current budget
router.get("/:accountId/budget", authenticate, getCurrentBudget);

// update budget
router.post("/update", authenticate, updateBudget);

router.post("/create", authenticate, createTransaction);

router.post("/scan", authenticate, upload.single("file"), scanReceipt);

router.post("/bulk-create", authenticate, bulkCreateTransactions);

router.get("/transaction/:id", authenticate, getTransaction);
router.put("/transaction/:id", authenticate, updateTransaction);

export default router;
