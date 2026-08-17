import React, { useState } from 'react';
import { Store, Shield, User, Lock, Mail, MapPin, Eye, EyeOff, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { validateName, validateEmail, validatePassword, validateAddress } from '../utils/validators';

export default function LoginPage({ onLogin, onSignup, users }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration Specific Fields
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  // Validation Error State
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  // Handle Quick Demo Login
  const handleQuickLogin = (targetEmail) => {
    const targetUser = users.find((u) => u.email === targetEmail);
    if (targetUser) {
      onLogin(targetUser.email, targetUser.password);
    }
  };

  // Submit Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    const newErrors = {};

    const emailErr = validateEmail(email);
    const pwdErr = validatePassword(password);

    if (emailErr) newErrors.email = emailErr;
    if (pwdErr) newErrors.password = pwdErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = onLogin(email, password);
    if (!result.success) {
      setFormError(result.message);
    }
  };

  // Submit Registration
  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    const newErrors = {};

    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const pwdErr = validatePassword(password);
    const addrErr = validateAddress(address);

    if (nameErr) newErrors.name = nameErr;
    if (emailErr) newErrors.email = emailErr;
    if (pwdErr) newErrors.password = pwdErr;
    if (addrErr) newErrors.address = addrErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = onSignup({
      name,
      email,
      password,
      address,
      role: 'Normal User'
    });

    if (!result.success) {
      setFormError(result.message);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Top Header Hero */}
      <div className="auth-header-hero">
        <div className="auth-hero-badge">
          <Sparkles size={15} /> Local Market Enterprise Portal
        </div>
        <h1 className="auth-hero-title">Welcome to LocalMarket</h1>
        <p className="auth-hero-subtitle">
          Connect local businesses with community feedback. Search stores, submit verified reviews, or manage platform operations.
        </p>
      </div>

      {/* Split Grid */}
      <div className="auth-split-grid">
        {/* Left Side: Persona Cards for Quick Access */}
        <div className="persona-panel-card">
          <div className="persona-panel-header">
            <h3>Select Persona for Instant Demo Access</h3>
            <p>Test the platform instantly with pre-configured roles below:</p>
          </div>

          <div className="persona-cards-list">
            {/* System Admin */}
            <div className="persona-item-card admin">
              <div className="persona-card-top">
                <div className="persona-card-identity">
                  <div className="persona-icon-avatar admin">
                    <Shield size={20} />
                  </div>
                  <div className="persona-titles">
                    <h4>System Administrator</h4>
                    <span>admin@localmarket.com</span>
                  </div>
                </div>
                <span className="role-pill admin">Full Access</span>
              </div>
              <p className="persona-summary-text">
                Full platform oversight: View system stats, create new stores and users, and audit all ratings across the network.
              </p>
              <button
                type="button"
                className="persona-quick-login-btn admin"
                onClick={() => handleQuickLogin('admin@localmarket.com')}
              >
                Log In as Administrator <ArrowRight size={14} />
              </button>
            </div>

            {/* Store Owner */}
            <div className="persona-item-card owner">
              <div className="persona-card-top">
                <div className="persona-card-identity">
                  <div className="persona-icon-avatar owner">
                    <Store size={20} />
                  </div>
                  <div className="persona-titles">
                    <h4>Store Owner (FreshMart)</h4>
                    <span>freshmart.owner@localmarket.com</span>
                  </div>
                </div>
                <span className="role-pill owner">Business Owner</span>
              </div>
              <p className="persona-summary-text">
                Dedicated business dashboard: Monitor store ratings, average scores, and detailed customer reviews.
              </p>
              <button
                type="button"
                className="persona-quick-login-btn owner"
                onClick={() => handleQuickLogin('freshmart.owner@localmarket.com')}
              >
                Log In as Store Owner <ArrowRight size={14} />
              </button>
            </div>

            {/* Normal User */}
            <div className="persona-item-card user">
              <div className="persona-card-top">
                <div className="persona-card-identity">
                  <div className="persona-icon-avatar user">
                    <User size={20} />
                  </div>
                  <div className="persona-titles">
                    <h4>Normal User (Alexander)</h4>
                    <span>alexander.pierce.verified@localmarket.com</span>
                  </div>
                </div>
                <span className="role-pill user">Verified Reviewer</span>
              </div>
              <p className="persona-summary-text">
                Customer portal: Browse store directory, submit 1 to 5 star ratings, and update your personal reviews.
              </p>
              <button
                type="button"
                className="persona-quick-login-btn user"
                onClick={() => handleQuickLogin('alexander.pierce.verified@localmarket.com')}
              >
                Log In as Customer <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="auth-form-card">
          <div className="auth-nav-tabs">
            <button
              type="button"
              className={`auth-tab-trigger ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('login');
                setErrors({});
                setFormError('');
              }}
            >
              Sign In to Account
            </button>
            <button
              type="button"
              className={`auth-tab-trigger ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('register');
                setErrors({});
                setFormError('');
              }}
            >
              Register New User
            </button>
          </div>

          <div className="auth-form-body">
            {formError && (
              <div className="alert-box danger mb-4">
                <span>{formError}</span>
              </div>
            )}

            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group-custom">
                  <label htmlFor="login-email">Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={18} className="input-icon-left" />
                    <input
                      id="login-email"
                      type="email"
                      className={`custom-input ${errors.email ? 'invalid' : ''}`}
                      placeholder="e.g. user@localmarket.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                      }}
                      required
                    />
                  </div>
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>

                <div className="form-group-custom">
                  <label htmlFor="login-password">Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon-left" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      className={`custom-input ${errors.password ? 'invalid' : ''}`}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                      }}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <span className="field-error">{errors.password}</span>}
                </div>

                <button type="submit" className="btn-submit-primary mt-6">
                  Sign In <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignupSubmit}>
                {/* Requirements Indicator */}
                <div className="spec-requirements-box">
                  <h5>Input Specifications (PDF Compliance):</h5>
                  <ul>
                    <li><CheckCircle2 size={13} color="#10b981" /> Full Name: 20 to 60 characters</li>
                    <li><CheckCircle2 size={13} color="#10b981" /> Password: 8 to 16 characters (1 Uppercase & 1 Special char)</li>
                    <li><CheckCircle2 size={13} color="#10b981" /> Address: Max 400 characters</li>
                  </ul>
                </div>

                <div className="form-group-custom">
                  <label htmlFor="reg-name">Full Name ({name.length}/60)</label>
                  <div className="input-wrapper">
                    <User size={18} className="input-icon-left" />
                    <input
                      id="reg-name"
                      type="text"
                      className={`custom-input ${errors.name ? 'invalid' : ''}`}
                      placeholder="e.g. Alexander Pierce Verified User"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                      }}
                      required
                    />
                  </div>
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>

                <div className="form-group-custom">
                  <label htmlFor="reg-email">Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={18} className="input-icon-left" />
                    <input
                      id="reg-email"
                      type="email"
                      className={`custom-input ${errors.email ? 'invalid' : ''}`}
                      placeholder="e.g. newuser@domain.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                      }}
                      required
                    />
                  </div>
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>

                <div className="form-group-custom">
                  <label htmlFor="reg-password">Password ({password.length}/16)</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon-left" />
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      className={`custom-input ${errors.password ? 'invalid' : ''}`}
                      placeholder="e.g. SecurePass123!"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                      }}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <span className="field-error">{errors.password}</span>}
                </div>

                <div className="form-group-custom">
                  <label htmlFor="reg-address">Address ({address.length}/400)</label>
                  <div className="input-wrapper">
                    <MapPin size={18} className="input-icon-left" />
                    <input
                      id="reg-address"
                      type="text"
                      className={`custom-input ${errors.address ? 'invalid' : ''}`}
                      placeholder="e.g. 100 Market Street, San Francisco, CA 94105"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (errors.address) setErrors((prev) => ({ ...prev, address: null }));
                      }}
                      required
                    />
                  </div>
                  {errors.address && <span className="field-error">{errors.address}</span>}
                </div>

                <button type="submit" className="btn-submit-primary mt-6">
                  Complete Registration <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
