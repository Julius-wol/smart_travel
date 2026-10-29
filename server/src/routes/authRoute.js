import express from 'express';
import {
    signUp,
    signIn,
    signOut,
    forgotPassword,
    verifyOtp,
    resetPassword,
    googleSignIn,
    hostSignInApi,
    hostSignUpApi,
    refreshTokenApi
} from '../controllers/authController.js';

const router = express.Router();

// User & Common Authentication
router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/signout", signOut);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/google", googleSignIn);
router.post("/refresh", refreshTokenApi);

// Dedicated Host REST Endpoints
router.post("/host/signin", hostSignInApi);
router.post("/host/signup", hostSignUpApi);

export default router;
