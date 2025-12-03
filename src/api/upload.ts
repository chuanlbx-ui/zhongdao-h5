/**
 * 文件上传API
 */

import { apiClient } from './client';
import { ApiResponse, UploadResponse } from '../types';

export const uploadApi = {
  /**
   * 上传单个文件
   */
  uploadFile: (file: File, options?: {
    type?: 'image' | 'video' | 'document';
    category?: string;
    onProgress?: (progress: number) => void;
  }): Promise<ApiResponse<UploadResponse>> => {
    const formData = new FormData();
    formData.append('file', file);

    if (options?.type) {
      formData.append('type', options.type);
    }
    if (options?.category) {
      formData.append('category', options.category);
    }

    return apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (options?.onProgress) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          options.onProgress(progress);
        }
      }
    });
  },

  /**
   * 上传多个文件
   */
  uploadMultipleFiles: (
    files: File[],
    options?: {
      type?: 'image' | 'video' | 'document';
      category?: string;
      onProgress?: (progress: number) => void;
    }
  ): Promise<ApiResponse<UploadResponse[]>> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    if (options?.type) {
      formData.append('type', options.type);
    }
    if (options?.category) {
      formData.append('category', options.category);
    }

    return apiClient.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (options?.onProgress) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          options.onProgress(progress);
        }
      }
    });
  },

  /**
   * 获取上传凭证（用于直接上传到云存储）
   */
  getUploadToken: (filename: string, fileType: string): Promise<ApiResponse<{
    token: string;
    uploadUrl: string;
    fileUrl: string;
    expireTime: number;
  }>> => {
    return apiClient.post('/upload/token', {
      filename,
      fileType
    });
  },

  /**
   * 确认上传完成
   */
  confirmUpload: (token: string, fileUrl: string): Promise<ApiResponse> => {
    return apiClient.post('/upload/confirm', {
      token,
      fileUrl
    });
  },

  /**
   * 删除已上传的文件
   */
  deleteFile: (fileUrl: string): Promise<ApiResponse> => {
    return apiClient.delete('/upload/file', {
      data: { fileUrl }
    });
  }
};