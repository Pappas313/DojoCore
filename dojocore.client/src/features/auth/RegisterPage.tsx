import React from 'react';
import { useRegister } from '@refinedev/core';
import { useTranslation } from 'react-i18next';
import { AuthWrapper } from '@/components/ui/AuthWrapper';
import { RegisterForm } from '@/components/ui/RegisterForm';
import type { CombinedRegistrationPayload } from '@/types/auth';

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation('auth');
  const { mutate, isLoading } = useRegister<{ payload: CombinedRegistrationPayload; files: File[] }>();

  const handleRegistration = (data: CombinedRegistrationPayload, files: File[]) => {
    mutate({ payload: data, files });
  };

  return (
    <AuthWrapper 
      title={t('sign_up_title')} 
      subtitle={t('enter_details') || 'Enter your details to create an account'}
      maxWidth={800}
    >
      <RegisterForm onSubmit={handleRegistration} isLoading={isLoading} />
    </AuthWrapper>
  );
};
