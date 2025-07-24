# AWS S3 Setup for Image Storage

## Why S3?
Cloud hosting platforms like Render have ephemeral file systems that get cleared on restarts. AWS S3 provides persistent cloud storage for your images.

## Setup Steps:

### 1. Create AWS Account
- Go to [AWS Console](https://aws.amazon.com/)
- Create a free account (12 months free tier)

### 2. Create S3 Bucket
1. Go to S3 in AWS Console
2. Click "Create bucket"
3. Name: `avery-website-images` (or your preferred name)
4. Region: Choose closest to you (e.g., `us-east-1`)
5. Uncheck "Block all public access" (we need public read access)
6. Click "Create bucket"

### 3. Configure Bucket for Public Access
1. Select your bucket
2. Go to "Permissions" tab
3. Add this bucket policy:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::avery-website-images/*"
        }
    ]
}
```

### 4. Create IAM User
1. Go to IAM in AWS Console
2. Click "Users" → "Add user"
3. Name: `avery-website-s3`
4. Select "Programmatic access"
5. Attach policy: `AmazonS3FullAccess`
6. Save the Access Key ID and Secret Access Key

### 5. Add Environment Variables to Render
In your Render dashboard, add these environment variables:
- `AWS_ACCESS_KEY_ID`: Your access key
- `AWS_SECRET_ACCESS_KEY`: Your secret key
- `AWS_REGION`: Your bucket region (e.g., `us-east-1`)
- `AWS_S3_BUCKET`: Your bucket name (e.g., `avery-website-images`)

## Alternative: Use Cloudinary (Easier)
If AWS S3 seems complex, you can use Cloudinary instead:

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name, API key, and API secret
3. Replace the S3 code with Cloudinary integration

## Benefits:
- ✅ Images persist across server restarts
- ✅ Global CDN for fast loading
- ✅ Scalable storage
- ✅ No server storage limits 