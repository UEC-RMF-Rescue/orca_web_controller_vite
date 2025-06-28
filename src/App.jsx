import { useROS } from './hooks/useROS';
import RobotPanel from './components/RobotPanel';
import './style.css'
import RobotControls from './components/RobotControls';
import MainUnitMovie from './components/MainUnitMovie';
import { useState } from 'react';

function App() {
  const ros = useROS();
  const robots = ['orca_00', 'orca_01', 'orca_02'];
  const [activeRobotName, setActiveRobotName] = useState(null)
  const [yawOffsets, setYawOffsets] = useState(null);

  return (
    <div id="wrapper">
      <div id="controll-block">
        <MainUnitMovie
          ros={ros}
          activeRobotName={activeRobotName}
          setActiveRobotName={setActiveRobotName}
          yawOffsets={yawOffsets}
        />
      </div>

      <div id="camera-block">
        {robots.map(robot => (
          <RobotPanel key={robot} robotName={robot} ros={ros} />
        ))}
      </div>

      <div id="robot-control">
        {robots.map(robot => (
          <RobotControls
            key={robot}
            robotName={robot}
            ros={ros}
            activeRobotName={activeRobotName}
            setActiveRobotName={setActiveRobotName}
            yawOffsets={yawOffsets}
            setYawOffsets={setYawOffsets}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
