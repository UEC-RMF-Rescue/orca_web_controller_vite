import { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
import '../styles/RobotControls.css';

export default function RobotControls({ robotName, ros }) {
  const [yawOffset, setYawOffset] = useState(null);

  useEffect(() => {
    if (!ros || !robotName) return;

    const topic = new ROSLIB.Topic({
      ros,
      name: `/${robotName}/yaw_rad_offset`,
      messageType: 'std_msgs/Float64'
    });

    topic.subscribe((message) => {
      setYawOffset(message.data.toFixed(2));
    });

    return () => {
      topic.unsubscribe();
    };
  }, [ros, robotName]);

  const callService = (serviceName) => {
    const service = new ROSLIB.Service({
      ros,
      name: `/${robotName}/${serviceName}`,
      serviceType: 'std_srvs/Empty'
    });

    const request = new ROSLIB.ServiceRequest();
    service.callService(request, () => {
      console.log(`${serviceName} called for ${robotName}`);
    });
  };

  return (
    <div className='wrapper'>
      <div className='button-list'>
        <div className='posctl-buttonlist'>
          <img
            src="../../public/target32.jpeg"
            alt="target"
            className='icon-button'
            onClick={() => console.log(`Select ${robotName} for marker input`)}
          />
          <img
            src="../../public/start32.jpeg"
            alt="start"
            className='icon-button'
            onClick={() => callService('execute_posctl')}
          />
          <img
            src="../../public/trash32.jpeg"
            alt="stop"
            className='icon-button'
            onClick={() => callService('terminate_posctl')}
          />
        </div>
        <div className='show-rad'>
          <p>{yawOffset !== null ? `deg: ${yawOffset}` : 'deg: --'}</p>
        </div>
      </div>
    </div>
  );
}
