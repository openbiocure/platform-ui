import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, clearError } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Loader2, Lock, Mail, FlaskConical, Cpu, BarChart3 } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    dispatch(clearError());
    dispatch(loginUser({ email, password }));
    // Navigation will be handled by the App component
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-opencure-blue/10 via-opencure-cyan/5 to-opencure-orange/5 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-4 shadow-2xl shadow-opencure-blue/25">
            <img 
              src="/icon.svg" 
              alt="OpenBioCure Logo" 
              className="w-16 h-16"
            />
          </div>
          <h1 className="text-4xl font-bold text-opencure-blue mb-2 font-montserrat">
            OpenBioCure
          </h1>
          <p className="text-opencure-dark-blue/80 font-medium">
            AI-Powered Research Platform
          </p>
          <p className="text-gray-600 text-sm mt-1">
            Sign in to your account
          </p>
        </div>

        {/* Login Form Card */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm border-t-4 border-opencure-orange">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-center text-opencure-blue font-montserrat">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center text-opencure-dark-blue/70">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-opencure-dark-blue">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-opencure-blue/60" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 border-gray-300 focus:border-opencure-blue focus:ring-opencure-blue/20 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-opencure-dark-blue">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-opencure-blue/60" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 border-gray-300 focus:border-opencure-blue focus:ring-opencure-blue/20 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-opencure-blue/60 hover:text-opencure-blue transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full h-11 bg-gradient-to-r from-opencure-blue to-opencure-dark-blue hover:from-opencure-dark-blue hover:to-opencure-blue text-white font-medium transition-all duration-300 shadow-lg shadow-opencure-blue/25 hover:shadow-xl hover:shadow-opencure-blue/30 transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            {/* Additional Links */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-opencure-cyan hover:text-opencure-blue transition-colors duration-200 font-medium"
                >
                  Forgot your password?
                </Link>
              </div>
              
              <div className="text-center text-sm text-opencure-dark-blue/70">
                Don't have an account?{' '}
                <Link
                  to="/sign-up"
                  className="text-sm text-opencure-cyan hover:text-opencure-blue font-medium transition-colors duration-200"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-opencure-dark-blue/60">
            © 2024 OpenBioCure Platform. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
