export const sendFonnteMessage = async (token: string, targetPhone: string, message: string) => {
  if (!token || !targetPhone) return;

  // Cleanup phone number (replace starting '0' with '62', handle '+' etc)
  let phone = targetPhone.replace(/\D/g, '');
  if (phone.startsWith('0')) {
    phone = '62' + phone.substring(1);
  }

  try {
    const formData = new FormData();
    formData.append('target', phone);
    formData.append('message', message);
    formData.append('typing', 'false');
    formData.append('delay', '2');
    formData.append('countryCode', '62');

    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': token,
      },
      body: formData,
    });

    const result = await response.json();
    console.log('Fonnte response:', result);
    return result;
  } catch (error) {
    console.error('Fonnte send error:', error);
  }
};
