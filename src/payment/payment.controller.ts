import { Request, Response } from "express";
import { createPaymentService, deletePaymentService, getAllPaymentsService, getPaymentByIdService, getPaymentsByUserIdService } from "./payment.service";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export const getAllPayments = async (req: Request, res: Response) => {
    const page = Number(req.query.page);
    const pageSize = Number(req.query.pageSize);
    
    try {
        const payments = await getAllPaymentsService(page, pageSize);
        if (!payments || payments.length === 0) {
            res.status(404).json({ error: "No payments found" });
            return;
        }
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch payments" });
    }
}

export const getPaymentById = async (req: Request, res: Response) => {
    const paymentId = parseInt(req.params.id);
    if (isNaN(paymentId)) {
        res.status(400).json({ error: "Invalid payment ID" });
        return;
    }

    try {
        const payment = await getPaymentByIdService(paymentId);
        if (!payment) {
            res.status(404).json({ error: "Payment not found" });
            return;
        }
        res.status(200).json(payment);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch payment" });
    }
}

export const createPayment = async (req: Request, res: Response) => {
    const paymentData = req.body;
    try{
        const payment = await createPaymentService(paymentData);

        if(!payment){
            res.status(400).json({error: "Payment not created to database"});
            return
        }

        res.status(201).json({message: "Payment created Successfully"});
    }catch(err: any){
        res.status(500).json({message: "Failed to  created a payment", error: err.error})
    }
};

export const deletePayment = async (req: Request, res: Response) => {
    const paymentId = parseInt(req.params.id);
    if (isNaN(paymentId)) {
        res.status(400).json({ error: "Invalid payment ID" });
        return;
    }

    try {
        const message = await deletePaymentService(paymentId);
        res.status(200).json({ message });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete payment" });
    }
}

export const createCheckoutSession = async (req: Request, res: Response) => {
  const { amount, appointmentId } = req.body;
  const url =  process.env.FRONTEND_URL


  if (!amount || isNaN(amount)) {
    res.status(400).json({ error: 'Invalid input' });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amount,
            product_data: {
              name: 'Appointment Payment',
              description: 'Doctor Consultation',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId: appointmentId ? String(appointmentId) : '',
      },
      success_url: `${url}user-dashboard`,
      cancel_url: `${url}payment-cancelled`,
    });

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

export const getPaymentsByUserId = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.query.userId);  // Using query param: /appointments/user?userId=123

        if (isNaN(userId)) {
             res.status(400).json({ message: "Invalid or missing userId" });
             return;
        }
        const page=1;
        const pageSize = 10;

        const appointments = await getPaymentsByUserIdService(userId, page, pageSize);

        if (!appointments) {
             res.status(404).json({ message: "No appointments found for this user." });
             return;
        }

         res.status(200).json(appointments);
         return;
    } catch (error) {
        console.error("Failed to get appointments:", error);
         res.status(500).json({ message: "Internal server error" });
         return;
    }
};
