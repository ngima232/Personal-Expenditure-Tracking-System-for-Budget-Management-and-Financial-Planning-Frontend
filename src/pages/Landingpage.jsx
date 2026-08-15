import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import currencies from '../utils/currencies';
import Select from 'react-select';

import {
  ArrowUpRight,
  Wallet,
  PiggyBank,
  HandCoins,
  TrendingUp,
  Banknote,
  X,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';


/* =========================================================
   LANDING PAGE TRANSACTION TAPE
========================================================= */

const TAPE_ENTRIES = [
  {
    label: 'Rent — August',
    amount: -1450,
    type: 'expense',
  },
  {
    label: 'Salary',
    amount: 3200,
    type: 'income',
  },
  {
    label: 'Groceries — Tesco',
    amount: -64.2,
    type: 'expense',
  },
  {
    label: 'Freelance invoice',
    amount: 480,
    type: 'income',
  },
  {
    label: 'Loan repayment — Priya',
    amount: 150,
    type: 'income',
  },
  {
    label: 'Electricity bill',
    amount: -88.5,
    type: 'expense',
  },
];


/* =========================================================
   FORMAT AMOUNT
========================================================= */

function formatAmount(n) {
  return `${n < 0 ? '−' : '+'}£${Math.abs(n).toFixed(2)}`;
}


/* =========================================================
   LEDGER TAPE
========================================================= */

function LedgerTape() {
  const entries = [...TAPE_ENTRIES, ...TAPE_ENTRIES];

  return (
    <div className="relative overflow-hidden border-t border-white/10 bg-slate-950/60 backdrop-blur-md">

      <div className="tape-track flex w-max gap-8 px-5 py-3">

        {entries.map((e, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 whitespace-nowrap font-mono text-xs"
          >

            <span className="text-slate-400">
              {e.label}
            </span>

            <span
              className={`font-semibold ${
                e.type === 'income'
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {formatAmount(e.amount)}
            </span>

          </div>
        ))}

      </div>

      <style>{`
        .tape-track {
          animation: tape-scroll 32s linear infinite;
        }

        .tape-track:hover {
          animation-play-state: paused;
        }

        @keyframes tape-scroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tape-track {
            animation: none;
          }
        }
      `}</style>

    </div>
  );
}


/* =========================================================
   FEATURES
========================================================= */

const FEATURES = [
  {
    icon: Wallet,
    name: 'Smart Budgets',
  },
  {
    icon: PiggyBank,
    name: 'Savings Goals',
  },
  {
    icon: HandCoins,
    name: 'Informal Loans',
  },
  {
    icon: Banknote,
    name: 'Investments',
  },
  {
    icon: TrendingUp,
    name: 'AI Forecasting',
  },
];


/* =========================================================
   AUTH MODAL
========================================================= */

function AuthModal({
  mode,
  onClose,
  onSwitchMode,
}) {

  const {
    login,
    register,
    forgotPassword,
    resetPassword,
  } = useAuth();

  const navigate = useNavigate();


  /* =======================================================
     LOGIN / REGISTER FORM
  ======================================================= */

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    currency: 'GBP',
  });


  /* =======================================================
     FORGOT PASSWORD FORM
  ======================================================= */

  const [resetForm, setResetForm] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });


  /*
    forgotStep:

    email = user enters email
    reset = user enters OTP + passwords
  */

  const [forgotStep, setForgotStep] = useState('email');


  /* =======================================================
     COMMON STATES
  ======================================================= */

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);


  const isSignUp = mode === 'signup';
  const isSignIn = mode === 'signin';
  const isForgotPassword = mode === 'forgot-password';


  /* =======================================================
     CLEAR MESSAGES
  ======================================================= */

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };


  /* =======================================================
     LOGIN / REGISTER
  ======================================================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    clearMessages();

    setLoading(true);

    try {

      /*
        SIGN UP
      */

      if (isSignUp) {

        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          currency: form.currency,
        });

      }

      /*
        SIGN IN
      */

      else {

        await login({
          email: form.email,
          password: form.password,
        });

      }


      /*
        After successful login/register
      */

      navigate('/dashboard');

    } catch (err) {

      console.error('Authentication error:', err);

      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong. Please try again.'
      );

    } finally {

      setLoading(false);

    }
  };


  /* =======================================================
     OPEN FORGOT PASSWORD
  ======================================================= */

  const openForgotPassword = () => {

    clearMessages();

    /*
      If user already entered their email in login,
      automatically copy it into forgot password.
    */

    setResetForm((previous) => ({
      ...previous,
      email: form.email,
    }));

    setForgotStep('email');

    onSwitchMode('forgot-password');
  };


  /* =======================================================
     SEND OTP
  ======================================================= */

  const handleForgotPassword = async (e) => {

    e.preventDefault();

    clearMessages();


    /*
      Simple email validation
    */

    if (!resetForm.email.trim()) {

      setError('Please enter your email address.');

      return;
    }


    setLoading(true);


    try {

      /*
        Send email to backend.

        Example backend body:

        {
          email: "example@gmail.com"
        }
      */

      const response = await forgotPassword({
        email: resetForm.email.trim(),
      });

   console.log("response--> from forget password",response)
      /*
        Display backend response
      */

      setSuccess(
        response?.message ||
        'OTP has been sent to your email address.'
      );


      /*
        After backend succeeds,
        move user to OTP/password form.
      */

           console.log("setup serehhfjhfjfhfhjfhj",)
      setForgotStep('reset');

    } catch (err) {

      console.error(
        'Forgot password error:',
        err
      );

      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Unable to send OTP. Please try again.'
      );

    } finally {

      setLoading(false);

    }
  };


  /* =======================================================
     RESET PASSWORD
  ======================================================= */

  const handleResetPassword = async (e) => {

    e.preventDefault();

    clearMessages();


    /*
      OTP validation
    */

    if (!resetForm.otp.trim()) {

      setError('Please enter the OTP.');

      return;
    }


    /*
      New password validation
    */

    if (!resetForm.newPassword) {

      setError('Please enter your new password.');

      return;
    }


    if (resetForm.newPassword.length < 8) {

      setError(
        'Password must contain at least 8 characters.'
      );

      return;
    }


    /*
      Confirm password validation
    */

    if (!resetForm.confirmPassword) {

      setError(
        'Please confirm your new password.'
      );

      return;
    }


    if (
      resetForm.newPassword !==
      resetForm.confirmPassword
    ) {

      setError(
        'New password and confirm password do not match.'
      );

      return;
    }


    setLoading(true);


    try {

      /*
        Send reset request to backend

        Expected body:

        {
          email,
          otp,
          password,
          confirmPassword
        }
      */

      const response = await resetPassword({
        email: resetForm.email.trim(),
        otp: resetForm.otp.trim(),
        password: resetForm.newPassword,
      });


      /*
        Clear reset form
      */

      setResetForm({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: '',
      });


      setForgotStep('email');


      /*
        Switch back to login
      */

      onSwitchMode('signin');


      /*
        Show success message in login modal
      */

      setSuccess(
        response?.message ||
        'Password reset successfully. You can now sign in.'
      );

    } catch (err) {

      console.error(
        'Reset password error:',
        err
      );

      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Unable to reset password. Please check your OTP and try again.'
      );

    } finally {

      setLoading(false);

    }
  };


  /* =======================================================
     BACK TO SIGN IN
  ======================================================= */

  const handleBackToLogin = () => {

    clearMessages();

    setForgotStep('email');

    setResetForm({
      email: '',
      otp: '',
      newPassword: '',
      confirmPassword: '',
    });

    onSwitchMode('signin');
  };


  /* =======================================================
     RESEND OTP
  ======================================================= */

  const handleResendOtp = async () => {

    clearMessages();

    setLoading(true);


    try {

      const response = await forgotPassword({
        email: resetForm.email.trim(),
      });


      setSuccess(
        response?.message ||
        'A new OTP has been sent to your email.'
      );

    } catch (err) {

      console.error('Resend OTP error:', err);

      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Unable to resend OTP.'
      );

    } finally {

      setLoading(false);

    }
  };


  /* =======================================================
     TITLE
  ======================================================= */

  const getModalTitle = () => {

    if (isSignUp) {
      return 'Create your account';
    }

    if (isForgotPassword) {

      if (forgotStep === 'email') {
        return 'Forgot password';
      }

      return 'Reset password';
    }

    return 'Welcome back';
  };


  /* =======================================================
     MODAL
  ======================================================= */

  return (

    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md"
      onClick={onClose}
    >

      <div
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-5 flex items-center justify-between">

          <div className="flex items-center gap-2">

            {isForgotPassword && (
              <button
                type="button"
                onClick={handleBackToLogin}
                className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft size={18} />
              </button>
            )}


            <h2 className="font-serif text-xl font-semibold text-white">
              {getModalTitle()}
            </h2>

          </div>


          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>

        </div>


        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (

          <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">

            {error}

          </div>

        )}


        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {success && (

          <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">

            {success}

          </div>

        )}


        {/* =================================================
            FORGOT PASSWORD SECTION
        ================================================= */}

        {isForgotPassword ? (

          <>


            {/* =============================================
                STEP 1 — ENTER EMAIL
            ============================================= */}

            {forgotStep === 'email' && (

              <form
                onSubmit={handleForgotPassword}
                className="space-y-4"
              >

                <p className="text-sm leading-relaxed text-white/50">

                  Enter the email address associated with
                  your account. We will send you a
                  verification OTP to reset your password.

                </p>


                <div>

                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                    Email
                  </label>


                  <input
                    type="email"
                    required
                    autoFocus
                    value={resetForm.email}
                    onChange={(e) =>
                      setResetForm({
                        ...resetForm,
                        email: e.target.value,
                      })
                    }
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />

                </div>


                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {loading
                    ? 'Sending OTP...'
                    : 'Send OTP'}

                </button>

              </form>

            )}


            {/* =============================================
                STEP 2 — OTP AND NEW PASSWORD
            ============================================= */}

            {forgotStep === 'reset' && (

              <form
                onSubmit={handleResetPassword}
                className="space-y-3.5"
              >

                <p className="text-sm leading-relaxed text-white/50">

                  We sent a verification code to

                  <span className="ml-1 font-medium text-white">
                    {resetForm.email}
                  </span>

                  .

                </p>


                {/* OTP */}

                <div>

                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                    Verification OTP
                  </label>


                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    autoFocus
                    maxLength={6}
                    value={resetForm.otp}
                    onChange={(e) => {

                      const value =
                        e.target.value.replace(/\D/g, '');

                      setResetForm({
                        ...resetForm,
                        otp: value,
                      });

                    }}
                    placeholder="Enter 6-digit OTP"
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-center font-mono text-lg tracking-[0.35em] text-white placeholder:text-sm placeholder:tracking-normal placeholder:text-white/30 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />

                </div>


                {/* NEW PASSWORD */}

                <div>

                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                    New Password
                  </label>


                  <input
                    type="password"
                    required
                    minLength={8}
                    value={resetForm.newPassword}
                    onChange={(e) =>
                      setResetForm({
                        ...resetForm,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />

                </div>


                {/* CONFIRM PASSWORD */}

                <div>

                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                    Confirm Password
                  </label>


                  <input
                    type="password"
                    required
                    minLength={8}
                    value={resetForm.confirmPassword}
                    onChange={(e) =>
                      setResetForm({
                        ...resetForm,
                        confirmPassword:
                          e.target.value,
                      })
                    }
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />

                </div>


                {/* RESET BUTTON */}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {loading
                    ? 'Resetting password...'
                    : 'Reset Password'}

                </button>


                {/* RESEND OTP */}

                <div className="text-center">

                  <span className="text-xs text-white/40">
                    Didn't receive the OTP?{' '}
                  </span>


                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleResendOtp}
                    className="text-xs font-medium text-emerald-400 hover:underline disabled:opacity-50"
                  >

                    Resend OTP

                  </button>

                </div>


                {/* CHANGE EMAIL */}

                <div className="text-center">

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {

                      clearMessages();

                      setResetForm({
                        ...resetForm,
                        otp: '',
                        newPassword: '',
                        confirmPassword: '',
                      });

                      setForgotStep('email');

                    }}
                    className="text-xs text-white/40 transition-colors hover:text-white"
                  >

                    Change email address

                  </button>

                </div>

              </form>

            )}


            {/* BACK TO LOGIN */}

            <p className="mt-5 text-center text-sm text-white/50">

              Remember your password?{' '}

              <button
                type="button"
                onClick={handleBackToLogin}
                className="font-medium text-emerald-400 hover:underline"
              >
                Sign in
              </button>

            </p>

          </>

        ) : (

          <>


            {/* =================================================
                SIGN IN / SIGN UP FORM
            ================================================= */}

            <form
              onSubmit={handleSubmit}
              className="space-y-3.5"
            >


              {/* NAME */}

              {isSignUp && (

                <div>

                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                    Name
                  </label>


                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    placeholder="Jane Doe"
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />

                </div>

              )}


              {/* EMAIL */}

              <div>

                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                  Email
                </label>


                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />

              </div>


              {/* PASSWORD */}

              <div>

                <div className="mb-1.5 flex items-center justify-between">

                  <label className="block text-xs font-medium uppercase tracking-wider text-white/50">
                    Password
                  </label>

                </div>


                <input
                  type="password"
                  required
                  minLength={
                    isSignUp
                      ? 8
                      : undefined
                  }
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />

              </div>


              {/* CURRENCY */}

              {isSignUp && (

                <div>

                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                    Base Currency
                  </label>


                  <Select
                    options={currencies}
                    isSearchable
                    placeholder="Select your preferred currency"

                    value={currencies.find(
                      (currency) =>
                        currency.value ===
                        form.currency
                    )}

                    onChange={(selected) =>
                      setForm({
                        ...form,
                        currency:
                          selected?.value || 'GBP',
                      })
                    }

                    styles={{

                      control: (base) => ({
                        ...base,
                        backgroundColor: '#0F172A',
                        borderColor: '#334155',
                        color: '#fff',
                        minHeight: '42px',
                        borderRadius: '0.5rem',
                      }),

                      menu: (base) => ({
                        ...base,
                        backgroundColor: '#0F172A',
                        color: '#fff',
                        borderRadius: '0.5rem',
                        border: '1px solid #334155',
                      }),

                      option: (base, state) => ({
                        ...base,
                        backgroundColor:
                          state.isFocused
                            ? '#1E293B'
                            : '#0F172A',
                        color: '#fff',
                        cursor: 'pointer',
                      }),

                      singleValue: (base) => ({
                        ...base,
                        color: '#fff',
                      }),

                      input: (base) => ({
                        ...base,
                        color: '#fff',
                      }),

                      placeholder: (base) => ({
                        ...base,
                        color: '#94A3B8',
                      }),

                    }}
                  />

                </div>

              )}


              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {loading
                  ? 'Please wait…'
                  : isSignUp
                    ? 'Create account'
                    : 'Sign in'}

              </button>

            </form>


            {/* =================================================
                SWITCH SIGNUP / LOGIN
            ================================================= */}

            <p className="mt-4 text-center text-sm text-white/50">

              {isSignUp
                ? 'Already have an account?'
                : "Don't have an account?"}{' '}


              <button
                type="button"
                onClick={() => {

                  clearMessages();

                  onSwitchMode(
                    isSignUp
                      ? 'signin'
                      : 'signup'
                  );

                }}
                className="font-medium text-emerald-400 hover:underline"
              >

                {isSignUp
                  ? 'Sign in'
                  : 'Sign up'}

              </button>

            </p>
                {/* FORGOT PASSWORD */}

                 <p className="mt-4 text-center text-sm text-white/50">

                  {isSignIn && (

                    <button
                      type="button"
                      onClick={openForgotPassword}
                      className="text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300 hover:underline"
                    >
                      Forgot password?
                    </button>

                  )}
                  </p>

          </>

        )}

      </div>

    </div>
  );
}


/* =========================================================
   LANDING PAGE
========================================================= */

export default function LandingPage() {

  const [authModal, setAuthModal] = useState(null);


  return (

    <div className="h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">


      {/* =====================================================
          GOOGLE FONTS
      ===================================================== */}

      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />

      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
        rel="stylesheet"
      />


      {/* =====================================================
          PAGE
      ===================================================== */}

      <div
        className={`relative flex h-full flex-col transition-[filter] duration-300 ${
          authModal
            ? 'pointer-events-none blur-md'
            : ''
        }`}
      >


        {/* ===================================================
            BACKGROUND
        =================================================== */}

        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
          style={{
            backgroundImage:
              'url(/landing-bg.png)',
          }}
          aria-hidden="true"
        />


        {/* ===================================================
            GLOW OVERLAYS
        =================================================== */}

        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/80 to-emerald-950/70" />

        <div className="pointer-events-none absolute left-1/2 top-1/4 h-[350px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/15 blur-[120px]" />


        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <header className="relative z-10 flex shrink-0 items-center justify-between px-6 py-6 sm:px-12">


          {/* LOGO */}

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-600/20 font-serif font-bold text-emerald-400">

              P

            </div>


            <div className="flex flex-col">

              <span className="font-serif text-xl font-bold tracking-tight text-white">
                PETS
              </span>

              <span className="hidden text-[10px] uppercase tracking-wider text-slate-400 sm:inline">
                Personal Expenditure Tracking
              </span>

            </div>

          </div>


          {/* NAV BUTTONS */}

          <nav className="flex items-center gap-3">

            <button
              onClick={() =>
                setAuthModal('signin')
              }
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >

              Sign in

            </button>


            <button
              onClick={() =>
                setAuthModal('signup')
              }
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/40"
            >

              Get Started

            </button>

          </nav>

        </header>


        {/* ===================================================
            HERO SECTION
        =================================================== */}

        <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">


          {/* BADGE */}

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-300 backdrop-blur-md">

            <Sparkles
              size={13}
              className="text-emerald-400"
            />

            <span>
              Smart Financial Intelligence & Forecasting
            </span>

          </div>


          {/* HEADING */}

          <h1 className="mt-6 max-w-3xl font-serif text-4xl font-semibold tracking-tight text-white sm:text-6xl sm:leading-[1.15]">

            Master your wealth with total clarity &
            predictive forecasting.

          </h1>


          {/* SUBHEADING */}

          <p className="mt-5 max-w-xl text-base text-slate-300/80 sm:text-lg">

            Effortlessly control your income, budgets,
            loans, and investments in your preferred
            currency. Forecast your financial future
            powered by your real transaction trends.

          </p>


          {/* =================================================
              CTA BUTTONS
          ================================================= */}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">


            <button
              onClick={() =>
                setAuthModal('signup')
              }
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-emerald-600/30 transition-all hover:scale-[1.02] hover:bg-emerald-500"
            >

              Start Tracking Free

              <ArrowUpRight size={16} />

            </button>


            <button
              onClick={() =>
                setAuthModal('signin')
              }
              className="rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-md transition-all hover:border-white/25 hover:bg-white/10 hover:text-white"
            >

              Explore Dashboard

            </button>

          </div>


          {/* =================================================
              FEATURES
          ================================================= */}

          <div className="mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-2">

            {FEATURES.map(
              ({
                icon: Icon,
                name,
              }) => (

                <div
                  key={name}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-md transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/10"
                >

                  <Icon
                    size={14}
                    className="text-emerald-400"
                  />

                  <span>
                    {name}
                  </span>

                </div>

              )
            )}

          </div>

        </main>


        {/* ===================================================
            FOOTER / LEDGER TAPE
        =================================================== */}

        <div className="relative z-10 shrink-0">

          <LedgerTape />

        </div>

      </div>


      {/* =====================================================
          AUTH MODAL
      ===================================================== */}

      {authModal && (

        <AuthModal

          mode={authModal}

          onClose={() =>
            setAuthModal(null)
          }

          onSwitchMode={
            setAuthModal
          }

        />

      )}

    </div>
  );
}