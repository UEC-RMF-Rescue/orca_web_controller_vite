import { useEffect, useState, useRef } from 'react';
import ROSLIB from 'roslib';
import '../style.css';

export default function RobotPanel({ robotName, ros }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [mode, setMode] = useState('auto');
  const [yawOffset, setYawOffset] = useState(null);  // ← 追加
  const videoRef = useRef(null);

  // enabled_state購読
  useEffect(() => {
    if (!ros || !ros.isConnected) return;

    const enabledTopic = new ROSLIB.Topic({
      ros,
      name: `/${robotName}/enabled_state`,
      messageType: 'std_msgs/Bool',
    });

    const handleMsg = (msg) => {
      console.log(`[${robotName}] enabled_state:`, msg.data);
      setIsEnabled(msg.data);
    };

    enabledTopic.subscribe(handleMsg);

    return () => {
      enabledTopic.unsubscribe();
    };
  }, [ros, robotName]);

  // yaw_rad/offset購読
  useEffect(() => {
    if (!ros || !ros.isConnected) return;

    const yawTopic = new ROSLIB.Topic({
      ros,
      name: `/${robotName}/yaw_rad/offset`,
      messageType: 'std_msgs/Float64',
    });

    const handleYawMsg = (msg) => {
      console.log(`[${robotName}] yaw_offset:`, msg.data);
      setYawOffset(msg.data);
    };

    yawTopic.subscribe(handleYawMsg);

    return () => {
      yawTopic.unsubscribe();
    };
  }, [ros, robotName]);

  // videoセットアップ
  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => {
          console.error('カメラにアクセスできませんでした:', err);
        });
    }
  }, []);

  // ServiceとTopic
  const enableService = ros && new ROSLIB.Service({
    ros,
    name: `/${robotName}/enable`,
    serviceType: 'std_srvs/srv/Empty',
  });

  const disableService = ros && new ROSLIB.Service({
    ros,
    name: `/${robotName}/disable`,
    serviceType: 'std_srvs/srv/Empty',
  });

  const setOffsetService = ros && new ROSLIB.Service({
    ros,
    name: `/${robotName}/set_offset`,
    serviceType: 'std_srvs/srv/Empty',
  });

  const controlStateTopic = ros && new ROSLIB.Topic({
    ros,
    name: `/${robotName}/control_state`,
    messageType: 'std_msgs/Int32',
  });

  const callEnable = () => {
    if (!enableService) return;
    enableService.callService({}, () => {
      console.log(`${robotName} enable`);
    });
  };

  const callDisable = () => {
    if (!disableService) return;
    disableService.callService({}, () => {
      console.log(`${robotName} disable`);
    });
  };

  const callSetOffset = () => {
    if (!setOffsetService) return;
    setOffsetService.callService({}, () => {
      console.log(`${robotName} setOffset`);
    });
  };

  const sendControlState = (value) => {
    if (!controlStateTopic) return;
    controlStateTopic.publish(new ROSLIB.Message({ data: value }));
    console.log(`📤 ${robotName} control_state: ${value}`);
  };

  const toggleMode = (e) => {
    e.stopPropagation();
    const newMode = mode === 'auto' ? 'manual' : 'auto';
    setMode(newMode);
    sendControlState(newMode === 'auto' ? 1 : 0);
  };

  return (
    <div className="camera-box">
      <button
        onClick={callEnable}
        style={{
          display: isEnabled ? 'none' : 'inline-block',
          backgroundColor: 'rgba(46, 125, 228, 0.7)',
          borderRadius: '5px',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Enable
      </button>

      <button
        onClick={callDisable}
        style={{
          display: isEnabled ? 'inline-block' : 'none',
          backgroundColor: 'rgba(255, 0, 0, 0.6)',
          borderRadius: '5px',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Disable
      </button>

      <div className={`is-enable ${mode}`} onClick={toggleMode}>
        <video ref={videoRef} autoPlay muted />
        <div className="button-group">
          <button onClick={(e) => e.stopPropagation()}>
            {yawOffset !== null ? yawOffset.toFixed(2) : '...'}
          </button>
          <button onClick={(e) => { e.stopPropagation(); callSetOffset(); }}>offset</button>
          <button onClick={(e) => e.stopPropagation()}>arm</button>
        </div>
      </div>
    </div>
  );
}