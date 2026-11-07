import { Router } from 'express';
import {
  handleSendPhoneOtp,
  handleVerifyPhoneOtp,
  handleSendEmailOtp,
  handleVerifyEmailOtp,
} from '../controllers/otp.controller.js';
import { strictRateLimiter } from '../middlewares/rateLimit.middleware.js';

export const phoneOtpRouter = Router();
phoneOtpRouter.post('/send', strictRateLimiter, handleSendPhoneOtp);
phoneOtpRouter.post('/verify', strictRateLimiter, handleVerifyPhoneOtp);

export const emailOtpRouter = Router();
emailOtpRouter.post('/send', strictRateLimiter, handleSendEmailOtp);
emailOtpRouter.post('/verify', strictRateLimiter, handleVerifyEmailOtp);

