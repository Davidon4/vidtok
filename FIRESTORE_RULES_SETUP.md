# Firestore Security Rules Setup

## Current Issue
You're getting "Missing or insufficient permissions" error when trying to save video metadata to Firestore.

## Quick Fix

### 1. Go to Firebase Console
1. Visit [Firebase Console](https://console.firebase.google.com)
2. Select your project (`vidtok-b2166`)
3. Go to **Firestore Database** → **Rules**

### 2. Update Security Rules
Replace your current rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write videos
    match /videos/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read and write user profiles
    match /users/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 3. Publish Rules
1. Click **Publish** button
2. Wait for the rules to deploy (usually takes a few seconds)

## Alternative: Temporary Open Rules (Development Only)
**⚠️ WARNING: Only use this for development/testing!**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Test the Upload
After updating the rules:
1. Try recording and uploading a video again
2. The Firestore save should now work
3. You should see "Video uploaded successfully!" message

## Production Security Rules
For production, use more restrictive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Videos: authenticated users can read all, write their own
    match /videos/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // User profiles: users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
