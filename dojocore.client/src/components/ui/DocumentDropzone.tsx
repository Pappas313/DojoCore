import React, { useCallback } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { CloudUploadOutlined as CloudUploadOutlinedIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface DocumentDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
}

export const DocumentDropzone: React.FC<DocumentDropzoneProps> = ({ onFilesSelected, maxFiles }) => {
  const theme = useTheme();
  const { t } = useTranslation('auth');

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onFilesSelected(maxFiles ? filesArray.slice(0, maxFiles) : filesArray);
    }
  }, [onFilesSelected, maxFiles]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(maxFiles ? filesArray.slice(0, maxFiles) : filesArray);
    }
  };

  return (
    <Box
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        boxSizing: 'border-box',
        border: `2px dashed ${theme.palette.divider}`,
        borderRadius: 2,
        p: 4,
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: theme.palette.action.hover,
        '&:hover': {
          backgroundColor: theme.palette.action.selected,
          borderColor: theme.palette.primary.main,
        },
        transition: 'all 0.2s ease',
      }}
      component="label"
    >
      <input
        type="file"
        multiple={maxFiles !== 1}
        hidden
        onChange={handleFileInput}
      />
      <CloudUploadOutlinedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
      <Typography variant="body1" color="text.secondary">
        {t('drag_and_drop') || 'Drag and drop files here or click to browse'}
      </Typography>
    </Box>
  );
};
