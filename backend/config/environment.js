require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  env: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173'),
  
  db: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'hospital_db',
    connectionLimit: 10,
    driver: process.env.DB_DRIVER || 'auto'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'super_secure_hospital_jwt_secret_production_ready_key_2026!',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieSecure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
    cookieSameSite: process.env.COOKIE_SAME_SITE || 'lax'
  },
  
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/auth/oauth/google/callback` : 'http://localhost:5000/api/auth/oauth/google/callback')
  },
  
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.EMAIL_FROM || '"St. Jude Hospital System" <no-reply@stjudehospital.org>'
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  
  ai: {
    apiKey: process.env.AI_API_KEY || process.env.GEMINI_API_KEY || ''
  }
};

module.exports = config;
