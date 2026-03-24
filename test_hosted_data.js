const https = require('https');

function makeRequest(path, method, data, token, callback) {
  const options = {
    hostname: 'quiz-tournament-app-production-d43f.up.railway.app',
    port: 443,
    path: path,
    method: method,
    headers: {}
  };

  if (data) {
    options.headers['Content-Type'] = 'application/json';
    options.headers['Content-Length'] = data.length;
  }
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  const req = https.request(options, res => {
    let responseBody = '';
    res.on('data', chunk => responseBody += chunk);
    res.on('end', () => {
      callback(res.statusCode, responseBody);
    });
  });

  req.on('error', error => {
    console.error(`Error:`, error);
  });

  if (data) {
    req.write(data);
  }
  req.end();
}

const loginData = JSON.stringify({ username: 'admin', password: 'admin123' });
console.log('Logging in to hosted version...');
makeRequest('/api/auth/login', 'POST', loginData, null, (status, body) => {
  if (status !== 200) {
    console.log('Login failed:', status, body);
    return;
  }
  const token = JSON.parse(body).token;
  console.log('Login successful, fetching tournaments...');
  
  makeRequest('/api/admin/tournaments', 'GET', null, token, (tStatus, tBody) => {
    console.log('Tournaments status:', tStatus);
    console.log('Tournaments data:', tBody);
  });
});
