import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import { customerAPI } from '../services/api';

const Register = () => {
  const { login } = React.useContext(UserContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Please confirm your password';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const user = await customerAPI.register({
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber
      });
      login(user);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ general: error.error || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">
            <div className="logo-icon">VBS</div>
            <span>Virtual Banking</span>
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join Virtual Banking today</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {errors.general && <div className="error-message mb-3 text-center">{errors.general}</div>}
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input name="firstName" value={formData.firstName} onChange={handleChange} className={`form-input ${errors.firstName ? 'error' : ''}`} placeholder="Enter first name" />
              {errors.firstName && <div className="error-message">{errors.firstName}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input name="lastName" value={formData.lastName} onChange={handleChange} className={`form-input ${errors.lastName ? 'error' : ''}`} placeholder="Enter last name" />
              {errors.lastName && <div className="error-message">{errors.lastName}</div>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input name="username" value={formData.username} onChange={handleChange} className={`form-input ${errors.username ? 'error' : ''}`} placeholder="Choose a username" />
            {errors.username && <div className="error-message">{errors.username}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className={`form-input ${errors.email ? 'error' : ''}`} placeholder="Enter email address" />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={`form-input ${errors.phoneNumber ? 'error' : ''}`} placeholder="Enter phone number" />
            {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className={`form-input ${errors.password ? 'error' : ''}`} placeholder="Create a password" />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`form-input ${errors.confirmPassword ? 'error' : ''}`} placeholder="Confirm password" />
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
          </div>
          <button type="submit" className="btn btn-primary btn-large w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login" className="auth-link">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;


