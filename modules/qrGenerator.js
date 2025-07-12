// modules/qrGenerator.js
import QRCode from 'qrcode';

export const generateQRCode = async ({ amount, recipient, invoiceId, network, token }) => {
  try {
    const payload = JSON.stringify({
      amount,
      recipient,
      invoiceId,
      network,
      token,
      chainId: network === 'ethereum' ? 1 : network === 'bsc' ? 56 : null, // Chain ID برای شبکه
    });
    const qrCode = await QRCode.toDataURL(payload);
    return qrCode;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};