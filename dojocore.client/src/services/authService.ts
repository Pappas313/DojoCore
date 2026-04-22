import { apiClient } from './apiClient';
import type { LoginPayload, CombinedRegistrationPayload, UserAuthResponse } from '@/types/auth';

export const authService = {
  login: async (payload: LoginPayload): Promise<UserAuthResponse> => {
    const response = await apiClient.post<UserAuthResponse>('/auth/login', payload);
    return response.data;
  },

  register: async (payload: CombinedRegistrationPayload, files: File[]): Promise<UserAuthResponse> => {
    const formData = new FormData();
    
    // Append the payload object as a stringified JSON blob
    formData.append('payload', JSON.stringify(payload));
    
    // Append each file to the 'files' key
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await apiClient.post<UserAuthResponse>('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
