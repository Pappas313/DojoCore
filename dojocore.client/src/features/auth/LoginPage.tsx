import React from 'react';
import { useLogin } from '@refinedev/core';
import { useTranslation } from 'react-i18next';
import { AuthWrapper } from '@/components/ui/AuthWrapper';
import { LoginForm } from '@/components/ui/LoginForm';
import type { LoginPayload } from '@/types/auth';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation('auth');
  const { mutate, isLoading } = useLogin<LoginPayload>();

  return (
    <AuthWrapper 
      title={t('welcome_back') || 'Hi, Welcome Back'} 
      subtitle={t('enter_credentials') || 'Enter your credentials to continue'}
    >
      <LoginForm onSubmit={(data) => mutate(data)} isLoading={isLoading} />
    </AuthWrapper>
  );
};
