import React from 'react'
import useSound from 'use-sound';
import ping from '../assets/ping.wav';

const Ping = () => {
const [play] = useSound(ping, { volume: 0.5 }); // Adjust volume as needed
  return (
  <>
  <h3 className='mt-48'>CLick to ping</h3>
  <button onClick={play}>Play Sound</button>
  </>
  
);
}

export default Ping