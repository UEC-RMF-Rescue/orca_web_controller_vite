import { useEffect, useState, useRef } from 'react';
import ROSLIB from 'roslib';
import '../style.css';

export default function RobotPanel({ robotName, ros }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [mode, setMode] = useState('auto');
  const videoRef = useRef(null);

  // enabled_state購読
  useEffect(() => {
    if (!ros) return;

    const enabledStateSub = new ROSLIB.Topic({
      ros,
      name: `/${robotName}/enabled_state`,
      messageType: 'std_msgs/Bool'
    });

    enabledStateSub.subscribe(msg => {
      setIsEnabled(msg.data);
    });

    return () => enabledStateSub.unsubscribe();
  }, [ros, robotName]);

  // カメラ起動
  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          videoRef.current.srcObject = stream;
        })
        .catch(err => {
          console.error('カメラにアクセスできませんでした:', err);
        });
    }
  }, []);

  // サービスとトピック（ROSがreadyなときだけ定義）
  const enableService = ros ? new ROSLIB.Service({
    ros,
    name: `/${robotName}/enable`,
    serviceType: 'std_srvs/srv/Empty'
  }) : null;

  const disableService = ros ? new ROSLIB.Service({
    ros,
    name: `/${robotName}/disable`,
    serviceType: 'std_srvs/srv/Empty'
  }) : null;

  const setOffsetService = ros ? new ROSLIB.Service({
    ros,
    name: `/${robotName}/set_offset`,
    serviceType: 'std_srvs/srv/Empty'
  }) : null;

  const controlStateTopic = ros ? new ROSLIB.Topic({
    ros,
    name: `/${robotName}/control_state`,
    messageType: 'std_msgs/Int32'
  }) : null;

  // サービス呼び出し関数
  const callEnable = () => {
    if (!enableService) return;
    enableService.callService({}, () => {
      console.log(`${robotName} enable ✅`);
    });
  };

  const callDisable = () => {
    if (!disableService) return;
    disableService.callService({}, () => {
      console.log(`${robotName} disable ❌`);
    });
  };

  const callSetOffset = () => {
    if (!setOffsetService) return;
    setOffsetService.callService({}, () => {
      console.log(`${robotName} setOffset ✅`);
    });
  };

  const sendControlState = (value) => {
    if (!controlStateTopic) return;
    const msg = new ROSLIB.Message({ data: value });
    controlStateTopic.publish(msg);
    console.log(`📤 ${robotName} control_state sent:`, value);
  };

  const toggleMode = (e) => {
    e.stopPropagation();
    const newMode = mode === 'auto' ? 'manual' : 'auto';
    setMode(newMode);
    sendControlState(newMode === 'auto' ? 1 : 0);
  };

  return (
    <div className="camera-box">
      {/* Enable ボタン */}
      <button
        onClick={callEnable}
        style={{
          backgroundColor: 'rgba(46, 125, 228, 0.7)',
          borderRadius: '5px',
          fontSize: '16px',
          cursor: 'pointer',
          marginRight: '10px',
          padding: '10px 20px'
        }}
      >
        Enable
      </button>

      {/* Disable ボタン */}
      <button
        onClick={callDisable}
        style={{
          backgroundColor: 'rgba(255, 0, 0, 0.6)',
          borderRadius: '5px',
          fontSize: '16px',
          cursor: 'pointer',
          padding: '10px 20px'
        }}
      >
        Disable
      </button>

      <div className={`is-enable ${mode}`} onClick={toggleMode}>
        <video ref={videoRef} autoPlay muted />
        <div className="button-group">
          <button onClick={(e) => e.stopPropagation()}>32do</button>
          <button onClick={(e) => { e.stopPropagation(); callSetOffset(); }}>offset</button>
          <button onClick={(e) => e.stopPropagation()}>arm</button>
        </div>
      </div>
    </div>
  );
}
