# Cloudinary Setup Guide

## 1. No Additional Packages Required

The Cloudinary integration uses native fetch API and doesn't require additional packages.

## 2. Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Go to your Dashboard to get your credentials

## 3. Get Your Credentials

From your Cloudinary Dashboard, you'll need:
- **Cloud Name**: Found in the Dashboard
- **API Key**: Found in the Dashboard (optional for unsigned uploads)
- **API Secret**: Found in the Dashboard (optional for unsigned uploads)

## 4. Create Upload Preset (REQUIRED)

**This is the most important step!** Without this, uploads will fail with "Upload preset must be whitelisted for unsigned uploads".

1. Go to your [Cloudinary Dashboard](https://cloudinary.com/console)
2. Navigate to **Settings** → **Upload** (in the left sidebar)
3. Scroll down to **Upload presets** section
4. Click **Add upload preset** button
5. Configure the preset:
   - **Preset name**: `ml_default` (must match exactly)
   - **Signing Mode**: `Unsigned` (this is crucial!)
   - **Resource Type**: `Video`
   - **Folder**: `videos` (optional, for organization)
   - **Access Mode**: `Public` (default)
6. Click **Save** button

**Important**: The preset name `ml_default` must match exactly what's in the code!

## 5. Update Your Configuration

Update your `app.json` file with your Cloudinary credentials:

```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME": "your_cloud_name_here",
      "EXPO_PUBLIC_CLOUDINARY_API_KEY": "your_api_key_here",
      "EXPO_PUBLIC_CLOUDINARY_API_SECRET": "your_api_secret_here"
    }
  }
}
```

## 6. Test the Integration

1. Run your app: `npx expo start`
2. Go to the Add screen
3. Record a video
4. Try uploading it

## 7. Features Included

- ✅ **Video Upload**: Direct upload to Cloudinary using native fetch API
- ✅ **Video Thumbnails**: Automatic thumbnail generation with custom timing
- ✅ **Video Optimization**: Automatic quality and format optimization
- ✅ **Video Deletion**: Remove videos from Cloudinary
- ✅ **Folder Organization**: Videos organized by user ID
- ✅ **Responsive Videos**: Different video sizes for different screen sizes
- ✅ **URL Generation**: Clean, optimized URLs using Cloudinary's URL builder
- ✅ **Video Info Parsing**: Extract public ID and cloud name from URLs

## 8. Troubleshooting

### Quick Fix for "Upload preset must be whitelisted" Error
**If you're getting this error right now:**
1. Go to [Cloudinary Dashboard](https://cloudinary.com/console) → Settings → Upload
2. Create a new preset named `ml_default` with "Unsigned" mode
3. Try uploading again - it should work immediately!

### Upload Fails
- Check your upload preset is set to "Unsigned"
- Verify your Cloudinary credentials are correct in `app.json`
- Check your internet connection
- Ensure the upload preset name matches exactly (default: `ml_default`)
- Check console logs for detailed error messages

### Video Not Playing
- Ensure the video URL is accessible
- Check if the video format is supported
- Verify the video was uploaded successfully

### "Upload failed:" Error
- **Most Common Cause**: Upload preset not configured
- Go to Cloudinary Dashboard → Settings → Upload
- Create a new preset named `ml_default` with "Unsigned" mode
- **Alternative**: Change the preset name in `services/cloudinary-service.ts` line 50
- Check that your Cloudinary cloud name is correctly set in `app.json`

## 9. Production Considerations

- Implement proper signature generation for security
- Set up webhooks for upload notifications
- Configure CDN settings for better performance
- Set up video transformations for different devices
- Implement proper error handling and retry logic
