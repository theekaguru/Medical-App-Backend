import { Request, Response } from "express";
import { getUserByEmailService, getUserById, registerUserService, updateUserPasswordService, updateVerificationStatusService } from "./auth.service";
import { registerUserValidator, userLogInValidator } from "../validators/user.validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { sendNotificationEmail } from "../middleware/nodeMailer";

export const registerUser = async (req: Request, res: Response) => {     
    try {
        // Validate user input
        const parseResult = registerUserValidator.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({ error: parseResult.error.issues });
            return;
        }

        const user = parseResult.data;

        // Check if user already exists
        const existingUser = await getUserByEmailService(user.email);
        if (existingUser) {
            res.status(400).json({ error: "User with this email already exists" });
            return;
        }

        // Hash password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(user.password, salt);
        user.password = hashedPassword;

        // Generate OTP
        user.confirmationCode = generateConfirmationCode().toString();

        // Create user
        const newUser = await registerUserService(user);

        console.log(newUser);
        // Send notification email
        const subject = "Account Created Successfully";
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
                <h2 style="color: #093FB4;">Welcome, ${user.firstName} ${user.lastName}!</h2>
                <p>Thank you for registering with our <strong>Medical Appointment & Patient Management System</strong>.</p>
                <p>Your verification code is:</p>
                <div style="background-color: #eef3fc; padding: 10px; border-radius: 6px; text-align: center; font-size: 20px; font-weight: bold; color: #093FB4;">
                ${user.confirmationCode}
                </div>
                <p>Please enter this code to verify your email and activate your account.</p>
                <p style="color: #777;">If you did not create this account, please ignore this email.</p>
                <p style="margin-top: 30px;">Thank you,<br><strong>The Medical Services Team</strong></p>
            </div>
        `;

        const emailSent = await sendNotificationEmail(user.email,subject, user.firstName, html);

        if (!emailSent) {
            res.status(500).json({ error: "User created but failed to send notification email" });
            return;
        }

        res.status(201).json({ email: "Email sent successfully", user: newUser, message: "User registered successfully. Please verify your email." });

    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to register user" });
    }
}

export const loginUser = async (req: Request, res: Response) => {
    try {
        const parseResult = userLogInValidator.safeParse(req.body);

        if (!parseResult.success) {
        res.status(400).json({ error: "Invalid input", details: parseResult.error });
        return;
        }

        const user = parseResult.data;

        const userExists = await getUserByEmailService(user.email);
        if (!userExists) {
        res.status(404).json({ error: "User does not exist" });
        return;
        }

        if (!userExists.emailVerified) {
        res.status(403).json({ error: "Please Verify Email" });
        return;
        }

        const isMatch = bcrypt.compareSync(user.password, userExists.password!);
        if (!isMatch) {
        res.status(401).json({ error: "Invalid password" });
        return; // Missing return fixed
        }

        const payload = {
        userId: userExists.userId,
        userEmail: userExists.email,
        role: userExists.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        };

        const secret = process.env.JWT_SECRET as string;
        const token = jwt.sign(payload, secret);

        res.status(200).json({
        token,
        userId: userExists.userId,
        email: userExists.email,
        role: userExists.role,
        message: "Login successful 😎",
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to login user" });
    }
};


export const passwordReset = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ error: "Email is required" });
            return;
        }

        const user = await getUserByEmailService(email);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        // Generate a reset token (for simplicity, using JWT)
        const secret = process.env.JWT_SECRET as string;
        const resetToken = jwt.sign({ userId: user.userId }, secret, { expiresIn: '1h' });

        // Send reset email (you can implement this function)
        const url =  process.env.FRONTEND_URL
        const results = await sendNotificationEmail(email, "Password Reset", user.firstName, `Click the link to reset your password: <a href="${url}reset-password/${resetToken}">Reset Password</a>`);
        
        if (!results) {
            res.status(500).json({ error: "Failed to send reset email" });
            return;
        }

        res.status(200).json({ message: "Password reset email sent successfully" });
    } catch (error:any) {
        res.status(500).json({ error:error.message || "Failed to reset password" });
    }
}

export const updatePassword = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token) {
            res.status(400).json({ error: "Token is required" });
            return;
        }

        if (!password) {
            res.status(400).json({ error: "Password is required" });
            return;
        }

        const secret = process.env.JWT_SECRET as string;
        const payload: any = jwt.verify(token, secret);

        // Fetch user by ID from getUserById service
        const user = await getUserById(payload.userId);

        console.log(user);

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Now use the user's email from DB
        await updateUserPasswordService(user.email!, hashedPassword);

        res.status(200).json({ message: "Password has been reset successfully" });

    } catch (error: any) {
        res.status(500).json({ error: error.message || "Invalid or expired token" });
    }
};

export const emailVerfication = async(req: Request, res: Response) => {
    const { email, confirmationCode } = req.body;

    const verifyEmail = await getUserByEmailService(email);
    if (!verifyEmail) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    const isConfirmationCodeValid = verifyEmail.confirmationCode === confirmationCode;
    if (!isConfirmationCodeValid) {
        res.status(400).json({ error: "Invalid Confirmation code" });
        return;
    }
    // Update user status to verified
    verifyEmail.emailVerified = true;
    verifyEmail.confirmationCode = null; // Clear OTP after verification
    const updatedUser = await updateVerificationStatusService(verifyEmail.email!, verifyEmail.emailVerified, verifyEmail.confirmationCode);
    if (!updatedUser) {
        res.status(500).json({ error: "Failed to update verification status" });
        return;
    }
    res.status(200).json({ message: "Email verified successfully" });
    return;
}

// Generate confirmation code
const generateConfirmationCode = () => {
    return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
}