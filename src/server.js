import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import Routes from './routes/index.js';
import cors from 'cors';

const app = express();
dotenv.config();

// Middleware để xử lý ngrok warning page và các request từ SePay
app.use((req, res, next) => {
    // Bỏ qua ngrok warning bằng cách thêm header
    if (req.headers['ngrok-skip-browser-warning']) {
        delete req.headers['ngrok-skip-browser-warning'];
    }
    // Thêm header để bypass ngrok warning
    res.setHeader('ngrok-skip-browser-warning', 'true');
    
    // Log chi tiết cho các request đến sepay routes
    if (req.path.includes('sepay') || req.path === '/ipn') {
        console.log('=== SePay Request ===');
        console.log('Method:', req.method);
        console.log('Path:', req.path);
        console.log('Full URL:', req.url);
        console.log('Query:', req.query);
        console.log('Headers:', JSON.stringify(req.headers, null, 2));
    }
    
    next();
});

app.use(cors());//cho phép tất cả các nguồn truy cập vào API từ phía client
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware để log tất cả requests (debug)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    if (Object.keys(req.query).length > 0) {
        console.log('Query:', req.query);
    }
    next();
});

// Serve static files từ thư mục uploads
app.use('/uploads', express.static('uploads'));

Routes(app);//dường dẫn all router

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});

export default server;