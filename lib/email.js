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

/**
 * Send ticket order email with payment info
 * @param {Object} order - Order data
 * @param {Object} ticket - Ticket data
 * @param {Object} event - Event data
 * @param {Object} paymentInfo - Payment info including QR code
 * @param {string} customerEmail - Customer email
 * @returns {Promise<Object>} - Email send result
 */
export const sendTicketOrderEmail = async (order, ticket, event, paymentInfo, customerEmail) => {
  try {
    const transporter = createTransporter();
    
    // Import email template
    const { generateTicketOrderEmailHTML } = await import('./emailTemplates');
    const htmlContent = generateTicketOrderEmailHTML(order, ticket, event, paymentInfo);

    const mailOptions = {
        from: {
          name: 'PLADIVO - Vé Sự Kiện',
          address: process.env.EMAIL_USER,
        },
        to: customerEmail,
        subject: `Xác nhận đặt vé - ${event.title}`,
        html: htmlContent,
      };
  
      const info = await transporter.sendMail(mailOptions);
      
      console.log('✅ Ticket order email sent successfully:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('❌ Error sending ticket order email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send entry ticket email with QR codes
 * @param {Object} order - Order data
 * @param {Array} qrCodes - Array of QR codes
 * @param {string} customerEmail - Customer email
 * @returns {Promise<Object>} - Email send result
 */
export const sendEntryTicketEmail = async (order, qrCodes, customerEmail) => {
  try {
    const transporter = createTransporter();
    
    const { generateEntryTicketEmailHTML } = await import('./emailTemplates');
    const htmlContent = generateEntryTicketEmailHTML(order, qrCodes);

    const mailOptions = {
      from: {
        name: 'PLADIVO - Vé Điện Tử',
        address: process.env.EMAIL_USER,
      },
      to: customerEmail,
      subject: `✅ Thanh toán thành công - Vé điện tử: ${order.event_name || 'Sự kiện'}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Entry ticket email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending entry ticket email:', error);
    return { success: false, error: error.message };
  }
};
