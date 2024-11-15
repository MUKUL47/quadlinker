// vite.config.js
export default {
    server: {
        host: '0.0.0.0',  // Listen on all network interfaces
        port: 4000,
        watch: {
            usePolling: true // Important for Docker to pick up file changes
        }
    }
};
