import { useROS } from './hooks/useROS';
import RobotPanel from './components/RobotPanel';
import './style.css'
import RobotControls from './components/RobotControls';
import MainUnitMovie from './components/MainUnitMovie';
import { useState } from 'react';

function App() {
  const ros = useROS();
  const robots = ['orca_00', 'orca_01', 'orca_02'];
  const [activeRobotName, setActiveRobotName] = useState(null);
  const [yawInputs, setYawInputs] = useState({});

  const updateYawInput = (robotName, yawStr) => {
    setYawInputs(prev => ({
      ...prev,
      [robotName]: parseFloat(yawStr)
    }));
  };

  return (
    <div id="wrapper">
      <div id="controll-block">
        <MainUnitMovie
          ros={ros}
          activeRobotName={activeRobotName}
          yawInputs={yawInputs}
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
            yawInput={yawInputs[robot] || ''}
            onYawInputChange={updateYawInput}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
