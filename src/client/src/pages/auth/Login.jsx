import React from "react";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthForm from "../../components/auth/AuthForm";
import "../../styles/auth.css";

const Login = () => {
  return (
    <AuthLayout>
      <AuthForm type="login" />
    </AuthLayout>
  );
};

export default Login;
