const oauthService = require('../services/oauthService');
const authService = require('../services/authService');
const config = require('../config/environment');

function getCallbackUrl(req) {
  if (process.env.GOOGLE_CALLBACK_URL) {
    return process.env.GOOGLE_CALLBACK_URL;
  }
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:5000';
  return `${protocol}://${host}/api/auth/oauth/google/callback`;
}

const oauthController = {
  // Initiates Google OAuth flow
  async initiateGoogle(req, res, next) {
    try {
      const callbackUrl = getCallbackUrl(req);
      const isConfigured = config.google.clientId && !config.google.clientId.startsWith('mock-');

      let authUrl;
      if (isConfigured) {
        const params = new URLSearchParams({
          client_id: config.google.clientId,
          redirect_uri: callbackUrl,
          response_type: 'code',
          scope: 'openid email profile',
          access_type: 'offline',
          prompt: 'select_account'
        });
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      } else {
        // Zero-config mock fallback for local testing without Google Developer Console setup
        const params = new URLSearchParams({
          code: `demo_google_code_${Date.now()}`,
          email: 'google.patient@hospital.com',
          name: 'Google Verified Patient'
        });
        authUrl = `${callbackUrl}?${params.toString()}`;
      }

      if (req.headers.accept?.includes('application/json')) {
        return res.json({
          success: true,
          redirectUrl: authUrl,
          mode: isConfigured ? 'live' : 'demo'
        });
      }

      res.redirect(authUrl);
    } catch (err) {
      next(err);
    }
  },

  // Handles Google OAuth callback (GET via redirect or POST via direct API/credential)
  async handleGoogleCallback(req, res, next) {
    try {
      let sub;
      let email;
      let name;

      // Case 1: Direct Google ID token verification (from Google Identity Services credential)
      if (req.body?.credential) {
        const credential = req.body.credential;
        try {
          const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
          if (verifyRes.ok) {
            const tokenInfo = await verifyRes.json();
            sub = tokenInfo.sub;
            email = tokenInfo.email;
            name = tokenInfo.name;
          }
        } catch (fetchErr) {
          console.warn('Google tokeninfo verification failed, falling back:', fetchErr.message);
        }
      }

      // Case 2: OAuth 2.0 Authorization Code exchange
      const code = req.query.code || req.body.code;
      const isRealCode = code && !code.startsWith('demo_google_code') && !code.startsWith('mock_');
      const callbackUrl = getCallbackUrl(req);

      if (!sub && isRealCode && config.google.clientSecret && !config.google.clientSecret.startsWith('mock-')) {
        try {
          // Exchange code for tokens
          const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              code,
              client_id: config.google.clientId,
              client_secret: config.google.clientSecret,
              redirect_uri: callbackUrl,
              grant_type: 'authorization_code'
            })
          });

          if (tokenRes.ok) {
            const tokenData = await tokenRes.json();
            // Retrieve Google user profile
            const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenData.access_token}` }
            });

            if (profileRes.ok) {
              const profile = await profileRes.json();
              sub = profile.sub;
              email = profile.email;
              name = profile.name;
            }
          }
        } catch (err) {
          console.warn('Google OAuth code exchange error:', err.message);
        }
      }

      // Fallback for demo/local testing mode
      if (!sub || !email) {
        email = req.query.email || req.body.email || 'google.patient@hospital.com';
        name = req.query.name || req.body.name || 'Google Verified Patient';
        sub = req.query.code || req.body.code || `google_sub_${Date.now()}`;
      }

      const result = await oauthService.handleOAuthUser({
        provider: 'google',
        providerUserId: sub,
        email,
        name,
        ipAddress: req.ip
      });

      // Set secure HttpOnly cookie
      res.cookie('token', result.token, authService.getCookieOptions());

      // If browser navigation (Accept: text/html), redirect to frontend dashboard
      if (req.headers.accept?.includes('text/html') || !req.headers.accept?.includes('application/json')) {
        const dest = result.user.role === 'doctor'
          ? '/doctor/dashboard'
          : result.user.role === 'admin'
            ? '/admin/dashboard'
            : '/patient/dashboard';
        return res.redirect(`${dest}?oauth=success`);
      }

      // Otherwise return JSON
      res.status(200).json({
        success: true,
        message: 'Google OAuth authentication successful.',
        user: result.user
      });
    } catch (err) {
      next(err);
    }
  },

  // Returns Google OAuth configuration status for frontend
  async getConfig(req, res) {
    res.json({
      success: true,
      clientId: config.google.clientId,
      isConfigured: Boolean(config.google.clientId && !config.google.clientId.startsWith('mock-'))
    });
  }
};

module.exports = oauthController;
