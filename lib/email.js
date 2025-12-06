import nodemailer from 'nodemailer';

/**
 * Create email transporter using Gmail SMTP
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send contract email to customer
 * @param {Object} contractData - Contract data
 * @param {string} customerEmail - Customer email address
 * @returns {Promise<Object>} - Email send result
 */
export const sendContractEmail = async (contractData, customerEmail) => {
  try {
    const transporter = createTransporter();
    
    // Import email template
    const { generateContractEmailHTML } = await import('./emailTemplates');
    const htmlContent = generateContractEmailHTML(contractData);

    const mailOptions = {
      from: {
        name: 'PLADIVO - Tổ Chức Sự Kiện',
        address: process.env.EMAIL_USER,
      },
      to: customerEmail,
      subject: `Hợp Đồng Dịch Vụ Tổ Chức Sự Kiện - ${contractData.contract_number}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send test email to verify configuration
 */
export const sendTestEmail = async (toEmail) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'PLADIVO - Tổ Chức Sự Kiện',
        address: process.env.EMAIL_USER,
      },
      to: toEmail,
      subject: 'Test Email - PLADIVO',
      html: '<h1>Email configuration is working!</h1><p>This is a test email from PLADIVO event management system.</p>',
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Test email failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send payment confirmation email to customer
 * @param {Object} contract - Contract data
 * @param {Object} paymentItem - Payment schedule item that was paid
 * @param {Object} transactionData - Transaction data from webhook
 * @returns {Promise<Object>} - Email send result
 */
export const sendPaymentConfirmationEmail = async (contract, paymentItem, transactionData) => {
  try {
    const transporter = createTransporter();
    
    // Import email template
    const { generatePaymentConfirmationEmailHTML } = await import('./emailTemplates');
    const htmlContent = generatePaymentConfirmationEmailHTML(contract, paymentItem, transactionData);

    const customerEmail = contract.party_a?.email;
    if (!customerEmail) {
      console.error('❌ No customer email found in contract');
      return {
        success: false,
        error: 'Customer email not found',
      };
    }

    const mailOptions = {
      from: {
        name: 'PLADIVO - Tổ Chức Sự Kiện',
        address: process.env.EMAIL_USER,
      },
      to: customerEmail,
      subject: `Xác Nhận Thanh Toán - ${contract.contract_number}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Payment confirmation email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('❌ Error sending payment confirmation email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
