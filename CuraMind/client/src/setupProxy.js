const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/api': '/api',
      },
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying: ${req.method} ${req.path} -> ${proxyReq.getHeader('host')}${proxyReq.path}`);
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({ message: 'Proxy error', error: err.message });
      }
    })
  );
};
