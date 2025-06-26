import { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
import '../styles/RobotControls.css';

export default function RobotControls({ robotName, ros, activeRobotName, setActiveRobotName, yawInput, onYawInputChange }) {
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
    return () => topic.unsubscribe();
  }, [ros, robotName]);

  const callService = (serviceName) => {
    const service = new ROSLIB.Service({
      ros,
      name: `/${robotName}/${serviceName}`,
      serviceType: 'std_srvs/Empty'
    });
    service.callService(new ROSLIB.ServiceRequest(), () => {
      console.log(`${serviceName} called for ${robotName}`);
    });
  };

  const isActive = activeRobotName === robotName;

  return (
    <div className={`wrapper ${isActive ? 'active-robot' : ''}`}>
      <div className='button-list'>
        <div className='posctl-buttonlist'>
          <img src="../../public/target32.jpeg" className='icon-button' onClick={() => setActiveRobotName(robotName)} />
          <img src="../../public/start32.jpeg" className='icon-button' onClick={() => callService('execute_posctl')} />
          <img src="../../public/trash32.jpeg" className='icon-button' onClick={() => callService('terminate_posctl')} />
        </div>

        <div className='show-rad'>
            <input
            type="number"
            step="0.01"
            className="yaw-input"
            placeholder="yaw[rad]"
            value={yawInput}
            onChange={(e) => onYawInputChange(robotName, e.target.value)}
            />
        </div>
      </div>
    </div>
  );
}