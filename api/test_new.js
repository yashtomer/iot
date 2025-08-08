const axios = require('axios');

const sendDummyData = async () => {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const information = `CA0000000023000304010101017A9F`;

  try {
    const response = await axios.post('http://localhost:3001/hex-data', {
      timestamp: `${timestamp}.0000`,
      information: information,
    });
    console.log('Data sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending data:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
};

// Send data every 5 seconds
setInterval(sendDummyData, 5000);

console.log('Sending dummy data to http://localhost:3001/hex-data every 5 seconds...');