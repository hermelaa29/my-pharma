import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, Mail, RefreshCw, Activity, Eye, EyeOff } from 'lucide-react';

// Form input types validation schema matching the backend structure
const loginValidationSchema = z.object({
  email: z.string()
    .email({ message: 'Please enter a valid email address.' })
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(1, { message: 'Password is required to authenticate.' }),
});

type LoginFormInputs = z.infer<typeof loginValidationSchema>;

/**
 * Login Page Component.
 * Implements React Hook Form with Zod schema parsing.
 * Features a custom-styled, glowing glassmorphic interface built using Tailwind CSS v4.
 */
const Login: React.FC = () => {
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Track form submission states locally
  const [submitting, setSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  // Initialize react-hook-form and bind the Zod schema resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginValidationSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  // Calculate redirect destination
  const from = location.state?.from?.pathname || '/stores';

  /**
   * Submit handler for login credentials.
   * Leverages global AuthContext login and navigates user on success.
   */
  const onSubmit = async (data: LoginFormInputs) => {
    setSubmitting(true);
    clearError();
    
    // Call Context login and wait for network outcome
    const success = await login(data);
    
    setSubmitting(false);
    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Background decorations: grid lines and blurred glowing spheres */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#51a22e08_1px,transparent_1px),linear-gradient(to_bottom,#51a22e08_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      <div className="glow-spot top-1/4 left-1/4 animate-pulse-slow bg-[#51a22e]/10"></div>
      <div className="glow-spot bottom-10 right-1/4 bg-[#51a22e]/10"></div>

      <div className="w-full max-w-md z-10 animate-fade-in">
        
        {/* Visual Pharmacy Brand header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#51a22e]/10 border border-[#51a22e]/30 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(81,162,46,0.15)]">
            <Activity className="w-8 h-8 text-[#51a22e]" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#5b5b5b] tracking-tight">
            Pharma<span className="text-[#51a22e]">Vault</span>
          </h1>
          <p className="text-[#5b5b5b]/70 text-sm mt-1">Pharmacy Store Management System</p>
        </div>

        {/* Glassmorphic Login Card */}
        <div className="glass-card rounded-2xl p-8 shadow-2xl relative border border-[#51a22e]/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#51a22e] via-[#65c939] to-[#51a22e] rounded-t-2xl"></div>
          
          <h2 className="text-xl font-bold text-[#5b5b5b] mb-6">Welcome Back</h2>

          {/* Render error banners if active */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-950/30 border border-red-500/30 text-red-300 text-sm flex items-start gap-3">
              <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form container */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#51a22e] uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="name@pharmacy.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white/50 border rounded-lg text-[#5b5b5b] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#51a22e]/40 focus:border-[#51a22e] transition-all duration-200 ${
                    errors.email ? 'border-red-500/50 focus:ring-red-500/20' : 'border-gray-300'
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#51a22e] uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 bg-white/50 border rounded-lg text-[#5b5b5b] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#51a22e]/40 focus:border-[#51a22e] transition-all duration-200 ${
                    errors.password ? 'border-red-500/50 focus:ring-red-500/20' : 'border-gray-300'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 bg-[#51a22e] hover:bg-[#418225] active:scale-[0.98] text-white font-bold rounded-lg shadow-[0_0_20px_rgba(81,162,46,0.2)] hover:shadow-[0_0_25px_rgba(81,162,46,0.3)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                'Sign In Securely'
              )}
            </button>
          </form>

          {/* Form redirects footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-[#5b5b5b]/70 text-sm">
              New employee registration?{' '}
              <Link
                to="/signup"
                onClick={clearError}
                className="text-[#51a22e] hover:text-[#418225] font-semibold underline transition-colors"
              >
                Sign Up Here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
