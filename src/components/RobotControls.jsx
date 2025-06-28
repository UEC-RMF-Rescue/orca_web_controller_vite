import { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
import '../styles/RobotControls.css';

export default function RobotControls({ robotName, ros, activeRobotName, setActiveRobotName, yawOffsets ,setYawOffsets }) {

    useEffect(() => {
    if (!ros || !robotName) return;

    const topic = new ROSLIB.Topic({
        ros,
        name: `/${robotName}/yaw_rad_offset`,
        messageType: 'std_msgs/Float64'
    });

    topic.subscribe((message) => {
        const val = message.data.toFixed(2);
        setYawOffsets(val);

        // 状態をAppに伝える
        setYawOffsets(prev => ({
        ...prev,
        [robotName]: val
        }));
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

  const isActive = activeRobotName === robotName;

  return (
    <div className={`wrapper ${isActive ? 'active-robot' : ''}`}>
      <div className='button-list'>
        <div className='posctl-buttonlist'>
          {/* ① MainUnitMovieに対象を通知 */}
          <img
            src="../../public/target32.jpeg"
            alt="target"
            className='icon-button'
            onClick={() => setActiveRobotName(robotName)}
            title="マーカー対象に選択"
          />
          {/* ② execute_posctl */}
          <img
            src="../../public/start32.jpeg"
            alt="start"
            className='icon-button'
            onClick={() => callService('execute_posctl')}
            title="execute_posctl"
          />
          {/* ③ terminate_posctl */}
          <img
            src="../../public/trash32.jpeg"
            alt="stop"
            className='icon-button'
            onClick={() => callService('terminate_posctl')}
            title="terminate_posctl"
          />
        </div>

        {/* ④ yaw_rad_offset 表示 */}
        <div className='show-rad'>
            <input type='number' onChange={(e) => setYawOffsets(e.target.value)}/>
        </div>
      </div>
    </div>
  );
}
