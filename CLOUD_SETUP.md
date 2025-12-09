# Cloud Backup Setup Guide

## Google Drive Integration

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Drive API

### 2. Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Add authorized redirect URI: `http://localhost:3000`
5. Copy the **Client ID**

### 3. Set Environment Variable
**Windows:**
```cmd
setx GOOGLE_CLIENT_ID "your-client-id-here"
```

**Linux/Mac:**
```bash
export GOOGLE_CLIENT_ID="your-client-id-here"
```

### 4. Restart Backend
Restart your Spring Boot application to load the environment variable.

### 5. Test Integration
1. Go to Export page
2. Click "Connect" on Google Drive card
3. Authorize the application
4. Your data will be backed up to Google Drive

## Dropbox Integration (Coming Soon)
Follow similar OAuth setup with Dropbox API.

## OneDrive Integration (Coming Soon)
Follow similar OAuth setup with Microsoft Graph API.
