// backend/src/services/emailService.js
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

class EmailService {
  constructor() {
    // Only create transporter if email credentials are provided
    if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
      // Use nodemailer's createTransport API
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD
        },
        secure: true,
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000, // 10 seconds
        socketTimeout: 10000 // 10 seconds
      });
    } else {
  console.warn('⚠️  Email service disabled - EMAIL_USER and EMAIL_APP_PASSWORD not configured');
      this.transporter = null;
    }
  }

  // Generate verification token
  generateVerificationToken(userId) {
    return jwt.sign(
      { userId, type: 'email_verification' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  // Generate password reset token
  generatePasswordResetToken(userId, email, currentPasswordHash) {
    const secret = process.env.JWT_SECRET + currentPasswordHash;
    return jwt.sign(
      { userId, email, type: 'password_reset' },
      secret,
      { expiresIn: '1h' }
    );
  }

  // Send verification email
  async sendVerificationEmail(email, name, token) {
    // If no transporter is configured, skip email sending
    if (!this.transporter) {
      console.log(`⚠️  Email service disabled - verification email for ${email} would be sent in production`);
      return true; // Return success to not block signup flow
    }

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: {
        name: 'SoulSync',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: '✨ Verify Your SoulSync Account',
      html: this.getVerificationEmailTemplate(name, verificationUrl)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Verification email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, name, token, userId) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?id=${userId}&token=${token}`;
    
    const mailOptions = {
      from: {
        name: 'SoulSync',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: '🔐 Reset Your SoulSync Password',
      html: this.getPasswordResetEmailTemplate(name, resetUrl)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  // Send password changed confirmation email
  async sendPasswordChangedEmail(email, name) {
    const mailOptions = {
      from: {
        name: 'SoulSync',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: '✅ Your SoulSync Password Has Been Changed',
      html: this.getPasswordChangedEmailTemplate(name)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Password changed email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending password changed email:', error);
      // Don't throw error for notification emails
      return false;
    }
  }

  // Email templates
  getVerificationEmailTemplate(name, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your SoulSync Account</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7f7f7;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
          <div style="background: linear-gradient(135deg, #ff6b6b, #ee5a52); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">💕 Welcome to SoulSync!</h1>
          </div>
          
          <div style="padding: 40px 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Thank you for joining SoulSync! We're excited to help you find meaningful connections. 
              To get started, please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #ff6b6b, #ee5a52); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                Verify My Email
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #ff6b6b;">${verificationUrl}</a>
            </p>
            
            <p style="color: #999; font-size: 14px; margin-top: 20px;">
              This verification link will expire in 24 hours. If you didn't create an account with SoulSync, 
              please ignore this email.
            </p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2024 SoulSync. Made with ❤️ for meaningful connections.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetEmailTemplate(name, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your SoulSync Password</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7f7f7;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
          <div style="background: linear-gradient(135deg, #ff6b6b, #ee5a52); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
          </div>
          
          <div style="padding: 40px 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              We received a request to reset your SoulSync password. If you made this request, 
              click the button below to set a new password. If you didn't request this, you can safely ignore this email.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #ff6b6b, #ee5a52); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                Reset My Password
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #ff6b6b;">${resetUrl}</a>
            </p>
            
            <p style="color: #999; font-size: 14px; margin-top: 20px;">
              This reset link will expire in 1 hour for security reasons.
            </p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2024 SoulSync. Made with ❤️ for meaningful connections.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordChangedEmailTemplate(name) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed Successfully</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7f7f7;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
          <div style="background: linear-gradient(135deg, #4caf50, #45a049); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Password Changed</h1>
          </div>
          
          <div style="padding: 40px 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Your SoulSync password has been successfully changed. Your account is now secured with your new password.
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              If you didn't make this change, please contact our support team immediately or reset your password again.
            </p>
            
            <div style="background-color: #f0f8ff; border: 1px solid #4caf50; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="color: #333; margin: 0; font-size: 14px;">
                <strong>Security Tip:</strong> For your account safety, we recommend using a strong, unique password 
                and enabling two-factor authentication if available.
              </p>
            </div>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2024 SoulSync. Made with ❤️ for meaningful connections.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default new EmailService();