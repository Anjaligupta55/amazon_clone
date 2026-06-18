import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { login } from '../store/slices/authSlice';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

// Validation Schemas
const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export const AuthPages: React.FC<{ mode: 'login' | 'register' | 'forgot' | 'otp' }> = ({ mode }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showOtp, setShowOtp] = useState(false);
  const [otpVal, setOtpVal] = useState('');

  // Forms Hook
  const { register: regLogin, handleSubmit: handleLogSubmit, formState: { errors: logErrors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const { register: regSignup, handleSubmit: handleSignSubmit, formState: { errors: signErrors } } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const { register: regForgot, handleSubmit: handleForgotSubmit, formState: { errors: forgotErrors } } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onLoginSubmit = () => {
    dispatch(login({ role: 'customer' }));
    toast.success('Successfully logged in!');
    navigate('/');
  };

  const onSignupSubmit = () => {
    // Show mock OTP screen
    setShowOtp(true);
    toast.success('Verification code sent! Check your inbox.');
  };

  const onForgotSubmit = () => {
    toast.success('Password reset instructions sent to your email.');
    navigate('/login');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpVal.length === 6) {
      dispatch(login({ role: 'customer' }));
      toast.success('Email verified! Account created successfully.');
      navigate('/');
    } else {
      toast.error('Invalid OTP code. Enter 6 digits.');
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col items-center pt-8 pb-12 select-none">
      {/* Brand Center Header */}
      <Link to="/" className="flex items-baseline font-display mb-6">
        <span className="text-2xl font-extrabold text-amazon-blue">Shop</span>
        <span className="text-2xl font-bold text-amazon-orange">Mart</span>
      </Link>

      {/* Main card box */}
      <div className="w-full max-w-[350px] border border-gray-300 rounded p-6 shadow-sm bg-white text-xs flex flex-col gap-4">
        {showOtp || mode === 'otp' ? (
          /* OTP Form */
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <h1 className="text-2xl font-normal text-gray-900 mb-1">Verify email address</h1>
            <p className="text-gray-600 leading-relaxed">
              To verify your email, we've sent a One-Time Password (OTP) to your inbox. Enter it below to proceed.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-gray-700">Enter OTP Code</label>
              <input
                type="text"
                maxLength={6}
                value={otpVal}
                onChange={(e) => setOtpVal(e.target.value.replace(/\D/g, ''))}
                className="amazon-input text-center text-lg font-bold font-mono tracking-widest"
                placeholder="123456"
                required
              />
            </div>

            <button type="submit" className="amazon-btn-primary py-1.5 font-semibold text-xs shadow-sm">
              Create Account
            </button>

            <div className="border-t pt-3 flex justify-between text-blue-600 font-semibold mt-1">
              <span className="hover:underline cursor-pointer" onClick={() => toast.success('New OTP code dispatched!')}>Resend Code</span>
              <span className="hover:underline cursor-pointer" onClick={() => setShowOtp(false)}>Change Email</span>
            </div>
          </form>
        ) : mode === 'login' ? (
          /* Login Form */
          <form onSubmit={handleLogSubmit(onLoginSubmit)} className="flex flex-col gap-4">
            <h1 className="text-2xl font-normal text-gray-900 mb-1">Sign in</h1>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-700">Email (phone for mobile accounts)</label>
              <input
                type="email"
                {...regLogin('email')}
                className={`amazon-input ${logErrors.email ? 'border-red-500 bg-red-50/20' : ''}`}
                placeholder="email@domain.com"
              />
              {logErrors.email && (
                <span className="text-red-700 font-semibold mt-0.5">{logErrors.email.message as string}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center mb-0.5">
                <label className="font-bold text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-blue-600 hover:text-amazon-orange hover:underline font-semibold text-[11px]">
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                {...regLogin('password')}
                className={`amazon-input ${logErrors.password ? 'border-red-500 bg-red-50/20' : ''}`}
                placeholder="At least 6 characters"
              />
              {logErrors.password && (
                <span className="text-red-700 font-semibold mt-0.5">{logErrors.password.message as string}</span>
              )}
            </div>

            <button type="submit" className="amazon-btn-primary py-1.5 font-semibold text-xs mt-1 shadow-sm">
              Continue
            </button>

            <label className="flex items-center gap-1.5 mt-2 cursor-pointer select-none">
              <input type="checkbox" {...regLogin('rememberMe')} className="accent-amazon-orange h-4 w-4" />
              <span className="text-gray-700 font-semibold">Keep me signed in on this computer</span>
            </label>

            {/* Social logins */}
            <div className="border-t pt-3 flex flex-col gap-2 mt-1">
              <span className="text-center text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Or sign in with</span>
              <button
                type="button"
                onClick={() => onLoginSubmit()}
                className="w-full py-1.5 border border-gray-300 rounded font-semibold text-gray-800 hover:bg-gray-50 cursor-pointer flex items-center justify-center gap-1.5 transition text-[11px]"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-3.5 w-3.5" /> Sign in with Google
              </button>
              <button
                type="button"
                onClick={() => onLoginSubmit()}
                className="w-full py-1.5 border border-gray-300 rounded font-semibold text-gray-800 hover:bg-gray-50 cursor-pointer flex items-center justify-center gap-1.5 transition text-[11px]"
              >
                <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="GitHub" className="h-3.5 w-3.5" /> Sign in with GitHub
              </button>
            </div>

            <div className="border-t pt-3 mt-1 text-gray-600 text-[10px] leading-relaxed">
              By continuing, you agree to ShopMart's Conditions of Use and Privacy Notice.
            </div>
          </form>
        ) : mode === 'register' ? (
          /* Signup Form */
          <form onSubmit={handleSignSubmit(onSignupSubmit)} className="flex flex-col gap-4">
            <h1 className="text-2xl font-normal text-gray-900 mb-1">Create account</h1>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-700">Your name</label>
              <input
                type="text"
                {...regSignup('name')}
                className={`amazon-input ${signErrors.name ? 'border-red-500 bg-red-50/20' : ''}`}
                placeholder="First and last name"
              />
              {signErrors.name && (
                <span className="text-red-700 font-semibold mt-0.5">{signErrors.name.message as string}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-700">Email address</label>
              <input
                type="email"
                {...regSignup('email')}
                className={`amazon-input ${signErrors.email ? 'border-red-500 bg-red-50/20' : ''}`}
                placeholder="email@domain.com"
              />
              {signErrors.email && (
                <span className="text-red-700 font-semibold mt-0.5">{signErrors.email.message as string}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-700">Password</label>
              <input
                type="password"
                {...regSignup('password')}
                className={`amazon-input ${signErrors.password ? 'border-red-500 bg-red-50/20' : ''}`}
                placeholder="At least 6 characters"
              />
              {signErrors.password && (
                <span className="text-red-700 font-semibold mt-0.5">{signErrors.password.message as string}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-700">Re-enter password</label>
              <input
                type="password"
                {...regSignup('confirmPassword')}
                className={`amazon-input ${signErrors.confirmPassword ? 'border-red-500 bg-red-50/20' : ''}`}
              />
              {signErrors.confirmPassword && (
                <span className="text-red-700 font-semibold mt-0.5">{signErrors.confirmPassword.message as string}</span>
              )}
            </div>

            <button type="submit" className="amazon-btn-primary py-1.5 font-semibold text-xs mt-1 shadow-sm">
              Create account
            </button>

            <div className="border-t pt-3 mt-1 text-gray-600 text-[10px] leading-relaxed">
              By creating an account, you agree to ShopMart's Conditions of Use and Privacy Notice.
            </div>
          </form>
        ) : (
          /* Forgot Password */
          <form onSubmit={handleForgotSubmit(onForgotSubmit)} className="flex flex-col gap-4">
            <h1 className="text-2xl font-normal text-gray-900 mb-1">Password assistance</h1>
            <p className="text-gray-600 leading-relaxed">
              Enter the email address associated with your ShopMart account. We will send you a reset link.
            </p>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-700">Email address</label>
              <input
                type="email"
                {...regForgot('email')}
                className={`amazon-input ${forgotErrors.email ? 'border-red-500 bg-red-50/20' : ''}`}
                placeholder="email@domain.com"
              />
              {forgotErrors.email && (
                <span className="text-red-700 font-semibold mt-0.5">{forgotErrors.email.message as string}</span>
              )}
            </div>

            <button type="submit" className="amazon-btn-primary py-1.5 font-semibold text-xs mt-1 shadow-sm">
              Continue
            </button>
          </form>
        )}
      </div>

      {/* Login / Signup swap prompts */}
      {mode === 'login' && !showOtp && (
        <div className="w-full max-w-[350px] flex flex-col gap-3.5 mt-5">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <span className="relative bg-white px-3 text-gray-500 font-bold uppercase tracking-wider text-[9px]">
              New to ShopMart?
            </span>
          </div>
          <Link
            to="/register"
            className="w-full text-center py-1.5 border border-gray-300 rounded font-semibold text-gray-800 hover:bg-gray-50 shadow-sm transition text-xs cursor-pointer bg-gradient-to-b from-[#f7f8fa] to-[#e7e9ec]"
          >
            Create your ShopMart account
          </Link>
        </div>
      )}

      {mode === 'register' && !showOtp && (
        <div className="w-full max-w-[350px] text-center mt-5 text-xs">
          <span>
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-amazon-orange font-bold hover:underline">
              Sign in <ChevronRight size={12} className="inline -mt-0.5" />
            </Link>
          </span>
        </div>
      )}

      {/* Tiny Legal Footer */}
      <div className="mt-12 text-[10px] text-gray-500 flex flex-col gap-2 items-center">
        <div className="flex gap-4">
          <a href="#" className="hover:underline">Conditions of Use</a>
          <a href="#" className="hover:underline">Privacy Notice</a>
          <a href="#" className="hover:underline">Help</a>
        </div>
        <p>&copy; 2026, ShopMart.com, Inc. or its affiliates</p>
      </div>
    </div>
  );
};
