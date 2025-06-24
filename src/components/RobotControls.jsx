import { useEffect, useState, useRef } from 'react';
import ROSLIB from 'roslib';
import "../styles/RobotControls.css"

export default function RobotControls({robotName, ros}){
    return (
        <div className='wrapper'>
            <div className='button-list'>
                <div className='posctl-buttonlist'>
                    <img src="../../public/target32.jpeg" alt="stylesheet"></img>
                    <img src="../../public/start32.jpeg" alt="stylesheet"></img>
                    <img src="../../public/trash32.jpeg" alt="stylesheet"></img>
                </div>
                <div className='show-rad'>
                    <p>rad</p>
                </div>
            </div>
        </div>
    )
}