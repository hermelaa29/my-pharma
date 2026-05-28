import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Check, X, RefreshCw, Mail, Key, User as UserIcon, Eye, EyeOff, ChevronDown } from 'lucide-react';

// Define the exact regex conditions for the visual checklist
const uppercaseRegex = /[A-Z]/;
const lowercaseRegex = /[a-z]/;
const numberRegex = /[0-9]/;
const specialCharRegex = /[^A-Za-z0-9]/;

// Frontend validation schema mapping backend Zod constraints
const signupValidationSchema = z.object({
  name: z.string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .max(50, { message: 'Name cannot exceed 50 characters.' })
    .trim(),
  email: z.string()
    .email({ message: 'Please enter a valid email address.' })
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters.' })
    .regex(uppercaseRegex, { message: 'Must contain an uppercase letter.' })
    .regex(lowercaseRegex, { message: 'Must contain a lowercase letter.' })
    .regex(numberRegex, { message: 'Must contain a digit.' })
    .regex(specialCharRegex, { message: 'Must contain a special character.' }),
  confirmPassword: z.string(),
  role: z.enum(['ADMIN', 'COWORKER']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormInputs = z.infer<typeof signupValidationSchema>;

/**
 * Signup Page Component.
 * Implements interactive strong validation checklist, roles selection,
 * and high-fidelity messaging warnings about the System's 2-Admin capacity limit.
 */
const Signup: React.FC = () => {
  const { signup, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  // Track submitting status locally
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupFormInputs>({
    resolver: zodResolver(signupValidationSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'COWORKER',
    }
  });

  // Watch fields to render dynamic, interactive feedback checklists
  const watchedPassword = watch('password', '');
  const watchedRole = watch('role', 'COWORKER');

  // Interactive password strength flags
  const [hasLength, setHasLength] = useState(false);
  const [hasUpper, setHasUpper] = useState(false);
  const [hasLower, setHasLower] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecial, setHasSpecial] = useState(false);

  // Re-run checks whenever the password text changes
  useEffect(() => {
    setHasLength(watchedPassword.length >= 8);
    setHasUpper(uppercaseRegex.test(watchedPassword));
    setHasLower(lowercaseRegex.test(watchedPassword));
    setHasNumber(numberRegex.test(watchedPassword));
    setHasSpecial(specialCharRegex.test(watchedPassword));
  }, [watchedPassword]);

  /**
   * Submit handler for Signup form.
   * Calls global AuthContext signup service and navigates user on success.
   */
  const onSubmit = async (data: SignupFormInputs) => {
    setSubmitting(true);
    clearError();
    
    // Call Context signup which enforces the admin checks
    const success = await signup(data);
    
    setSubmitting(false);
    if (success) {
      navigate('/stores');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Background decorations: grid lines and glowing spheres */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#51a22e08_1px,transparent_1px),linear-gradient(to_bottom,#51a22e08_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      <div className="glow-spot top-10 left-1/3 animate-pulse-slow bg-[#51a22e]/10"></div>
      <div className="glow-spot bottom-10 right-10 bg-[#51a22e]/10"></div>

      <div className="w-full max-w-lg z-10 animate-fade-in">
        
        {/* Brand header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-[#5b5b5b] tracking-tight">
            Create <span className="text-[#51a22e]">Account</span>
          </h1>
          <p className="text-[#5b5b5b]/70 text-sm mt-1">PharmaVault Store Management Registration</p>
        </div>

        {/* Glassmorphic Signup Card */}
        <div className="glass-card rounded-2xl p-8 shadow-2xl relative border border-[#51a22e]/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#51a22e] via-[#65c939] to-[#51a22e] rounded-t-2xl"></div>

          {/* SYSTEM ROLE CAPACITY WARNING */}
          {watchedRole === 'ADMIN' && (
            <div className="mb-6 p-4 rounded-lg bg-orange-100/50 border border-orange-300 text-orange-800 text-xs flex gap-3 animate-fade-in">
              <ShieldAlert className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-orange-900 font-semibold">Strict System Policy:</strong>
                For administrative safety, a maximum of <strong>2 Admin accounts</strong> can be registered overall. Any additional attempts are automatically rejected by the database.
              </div>
            </div>
          )}

          {/* Render error banners if active */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-950/30 border border-red-500/30 text-red-300 text-sm flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            
            {/* Split row for Name and Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Full Name field */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#51a22e] uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className={`w-full pl-9 pr-4 py-2 bg-white/50 border rounded-lg text-[#5b5b5b] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#51a22e]/40 focus:border-[#51a22e] transition-all ${
                      errors.name ? 'border-red-500/50' : 'border-gray-300'
                    }`}
                    {...register('name')}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-400 text-[11px] mt-0.5">{errors.name.message}</p>
                )}
              </div>

              {/* Role Selection Field (Shadcn UI style) */}
              <div className="space-y-1 relative">
                <label className="block text-xs font-semibold text-[#51a22e] uppercase tracking-wider">
                  System Role
                </label>
                
                {/* Hidden input for react-hook-form */}
                <input type="hidden" {...register('role')} />
                
                <button
                  type="button"
                  onClick={() => setRoleOpen(!roleOpen)}
                  className={`flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white/50 px-3 py-2.5 text-sm text-[#5b5b5b] focus:outline-none focus:ring-2 focus:ring-[#51a22e]/40 transition-all ${roleOpen ? 'ring-2 ring-[#51a22e]/40 border-[#51a22e]' : ''}`}
                >
                  <span>{watchedRole === 'ADMIN' ? 'Admin (Maximum 2)' : 'Coworker (Staff)'}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </button>

                {roleOpen && (
                  <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-base shadow-md focus:outline-none sm:text-sm animate-fade-in">
                    <div
                      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 hover:text-gray-900 transition-colors ${watchedRole === 'COWORKER' ? 'bg-gray-100' : ''}`}
                      onClick={() => {
                        setValue('role', 'COWORKER', { shouldValidate: true });
                        setRoleOpen(false);
                      }}
                    >
                      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                        {watchedRole === 'COWORKER' && <Check className="h-4 w-4 text-[#51a22e]" />}
                      </span>
                      Coworker (Staff)
                    </div>
                    <div
                      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 hover:text-gray-900 transition-colors ${watchedRole === 'ADMIN' ? 'bg-gray-100' : ''}`}
                      onClick={() => {
                        setValue('role', 'ADMIN', { shouldValidate: true });
                        setRoleOpen(false);
                      }}
                    >
                      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                        {watchedRole === 'ADMIN' && <Check className="h-4 w-4 text-[#51a22e]" />}
                      </span>
                      Admin (Maximum 2)
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#51a22e] uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="john@pharmacy.com"
                  className={`w-full pl-9 pr-4 py-2 bg-white/50 border rounded-lg text-[#5b5b5b] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#51a22e]/40 focus:border-[#51a22e] transition-all ${
                    errors.email ? 'border-red-500/50' : 'border-gray-300'
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-[11px] mt-0.5">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#51a22e] uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-10 py-2 bg-white/50 border rounded-lg text-[#5b5b5b] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#51a22e]/40 focus:border-[#51a22e] transition-all ${
                    errors.password ? 'border-red-500/50' : 'border-gray-300'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-[11px] mt-0.5">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#51a22e] uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-10 py-2 bg-white/50 border rounded-lg text-[#5b5b5b] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#51a22e]/40 focus:border-[#51a22e] transition-all ${
                    errors.confirmPassword ? 'border-red-500/50' : 'border-gray-300'
                  }`}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-[11px] mt-0.5">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* INTERACTIVE STRENGTH CHECKLIST */}
            {watchedPassword.length > 0 && (
              <div className="p-3 bg-white/30 border border-gray-200 rounded-lg space-y-1.5 animate-fade-in">
                <p className="text-[10px] uppercase font-bold text-[#5b5b5b]/70 tracking-wider mb-1">
                  Password Complexity Criteria
                </p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                  
                  {/* Min length */}
                  <div className="flex items-center gap-1.5 text-xs">
                    {hasLength ? (
                      <Check className="w-3.5 h-3.5 text-[#51a22e]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    )}
                    <span className={hasLength ? 'text-[#51a22e]' : 'text-gray-500'}>
                      Min 8 characters
                    </span>
                  </div>

                  {/* Uppercase check */}
                  <div className="flex items-center gap-1.5 text-xs">
                    {hasUpper ? (
                      <Check className="w-3.5 h-3.5 text-[#51a22e]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    )}
                    <span className={hasUpper ? 'text-[#51a22e]' : 'text-gray-500'}>
                      Uppercase letter
                    </span>
                  </div>

                  {/* Lowercase check */}
                  <div className="flex items-center gap-1.5 text-xs">
                    {hasLower ? (
                      <Check className="w-3.5 h-3.5 text-[#51a22e]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    )}
                    <span className={hasLower ? 'text-[#51a22e]' : 'text-gray-500'}>
                      Lowercase letter
                    </span>
                  </div>

                  {/* Digit check */}
                  <div className="flex items-center gap-1.5 text-xs">
                    {hasNumber ? (
                      <Check className="w-3.5 h-3.5 text-[#51a22e]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    )}
                    <span className={hasNumber ? 'text-[#51a22e]' : 'text-gray-500'}>
                      Number (0-9)
                    </span>
                  </div>

                  {/* Special char check */}
                  <div className="flex items-center gap-1.5 text-xs col-span-2">
                    {hasSpecial ? (
                      <Check className="w-3.5 h-3.5 text-[#51a22e]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    )}
                    <span className={hasSpecial ? 'text-[#51a22e]' : 'text-gray-500'}>
                      Special character (!@#$%^&*)
                    </span>
                  </div>

                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-3 py-2.5 px-4 bg-[#51a22e] hover:bg-[#418225] active:scale-[0.98] text-white font-bold rounded-lg shadow-[0_0_20px_rgba(81,162,46,0.2)] hover:shadow-[0_0_25px_rgba(81,162,46,0.3)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                'Register Staff Account'
              )}
            </button>
          </form>

          {/* Links back to login */}
          <div className="mt-6 pt-5 border-t border-gray-200 text-center">
            <p className="text-[#5b5b5b]/70 text-xs">
              Already have an account?{' '}
              <Link
                to="/login"
                onClick={clearError}
                className="text-[#51a22e] hover:text-[#418225] font-semibold underline transition-colors"
              >
                Sign In Here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Signup;
