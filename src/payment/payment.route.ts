import { Router } from "express";
import { createPayment, deletePayment, getAllPayments, getPaymentById, createCheckoutSession,getPaymentsByUserId } from "./payment.controller";
import { pagination } from "../middleware/pagination";
import { adminAuth, adminOrUserAuth } from "../middleware/bearAuth";
import { webhookHandler } from "./payment.webhook";
const paymentRouter = Router();

paymentRouter.get("/payments",pagination,adminAuth, getAllPayments);
paymentRouter.get("/payments/user",getPaymentsByUserId);
paymentRouter.get("/payments/:id",adminOrUserAuth, getPaymentById);
paymentRouter.post("/payments", createPayment);
paymentRouter.delete("/payments/:id", deletePayment);
paymentRouter.post("/payments/create-checkout-session", createCheckoutSession);
paymentRouter.post("/payments/webhook", webhookHandler);


export default paymentRouter;
