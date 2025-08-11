const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://127.0.0.1:1883');

//const client = mqtt.connect('mqtt://104.255.220.22:1883');

client.on('connect', function () {
  console.log('Successfully connected to MQTT broker!');
  setInterval(function () {
    const hexData = 'CA0000000023000304010101017A9F'; // Sample hex string for "Hello Hex!"
    const buffer = Buffer.from(hexData, 'hex');
    const message = JSON.stringify({ data: buffer });
    client.publish('iot-data', message);
    console.log('Published hex data:', hexData);
  }, 1000);
});

client.on('error', function (error) {
  console.error('MQTT connection error:', error);
});
