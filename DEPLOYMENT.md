# Deployment Guide

This guide provides step-by-step instructions for deploying the Seedbringer Rhythmind Interface to production.

## Pre-Deployment Checklist

- [ ] Google OAuth 2.0 credentials configured
- [ ] Production domain/server ready
- [ ] HTTPS/SSL certificates available
- [ ] Environment variables prepared
- [ ] Authorized email list finalized
- [ ] Backup strategy in place

## Deployment Options

### Option 1: Traditional Server (VPS/Dedicated)

#### Requirements
- Ubuntu 20.04+ or similar Linux distribution
- Node.js v14+
- nginx or Apache for reverse proxy
- SSL certificate (Let's Encrypt recommended)

#### Steps

1. **Update system:**
   ```bash
   sudo apt update
   sudo apt upgrade -y
   ```

2. **Install Node.js:**
   ```bash
   # Download the setup script
   curl -fsSL https://deb.nodesource.com/setup_20.x -o nodesource_setup.sh
   # Review the script (optional but recommended)
   cat nodesource_setup.sh
   # Run the script
   sudo -E bash nodesource_setup.sh
   sudo apt install -y nodejs
   ```

3. **Install nginx:**
   ```bash
   sudo apt install -y nginx
   ```

4. **Clone repository:**
   ```bash
   cd /var/www
   sudo git clone https://github.com/hannesmitterer/Seedbringer-rhythmind-interface.git
   cd Seedbringer-rhythmind-interface
   sudo npm install --production
   ```

5. **Configure environment:**
   ```bash
   sudo cp .env.example .env
   sudo nano .env
   ```
   
   Update with production values:
   ```env
   PORT=3000
   NODE_ENV=production
   GOOGLE_CLIENT_ID=your_production_client_id
   GOOGLE_CLIENT_SECRET=your_production_client_secret
   GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
   SESSION_SECRET=your_secure_random_secret
   # Configure authorized email addresses for your deployment
   AUTHORIZED_EMAILS=user1@gmail.com,user2@gmail.com,user3@gmail.com
   ```

6. **Install PM2:**
   ```bash
   sudo npm install -g pm2
   ```

7. **Start application:**
   ```bash
   pm2 start server.js --name seedbringer-interface
   pm2 save
   pm2 startup
   ```

8. **Configure nginx:**
   ```bash
   sudo nano /etc/nginx/sites-available/seedbringer
   ```
   
   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

9. **Enable site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/seedbringer /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

10. **Setup SSL with Let's Encrypt:**
    ```bash
    sudo apt install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d yourdomain.com
    ```

### Option 2: Heroku

#### Steps

1. **Install Heroku CLI:**
   ```bash
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Login to Heroku:**
   ```bash
   heroku login
   ```

3. **Create app:**
   ```bash
   heroku create seedbringer-interface
   ```

4. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set GOOGLE_CLIENT_ID=your_client_id
   heroku config:set GOOGLE_CLIENT_SECRET=your_client_secret
   heroku config:set GOOGLE_REDIRECT_URI=https://seedbringer-interface.herokuapp.com/auth/google/callback
   heroku config:set SESSION_SECRET=$(openssl rand -hex 32)
   # Set authorized emails - replace with actual authorized accounts
   heroku config:set AUTHORIZED_EMAILS=user1@gmail.com,user2@gmail.com,user3@gmail.com
   ```

5. **Create Procfile:**
   ```bash
   echo "web: node server.js" > Procfile
   ```

6. **Deploy:**
   ```bash
   git add Procfile
   git commit -m "Add Procfile for Heroku"
   git push heroku main
   ```

7. **Update Google OAuth redirect URI:**
   - Go to Google Cloud Console
   - Add `https://seedbringer-interface.herokuapp.com/auth/google/callback`

### Option 3: Docker

#### Dockerfile

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

#### docker-compose.yml

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - GOOGLE_REDIRECT_URI=${GOOGLE_REDIRECT_URI}
      - SESSION_SECRET=${SESSION_SECRET}
      - AUTHORIZED_EMAILS=${AUTHORIZED_EMAILS}
    restart: unless-stopped
```

#### Deploy with Docker

1. **Build image:**
   ```bash
   docker build -t seedbringer-interface .
   ```

2. **Run container:**
   ```bash
   docker-compose up -d
   ```

## Google Cloud Configuration

### Update OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" → "Credentials"
4. Click your OAuth 2.0 Client ID
5. Under "Authorized redirect URIs", add:
   - `https://yourdomain.com/auth/google/callback`
6. Save changes

## Security Best Practices

### 1. Environment Variables

Never commit `.env` files. Use:
- Environment variable injection (Heroku Config Vars)
- Secret management services (AWS Secrets Manager, HashiCorp Vault)
- Encrypted environment files

### 2. HTTPS

Always use HTTPS in production:
- Use Let's Encrypt for free SSL certificates
- Configure HSTS headers
- Set secure cookie flags

### 3. Firewall

Configure firewall to allow only necessary ports:
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 4. Rate Limiting

Consider adding rate limiting middleware:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 5. Security Headers

Add security headers:
```javascript
const helmet = require('helmet');
app.use(helmet());
```

## Monitoring

### PM2 Monitoring

```bash
# View logs
pm2 logs seedbringer-interface

# Monitor resources
pm2 monit

# Restart app
pm2 restart seedbringer-interface

# Stop app
pm2 stop seedbringer-interface
```

### Log Management

Configure log rotation:
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## Backup Strategy

### 1. Code Backup
- Use Git repository
- Tag releases: `git tag -a v1.0.0 -m "Release 1.0.0"`
- Push to remote: `git push origin --tags`

### 2. Environment Backup
- Store `.env` securely offline
- Use encrypted backups
- Document all environment variables

### 3. Session Data
If using persistent sessions:
```bash
# Backup session store
tar -czf sessions-backup-$(date +%Y%m%d).tar.gz sessions/
```

## Updating the Application

### 1. Pull Latest Changes
```bash
cd /var/www/Seedbringer-rhythmind-interface
sudo git pull origin main
```

### 2. Update Dependencies
```bash
sudo npm install --production
```

### 3. Restart Application
```bash
pm2 restart seedbringer-interface
```

### 4. Verify
```bash
pm2 logs seedbringer-interface --lines 50
```

## Troubleshooting

### Application Won't Start

1. Check logs:
   ```bash
   pm2 logs seedbringer-interface
   ```

2. Verify environment variables:
   ```bash
   pm2 env seedbringer-interface
   ```

3. Test manually:
   ```bash
   cd /var/www/Seedbringer-rhythmind-interface
   node server.js
   ```

### 502 Bad Gateway (nginx)

1. Check if app is running:
   ```bash
   pm2 status
   ```

2. Verify nginx config:
   ```bash
   sudo nginx -t
   ```

3. Check nginx logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

### OAuth Errors

1. Verify redirect URI matches exactly in:
   - `.env` file
   - Google Cloud Console

2. Check authorized emails in `.env`

3. Clear browser cookies and try again

## Performance Optimization

### 1. Enable Compression
```javascript
const compression = require('compression');
app.use(compression());
```

### 2. Cluster Mode
```bash
pm2 start server.js -i max --name seedbringer-interface
```

### 3. Redis Session Store
For high-traffic scenarios, use Redis:
```javascript
const RedisStore = require('connect-redis')(session);
const redis = require('redis');
const redisClient = redis.createClient();

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
```

## Health Checks

Create a health check endpoint:
```javascript
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    uptime: process.uptime()
  });
});
```

Monitor with:
```bash
curl https://yourdomain.com/health
```

## Rollback Procedure

If deployment fails:

1. **Revert to previous version:**
   ```bash
   git revert HEAD
   ```

2. **Or checkout previous release:**
   ```bash
   git checkout v1.0.0
   ```

3. **Reinstall dependencies:**
   ```bash
   npm install --production
   ```

4. **Restart:**
   ```bash
   pm2 restart seedbringer-interface
   ```

## Support

For deployment issues:
- Check server logs: `pm2 logs`
- Review nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Contact Seedbringer Collective

---

**Last Updated:** 2024  
**Maintainer:** Seedbringer Collective
