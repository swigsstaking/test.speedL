import axios from 'axios';

/**
 * Vérifie si un site est en ligne
 */
export async function checkSiteUptime(url) {
  const startTime = Date.now();
  
  try {
    const response = await axios.get(url, {
      timeout: 10000, // 10s timeout
      validateStatus: (status) => status < 500, // Accepter 4xx mais pas 5xx
    });
    
    const latency = Date.now() - startTime;
    
    return {
      status: response.status < 400 ? 'online' : 'warning',
      latency,
      statusCode: response.status,
      timestamp: new Date(),
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    
    return {
      status: 'offline',
      latency,
      statusCode: 0,
      error: error.message,
      timestamp: new Date(),
    };
  }
}

/**
 * Vérifie le certificat SSL
 */
export async function checkSSL(url) {
  try {
    const hostname = new URL(url).hostname;
    const https = await import('https');
    
    return new Promise((resolve) => {
      const options = {
        hostname,
        port: 443,
        method: 'GET',
        rejectUnauthorized: false,
      };
      
      const req = https.request(options, (res) => {
        const cert = res.socket.getPeerCertificate();
        
        if (cert && cert.valid_to) {
          const expiryDate = new Date(cert.valid_to);
          const daysUntilExpiry = Math.floor((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
          
          resolve({
            valid: true,
            expiresIn: daysUntilExpiry,
            expiryDate,
            issuer: cert.issuer?.O || 'Unknown',
          });
        } else {
          resolve({
            valid: false,
            expiresIn: 0,
          });
        }
      });
      
      req.on('error', () => {
        resolve({
          valid: false,
          expiresIn: 0,
        });
      });
      
      req.end();
    });
  } catch (error) {
    return {
      valid: false,
      expiresIn: 0,
      error: error.message,
    };
  }
}
