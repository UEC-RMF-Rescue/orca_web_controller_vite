import { useEffect, useRef, useState } from 'react';
import ROSLIB from 'roslib';
import '../styles/MainUnitMovie.css';

export default function MainUnitMovie({ ros }) {
  const videoRef = useRef(null);
  const coordAreaRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [clickMarkers, setClickMarkers] = useState([]);
  const [goalMarkers, setGoalMarkers] = useState([]); // ★ goal marker 表示用

  const goalInputTopic = ros && new ROSLIB.Topic({
    ros: ros,
    name: '/orca_00/goal_input',
    messageType: 'std_msgs/msg/Float64MultiArray'
  });

  // ★ /orca/goals から PoseArray を受信して goalMarkers に保存
  useEffect(() => {
    if (!ros) return;

    const goalSub = new ROSLIB.Topic({
      ros,
      name: '/orca_00/goals',
      messageType: 'geometry_msgs/msg/PoseArray'
    });

    const handler = (msg) => {
      const rect = coordAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const originX = rect.width / 2;
      const originY = rect.height;
      const scaleX = rect.width;
      const scaleY = rect.height;

      const newMarkers = msg.poses.map(pose => {
        const x_px = originY - pose.position.x * scaleY;
        const y_px = pose.position.y * scaleX + originX;
        return { x: y_px, y: x_px }; // 注意：x/y逆転してる（画面に合わせるため）
      });

      setGoalMarkers(newMarkers);
    };

    goalSub.subscribe(handler);
    return () => goalSub.unsubscribe();
  }, [ros]);

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

  const handleClick = (event) => {
    const rect = coordAreaRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const originX = rect.width / 2;
    const originY = rect.height;

    const scaleX = 1.0 / rect.width;
    const scaleY = 1.0 / rect.height;

    const x_m = (originY - clickY) * scaleY;
    const y_m = (clickX - originX) * scaleX;
    const yaw_rad = 0.0;

    setClickMarkers(prev => [...prev, { x: clickX, y: clickY }]);
    setCoords({ x: x_m.toFixed(3), y: y_m.toFixed(3) });

    if (goalInputTopic) {
      const msg = new ROSLIB.Message({ data: [x_m, y_m, yaw_rad] });
      goalInputTopic.publish(msg);
      console.log('📤 Published to /orca00/goal_input:', msg.data);
    }
  };

  return (
    <div className="main-unit-movie-wrapper">
      <div
        className="coordinate-area"
        ref={coordAreaRef}
        onClick={handleClick}
      >
        <video ref={videoRef} autoPlay muted playsInline />
        {/* ユーザがクリックしたマーカー */}
        {clickMarkers.map((m, i) => (
          <div key={`click-${i}`} className="marker" style={{ left: `${m.x}px`, top: `${m.y}px` }} />
        ))}
        {/* ROSから受け取ったゴールマーカー */}
        {goalMarkers.map((m, i) => (
          <div key={`goal-${i}`} className="marker goal" style={{ left: `${m.x}px`, top: `${m.y}px` }} />
        ))}
      </div>
      <div className="coords-display">
        座標: (x, y) = ({coords.x}, {coords.y})
      </div>
    </div>
  );
}
