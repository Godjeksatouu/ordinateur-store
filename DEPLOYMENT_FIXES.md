# Deployment Issues Fixed

This document outlines the fixes applied to resolve the deployment issues encountered on ordinateurstore.ma.

## Issues Fixed

### 1. Image 404 Errors ✅

**Problem**: Images not loading with 404 errors for files like `1755894070098-711260587.png`

**Root Cause**: 
- Next.js image configuration only allowed localhost domains
- Production domain not configured in remotePatterns
- Missing unoptimized flag for better production compatibility

**Solution Applied**:
- Updated `next.config.mjs` and `next.config.js` to include production domain
- Added both HTTP and HTTPS protocols for ordinateurstore.ma
- Enabled `unoptimized: true` for better production deployment compatibility

**Files Modified**:
- `next.config.mjs`
- `next.config.js`

### 2. Admin Login API 401 Unauthorized ✅

**Problem**: Admin login failing with 401 Unauthorized errors

**Root Cause**:
- CORS configuration not properly set for production domain
- Missing environment variables in production
- Insufficient error logging for debugging

**Solution Applied**:
- Enhanced CORS configuration to include production domains
- Added proper HTTP methods and headers
- Improved error logging in authentication endpoint
- Created production environment configuration template

**Files Modified**:
- `backend/server.js` (CORS and authentication logging)
- `.env.production` (created template)

### 3. Facebook Attribution Reporting Warning ✅

**Problem**: Browser warning about Attribution Reporting on Facebook Pixel

**Root Cause**: Outdated Facebook Pixel configuration

**Solution Applied**:
- Updated Facebook Pixel script with enhanced configuration
- Added external_id for better tracking
- Configured autoConfig settings for privacy compliance

**Files Modified**:
- `app/layout.tsx`

## Deployment Checklist

### Environment Variables Setup

1. **Copy and configure environment variables**:
   ```bash
   cp .env.production .env
   ```

2. **Update the following variables in `.env`**:
   - `DB_HOST`: Your database host
   - `DB_USER`: Your database username  
   - `DB_PASSWORD`: Your database password
   - `DB_NAME`: Your database name
   - `JWT_SECRET`: Generate a strong secret (minimum 32 characters)
   - `MAIL_*`: Configure your SMTP settings
   - `FRONTEND_URL`: https://ordinateurstore.ma
   - `NEXT_PUBLIC_API_BASE_URL`: https://ordinateurstore.ma

### Server Configuration

1. **Ensure uploads directory exists and has proper permissions**:
   ```bash
   mkdir -p uploads
   chmod 755 uploads
   ```

2. **Verify backend server is accessible**:
   - Backend should run on port 5000
   - Frontend should run on port 3000
   - Ensure firewall allows these ports

3. **Database Setup**:
   - Import the database schema from `database/store.sql`
   - Ensure database user has proper permissions

### Image Storage Fix

1. **Check existing images in uploads directory**:
   ```bash
   ls -la uploads/
   ```

2. **If images are missing, they need to be re-uploaded through admin panel**

3. **Verify image URLs in database match actual files**

### Testing After Deployment

1. **Test image loading**:
   - Visit product pages
   - Check browser console for 404 errors
   - Verify images display correctly

2. **Test admin login**:
   - Go to `/admin/login`
   - Try logging in with valid credentials
   - Check browser console for API errors

3. **Test Facebook Pixel**:
   - Open browser developer tools
   - Check for Attribution Reporting warnings
   - Verify pixel fires on page views

## Troubleshooting

### If Images Still Don't Load

1. Check if the backend `/uploads` endpoint is accessible:
   ```
   curl https://ordinateurstore.ma/uploads/
   ```

2. Verify file permissions on uploads directory

3. Check if images exist in the uploads folder on server

### If Admin Login Still Fails

1. Check backend logs for detailed error messages
2. Verify JWT_SECRET is set in environment
3. Test database connection
4. Check CORS headers in browser network tab

### If Facebook Pixel Issues Persist

1. Update to the latest Facebook Pixel code from Facebook Business
2. Check Facebook Events Manager for pixel status
3. Consider using Facebook Pixel Helper browser extension for debugging

## Additional Recommendations

1. **Set up SSL certificate** for HTTPS (if not already done)
2. **Configure proper backup** for uploads directory
3. **Set up monitoring** for API endpoints
4. **Implement proper logging** for production debugging
5. **Consider using a CDN** for image delivery
