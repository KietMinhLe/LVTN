import nodemailer from 'nodemailer';

// Cấu hình email transporter
// Lưu ý: Cần cấu hình các biến môi trường sau trong file .env:
// EMAIL_HOST=smtp.gmail.com (hoặc SMTP server khác)
// EMAIL_PORT=587
// EMAIL_USER=your-email@gmail.com
// EMAIL_PASS=your-app-password (với Gmail cần dùng App Password)
// FRONTEND_URL=http://localhost:5173 (URL frontend để tạo link reset)

const createTransporter = () => {
    // Log cấu hình hiện tại để debug
    console.log('\n📧 ===== EMAIL CONFIGURATION CHECK =====');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'NOT SET');
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT || 'NOT SET (default: 587)');
    console.log('EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***SET***' : 'NOT SET');
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'NOT SET (default: http://localhost:5173)');
    console.log('==========================================\n');

    // Nếu không có cấu hình email, trả về null (sẽ log thay vì gửi email)
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️ Email configuration not found. Email sending will be disabled.');
        console.warn('Please configure EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env file');
        console.warn('Make sure to restart the server after creating/updating .env file');
        return null;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        // Thêm debug để xem chi tiết
        debug: true,
        logger: true
    });

    // Test connection
    transporter.verify(function (error, success) {
        if (error) {
            console.error('❌ SMTP Connection Error:', error);
            console.error('Error Code:', error.code);
            console.error('Error Command:', error.command);
            console.error('Error Response:', error.response);
        } else {
            console.log('✅ SMTP Server is ready to send emails');
        }
    });

    return transporter;
};

/**
 * Gửi email reset password
 * @param {string} to - Email người nhận
 * @param {string} resetToken - Token để reset password
 * @param {string} userName - Tên người dùng (tùy chọn)
 * @returns {Promise<boolean>} - true nếu gửi thành công
 */
export const sendPasswordResetEmail = async (to, resetToken, userName = '') => {
    try {
        const transporter = createTransporter();
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: `"BookStore" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: 'Đặt lại mật khẩu - BookStore',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Đặt lại mật khẩu</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">📚 BookStore</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <h2 style="color: #333; margin-top: 0;">Đặt lại mật khẩu</h2>
            ${userName ? `<p>Xin chào <strong>${userName}</strong>,</p>` : '<p>Xin chào,</p>'}
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            <p>Vui lòng click vào nút bên dưới để đặt lại mật khẩu:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; padding: 15px 30px; text-decoration: none; 
                        border-radius: 5px; font-weight: bold;">
                Đặt lại mật khẩu
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Hoặc copy và paste link sau vào trình duyệt:</p>
            <p style="background: #fff; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px; color: #666;">
              ${resetLink}
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              <strong>Lưu ý:</strong> Link này sẽ hết hạn sau 1 giờ. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
            </p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} BookStore. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </body>
        </html>
      `,
            text: `
        Đặt lại mật khẩu - BookStore
        
        Xin chào${userName ? ` ${userName}` : ''},
        
        Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
        
        Vui lòng truy cập link sau để đặt lại mật khẩu:
        ${resetLink}
        
        Link này sẽ hết hạn sau 1 giờ.
        
        Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
        
        © ${new Date().getFullYear()} BookStore
      `,
        };

        if (!transporter) {
            // Nếu không có cấu hình email, log thông tin để developer có thể test
            console.log('\n📧 ===== EMAIL RESET PASSWORD (DEV MODE) =====');
            console.log('To:', to);
            console.log('Reset Link:', resetLink);
            console.log('Token:', resetToken);
            console.log('==========================================\n');
            return true; // Trả về true để không block flow
        }

        console.log('\n📧 ===== SENDING EMAIL =====');
        console.log('From:', mailOptions.from);
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('Reset Link:', resetLink);
        console.log('============================\n');

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
        return true;
    } catch (error) {
        console.error('\n❌ ===== ERROR SENDING EMAIL =====');
        console.error('Error Code:', error.code);
        console.error('Error Command:', error.command);
        console.error('Error Response:', error.response);
        console.error('Full Error:', error);
        console.error('===================================\n');
        throw error;
    }
};

