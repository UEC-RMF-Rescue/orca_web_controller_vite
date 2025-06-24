import { useEffect, useState } from 'react';
import ROSLIB from 'roslib';

export function useROS(url = "ws://localhost:9090") {
  const [ros, setRos] = useState(null);

  useEffect(() => {
    const rosInstance = new ROSLIB.Ros({ url });

    rosInstance.on('connection', () => {
      console.log('✅ Connected to rosbridge');
    });
    rosInstance.on('error', (err) => {
      console.error('❌ Error:', err);
    });
    rosInstance.on('close', () => {
      console.log('🔌 Connection closed');
    });

    setRos(rosInstance);

    return () => rosInstance.close();
  }, [url]);

  return ros;
}