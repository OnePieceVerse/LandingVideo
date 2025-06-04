import COS from 'cos-js-sdk-v5';

// Tencent COS configuration
const cosConfig = {
  SecretId: process.env.NEXT_PUBLIC_COS_SECRET_ID || '',
  SecretKey: process.env.NEXT_PUBLIC_COS_SECRET_KEY || '',
  Bucket: process.env.NEXT_PUBLIC_COS_BUCKET || '',
  Region: process.env.NEXT_PUBLIC_COS_REGION || 'ap-guangzhou',
  SecurityToken: process.env.NEXT_PUBLIC_COS_SECURITY_TOKEN || undefined,
};

// Create COS instance with support for both permanent and temporary credentials
export const cos = new COS({
  SecretId: cosConfig.SecretId,
  SecretKey: cosConfig.SecretKey,
  SecurityToken: cosConfig.SecurityToken,
  // Alternative: Use getAuthorization for temporary credentials (recommended for production)
  // getAuthorization: function (options, callback) {
  //   // Get temporary credentials from your backend service
  //   fetch('/api/sts-token')
  //     .then(response => response.json())
  //     .then(data => {
  //       callback({
  //         TmpSecretId: data.credentials.tmpSecretId,
  //         TmpSecretKey: data.credentials.tmpSecretKey,
  //         SecurityToken: data.credentials.sessionToken,
  //         StartTime: data.startTime,
  //         ExpiredTime: data.expiredTime,
  //       });
  //     })
  //     .catch(err => {
  //       console.error('Error getting STS token:', err);
  //     });
  // }
});

// Upload file to COS
export const uploadFileToCOS = async (
  file: File,
  fileName?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Determine file type and corresponding subdirectory
    const fileType = getFileType(file);
    const subDir = fileType === 'image' ? 'images' :
                   fileType === 'video' ? 'videos' : 'gifs';

    // Generate key with appropriate subdirectory
    const key = fileName || `${subDir}/${Date.now()}-${file.name}`;

    cos.putObject(
      {
        Bucket: cosConfig.Bucket,
        Region: cosConfig.Region,
        Key: key,
        Body: file,
        onProgress: (progressData) => {
          console.log('Upload progress:', JSON.stringify(progressData));
        },
      },
      (err, data) => {
        if (err) {
          console.error('COS upload error:', err);
          reject(err);
        } else {
          console.log('COS upload success:', data);
          // Return the URL of the uploaded file
          const fileUrl = `https://${cosConfig.Bucket}.cos.${cosConfig.Region}.myqcloud.com/${key}`;
          resolve(fileUrl);
        }
      }
    );
  });
};

// Helper function to get file extension
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

// Helper function to determine file type
export const getFileType = (file: File): 'image' | 'video' | 'gif' => {
  if (file.type.startsWith('image/gif')) {
    return 'gif';
  } else if (file.type.startsWith('image/')) {
    return 'image';
  } else if (file.type.startsWith('video/')) {
    return 'video';
  } else {
    return 'image'; // default fallback
  }
};
