const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://127.0.0.1:1883');

client.on('connect', function () {
  console.log('Successfully connected to MQTT broker!');
  
  setInterval(function () {
    const hexData = 'CA0000000023FF03261F0000000000000000000000000000000000473031303036474D4C4E4152474D304E30520800CE6F'; // Sample hex string

    // Get current timestamp in your required format
    const now = new Date();
    const timestamp =
      now.getFullYear() +
      '-' +
      String(now.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(now.getDate()).padStart(2, '0') +
      ' ' +
      String(now.getHours()).padStart(2, '0') +
      ':' +
      String(now.getMinutes()).padStart(2, '0') +
      ':' +
      String(now.getSeconds()).padStart(2, '0') +
      '.0000';

    // Prepare message in desired format
    const message = JSON.stringify({
      timestamp: timestamp,
      information: hexData
    });

    client.publish('aeologic_iot', message);
    console.log('Published:', message);
  }, 1000);
});

client.on('error', function (error) {
  console.error('MQTT connection error:', error);
});
