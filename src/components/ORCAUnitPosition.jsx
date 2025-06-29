import { useEffect, useState } from 'react';
import ROSLIB from 'roslib';

export default function ORCAUnitPosition({ ros, robotName }) {
  const [pos, setPos] = useState({ x: null, y: null });

  useEffect(() => {
    if (!ros || !robotName) return;

    const topic = new ROSLIB.Topic({
      ros,
      name: `/${robotName}/pos`,
      messageType: 'std_msgs/msg/Float64MultiArray'
    });

    const handler = (msg) => {
      if (msg.data.length >= 2) {
        setPos({
          x: msg.data[0],
          y: msg.data[1]
        });
      }
    };

    topic.subscribe(handler);
    return () => topic.unsubscribe();
  }, [ros, robotName]);

  return (
    <div style={{
      padding: '8px',
      border: '1px solid #aaa',
      margin: '4px',
      borderRadius: '4px',
      backgroundColor: '#f9f9f9'
    }}>
      <strong>{robotName}</strong><br />
      X: {pos.x !== null ? pos.x.toFixed(2) : '--'}<br />
      Y: {pos.y !== null ? pos.y.toFixed(2) : '--'}
    </div>
  );
}
