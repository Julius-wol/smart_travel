import express from 'express';
import { signUp, signIn, signOut, forgotPassword, verifyOtp, resetPassword, googleSignIn } from '../controllers/authController.js';

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/signout", signOut);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/google", googleSignIn);

export default router;