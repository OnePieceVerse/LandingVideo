# LandingVideo
Transform any landing page to short video

## Setup

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Tencent COS Configuration
# Get these credentials from Tencent Cloud Console: https://console.cloud.tencent.com/cam/capi
NEXT_PUBLIC_COS_SECRET_ID=your_cos_secret_id
NEXT_PUBLIC_COS_SECRET_KEY=your_cos_secret_key
NEXT_PUBLIC_COS_BUCKET=your-bucket-name-appid
NEXT_PUBLIC_COS_REGION=ap-guangzhou
# Optional: Security Token for temporary credentials
# NEXT_PUBLIC_COS_SECURITY_TOKEN=your_security_token
```

### Tencent COS Setup

1. **Create a COS Bucket**:
   - Go to [COS Console](https://console.cloud.tencent.com/cos5/bucket)
   - Create a new bucket
   - Note down the bucket name (format: `bucketname-appid`)
   - Note down the region (e.g., `ap-guangzhou`)

2. **Get API Credentials**:
   - Go to [CAM Console](https://console.cloud.tencent.com/cam/capi)
   - Get your `SecretId` and `SecretKey`

3. **Configure CORS** (Important for web uploads):
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "POST", "PUT", "DELETE", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag", "x-cos-request-id"],
       "MaxAgeSeconds": 300
     }
   ]
   ```

4. **Set Bucket Permissions**:
   - Make sure your bucket allows public read access for uploaded files
   - Configure appropriate write permissions for your credentials

### Installation

```bash
npm install
npm run dev
```

## Features

- Transform landing pages to short videos
- Upload media assets to Tencent Cloud Object Storage
- Manage user assets with Supabase integration
- Real-time asset management with loading states
