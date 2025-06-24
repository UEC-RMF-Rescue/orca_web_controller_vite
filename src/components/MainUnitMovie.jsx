import { useEffect, useRef, useState } from 'react';
import '../styles/MainUnitMovie.css'; 

export default function MainUnitMovie() {
  const videoRef = useRef(null);
  const coordAreaRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [markers, setMarkers] = useState([]);

  // カメラ映像取得
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

  const scaleX = 1.0 / rect.width;   // 1m 幅
  const scaleY = 1.0 / rect.height;  // 1m 高さ

  const x_m = (originY - clickY) * scaleY;  // Y座標 [m]
  const y_m = (clickX - originX) * scaleX;  // X座標 [m]

  const newMarker = { x: clickX, y: clickY };
  setMarkers(prev => [...prev, newMarker]);

  setCoords({ x: x_m.toFixed(3), y: y_m.toFixed(3) });

  // ★ ここで ROS publish も可能
  // sendCoordinatesToROS(x_m, y_m);
};

  return (
    <div className="main-unit-movie-wrapper">
      <div
        className="coordinate-area"
        ref={coordAreaRef}
        onClick={handleClick}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
        />
        {markers.map((marker, index) => (
          <div
            key={index}
            className="marker"
            style={{
              left: `${marker.x}px`,
              top: `${marker.y}px`
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
