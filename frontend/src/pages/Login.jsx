import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Store, Mail, Lock, Eye, EyeOff, Shield, Building2, User, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      showToast(`Welcome back, ${user.name}!`, 'success');

      // Redirect based on role
      if (user.role === 'System Administrator') {
        navigate('/admin/dashboard');
      } else if (user.role === 'Store Owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/stores');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Invalid email address or password.');
    } finally {
      setLoading(false);
    }
  };

  // Demo Persona Fast-Fill Helper
  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
  };

  return (
    <div className="login-page-container">
      <div className="login-split-card">
        {/* Left Side: Brand Showcase & Quick Demo Access */}
        <div className="login-showcase-panel">
          <div className="showcase-content">
            <div className="brand-badge mb-6">
              <Store size={22} className="brand-badge-icon" />
              <span>LocalMarket Enterprise</span>
            </div>

            <h1 className="showcase-title">
              Store Rating & <br />
              <span className="text-emerald-glow">Business Intelligence</span>
            </h1>

            <p className="showcase-description">
              Streamlining local merchant ratings, consumer feedback, and multi-tier enterprise user management with PostgreSQL reliability.
            </p>

            {/* Feature Highlights */}
            <div className="showcase-features-list">
              <div className="feature-item">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span>Role-Based Access Control (Admin, Owner, User)</span>
              </div>
              <div className="feature-item">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span>Enforced Single-Rating Constraint per Store</span>
              </div>
              <div className="feature-item">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span>Real-Time Business Analytics & Review Audits</span>
              </div>
            </div>

            {/* Quick Demo Credentials Panel */}
            <div className="demo-credentials-box mt-8">
              <div className="demo-box-header">
                <span>QUICK DEMO PERSONA LOGIN</span>
              </div>

              <div className="demo-buttons-grid">
                <button
                  type="button"
                  className="demo-persona-btn admin"
                  onClick={() => fillDemoAccount('admin@localmarket.com', 'AdminPass123!')}
                >
                  <Shield size={16} />
                  <div className="demo-btn-text">
                    <span className="demo-btn-role">System Admin</span>
                    <span className="demo-btn-email">admin@localmarket.com</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="demo-persona-btn owner"
                  onClick={() => fillDemoAccount('freshmart.owner@localmarket.com', 'OwnerPass123!')}
                >
                  <Building2 size={16} />
                  <div className="demo-btn-text">
                    <span className="demo-btn-role">Store Owner</span>
                    <span className="demo-btn-email">freshmart.owner@localmarket.com</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="demo-persona-btn user"
                  onClick={() => fillDemoAccount('aarav.sharma.verified@localmarket.com', 'UserPass123!')}
                >
                  <User size={16} />
                  <div className="demo-btn-text">
                    <span className="demo-btn-role">Normal User</span>
                    <span className="demo-btn-email">aarav.sharma.verified@localmarket.com</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="login-form-panel">
          <div className="form-panel-header">
            <h2 className="panel-title">Sign In to Portal</h2>
            <p className="panel-subtitle">Enter your corporate account credentials</p>
          </div>

          {errorMessage && (
            <div className="alert-box danger mb-6">
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            {/* Email Field */}
            <div className="form-group mb-5">
              <label className="custom-label">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon-left" />
                <input
                  type="email"
                  className="custom-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group mb-6">
              <div className="form-label-row">
                <label className="custom-label">Password</label>
              </div>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon-left" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="custom-input pr-10"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn-emerald-lg w-full mb-6" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="spin-loader" /> Authenticating...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Register Link */}
            <div className="auth-footer-text">
              Don't have a user account?{' '}
              <Link to="/register" className="auth-link">
                Register as Customer
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
