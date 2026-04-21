import React from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthForm from '../../components/auth/AuthForm';

const Signup = () => {
  return (
    <AuthLayout>
      <AuthForm type="signup" />
    </AuthLayout>
  );
};

export default Signup;