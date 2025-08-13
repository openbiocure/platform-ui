import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { registerUser, clearError } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Loader2, Lock, Mail, User, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import { validateEmail, validatePassword, validateConfirmPassword, validateName, validateOrganization } from '@/utils/validation';

export const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    type: 'individual' as 'individual' | 'organization',
    organization: '',
    acceptTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate email
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    // Validate password
    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    // Validate confirm password
    const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    // Validate name
    const nameError = validateName(formData.name);
    if (nameError) errors.name = nameError;

    // Validate organization (if organization type selected)
    if (formData.type === 'organization') {
      const organizationError = validateOrganization(formData.organization);
      if (organizationError) errors.organization = organizationError;
    }

    // Validate terms acceptance
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and conditions';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    dispatch(clearError());
    dispatch(registerUser(formData));
  };

  const getFieldError = (field: string): string | null => {
    return validationErrors[field] || null;
  };

  const hasFieldError = (field: string): boolean => {
    return !!getFieldError(field);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-lg">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
            <img 
              src="/icon.svg" 
              alt="OpenBioCure Logo" 
              className="w-12 h-12"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            OpenBioCure
          </h1>
          <p className="text-gray-600">
            Create your account to get started
          </p>
        </div>

        {/* Registration Form Card */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-center text-gray-900">
              Join OpenBioCure
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Choose your account type and start your journey
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Type Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Account Type
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange('type', 'individual')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      formData.type === 'individual'
                        ? 'border-[#00239C] bg-[#00239C]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <User className={`w-5 h-5 ${
                        formData.type === 'individual' ? 'text-[#00239C]' : 'text-gray-400'
                      }`} />
                      <div>
                        <div className={`font-medium ${
                          formData.type === 'individual' ? 'text-[#00239C]' : 'text-gray-700'
                        }`}>
                          Individual
                        </div>
                        <div className="text-sm text-gray-500">
                          Free trial • Personal use
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleInputChange('type', 'organization')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      formData.type === 'organization'
                        ? 'border-[#00239C] bg-[#00239C]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Building2 className={`w-5 h-5 ${
                        formData.type === 'organization' ? 'text-[#00239C]' : 'text-gray-400'
                      }`} />
                      <div>
                        <div className={`font-medium ${
                          formData.type === 'organization' ? 'text-[#00239C]' : 'text-gray-700'
                        }`}>
                          Organization
                        </div>
                        <div className="text-sm text-gray-500">
                          Team collaboration • Full features
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`pl-10 h-11 ${
                      hasFieldError('name') 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-[#00239C] focus:ring-[#00239C]'
                    }`}
                    required
                  />
                  {hasFieldError('name') && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {getFieldError('name')}
                    </div>
                  )}
                </div>
              </div>

              {/* Organization Field (conditional) */}
              {formData.type === 'organization' && (
                <div className="space-y-2">
                  <Label htmlFor="organization" className="text-sm font-medium text-gray-700">
                    Organization Name
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="organization"
                      type="text"
                      placeholder="Enter your organization name"
                      value={formData.organization}
                      onChange={(e) => handleInputChange('organization', e.target.value)}
                      className={`pl-10 h-11 ${
                        hasFieldError('organization') 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-[#00239C] focus:ring-[#00239C]'
                      }`}
                      required
                    />
                    {hasFieldError('organization') && (
                      <div className="flex items-center mt-1 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('organization')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 h-11 ${
                      hasFieldError('email') 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-[#00239C] focus:ring-[#00239C]'
                    }`}
                    required
                  />
                  {hasFieldError('email') && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {getFieldError('email')}
                    </div>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 pr-10 h-11 ${
                      hasFieldError('password') 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-[#00239C] focus:ring-[#00239C]'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  {hasFieldError('password') && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {getFieldError('password')}
                    </div>
                  )}
                </div>
                
                {/* Password Requirements */}
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className={`w-3 h-3 ${
                      formData.password.length >= 8 ? 'text-green-500' : 'text-gray-300'
                    }`} />
                    <span>At least 8 characters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className={`w-3 h-3 ${
                      /(?=.*[a-z])/.test(formData.password) ? 'text-green-500' : 'text-gray-300'
                    }`} />
                    <span>One lowercase letter</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className={`w-3 h-3 ${
                      /(?=.*[A-Z])/.test(formData.password) ? 'text-green-500' : 'text-gray-300'
                    }`} />
                    <span>One uppercase letter</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className={`w-3 h-3 ${
                      /(?=.*\d)/.test(formData.password) ? 'text-green-500' : 'text-gray-300'
                    }`} />
                    <span>One number</span>
                  </div>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`pl-10 pr-10 h-11 ${
                      hasFieldError('confirmPassword') 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-[#00239C] focus:ring-[#00239C]'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  {hasFieldError('confirmPassword') && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {getFieldError('confirmPassword')}
                    </div>
                  )}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-2">
                <div className="flex items-start space-x-3">
                  <input
                    id="acceptTerms"
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#00239C] border-gray-300 rounded focus:ring-[#00239C]"
                    required
                  />
                  <div className="text-sm text-gray-600">
                    <label htmlFor="acceptTerms" className="cursor-pointer">
                      I agree to the{' '}
                      <Link to="/terms" className="text-[#00A3E0] hover:text-[#00239C] underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-[#00A3E0] hover:text-[#00239C] underline">
                        Privacy Policy
                      </Link>
                    </label>
                    {hasFieldError('acceptTerms') && (
                      <div className="flex items-center mt-1 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('acceptTerms')}
                      </div>
                    )}
                  </div>
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
                disabled={isLoading}
                className="w-full h-11 bg-[#00239C] hover:bg-[#001E62] text-white font-medium transition-colors duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating your account...
                  </>
                ) : (
                  `Create ${formData.type === 'individual' ? 'Trial' : 'Organization'} Account`
                )}
              </Button>
            </form>

            {/* Additional Links */}
            <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-200">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#00A3E0] hover:text-[#00239C] font-medium transition-colors duration-200"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            © 2024 OpenBioCure Platform. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
