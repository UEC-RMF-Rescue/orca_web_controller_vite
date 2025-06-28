import { useEffect, useRef, useState } from 'react';
import ROSLIB from 'roslib';
import '../styles/MainUnitMovie.css';

export default function MainUnitMovie({ ros, activeRobotName, yawOffsets }) {
  const videoRef = useRef(null);
  const coordAreaRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [clickMarkers, setClickMarkers] = useState([]);
  const [goalMarkers, setGoalMarkers] = useState([]);

  // カメラ起動
  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          videoRef.current.srcObject = stream;
        })
        .catch(err => {
          console.error('カメラ取得エラー:', err);
        });
    }
  }, []);

  // PoseArray受信してマーカー表示
  useEffect(() => {
    if (!ros || !activeRobotName) return;

    const goalSub = new ROSLIB.Topic({
      ros,
      name: `/${activeRobotName}/goals`,
      messageType: 'geometry_msgs/msg/PoseArray'
    });

    const handler = (msg) => {
      const rect = coordAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const originX = rect.width / 2;
      const originY = rect.height;
      const scaleX = rect.width;
      const scaleY = rect.height;

      // 色判定
      const markerColor =
        activeRobotName === 'orca_00' ? 'yellow' :
        activeRobotName === 'orca_01' ? 'hotpink' :
        activeRobotName === 'orca_02' ? 'cyan' : 'red';

      const newMarkers = msg.poses.map(pose => {
        const x_px = originY - pose.position.x * scaleY;
        const y_px = originX - pose.position.y * scaleX;
        return { x: y_px, y: x_px, color: markerColor };
      });

      setGoalMarkers(newMarkers);
    };

    goalSub.subscribe(handler);
    return () => goalSub.unsubscribe();
  }, [ros, activeRobotName]);

  // クリック時処理
  const handleClick = (event) => {
    if (!ros || !activeRobotName) return;

    const rect = coordAreaRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const originX = rect.width / 2;
    const originY = rect.height;

    const scaleX = 1.0 / rect.width;
    const scaleY = 1.0 / rect.height;

    const x_m = (originY - clickY) * scaleY;
    const y_m = (originX - clickX) * scaleX;
    const yaw_rad = yawOffsets?.[activeRobotName] ? parseFloat(yawOffsets[activeRobotName]) : 0.0;

    // 色判定
    const markerColor =
      activeRobotName === 'orca_00' ? 'yellow' :
      activeRobotName === 'orca_01' ? 'hotpink' :
      activeRobotName === 'orca_02' ? 'cyan' : 'red';

    setClickMarkers(prev => [...prev, { x: clickX, y: clickY, color: markerColor }]);
    setCoords({ x: x_m.toFixed(3), y: y_m.toFixed(3) });

    const topic = new ROSLIB.Topic({
      ros,
      name: `/${activeRobotName}/goal_input`,
      messageType: 'std_msgs/msg/Float64MultiArray'
    });

    const msg = new ROSLIB.Message({ data: [x_m, y_m, yaw_rad] });
    topic.publish(msg);
    console.log(`📤 Published to /${activeRobotName}/goal_input:`, msg.data);
  };

  return (
    <div className="main-unit-movie-wrapper">
      <div
        className="coordinate-area"
        ref={coordAreaRef}
        onClick={handleClick}
      >
        <video ref={videoRef} autoPlay muted playsInline />
        {clickMarkers.map((m, i) => (
          <div
            key={`click-${i}`}
            className="marker"
            style={{
              left: `${m.x}px`,
              top: `${m.y}px`,
              backgroundColor: m.color
            }}
          />
        ))}
        {goalMarkers.map((m, i) => (
          <div
            key={`goal-${i}`}
            className="marker goal"
            style={{
              left: `${m.x}px`,
              top: `${m.y}px`,
              backgroundColor: m.color  // 追加！
            }}
          />
        ))}
      </div>
      <div className="coords-display">
        座標: (x, y) = ({coords.x}, {coords.y})
      </div>
    </div>
  );
}
