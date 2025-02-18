import React from 'react';
import ReactPlayer from 'react-player';
import styled from 'styled-components';
import { useEffect, useRef } from 'react';

const VideoContainer = styled.div`
  osition: relative;
  width: 100%;
  height: 100%; // Ensure this is set to a valid height
  overflow: hidden;

  .react-player {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 0;
  }
`;

const Video = ({ url }) => {
  const videoRef = useRef(null);


  return (
    <VideoContainer id="video" >
      <ReactPlayer
        className="react-player"
        url={url}
        playing={true}
        loop
        muted
        width="100%"
        height="100%"
      />
    </VideoContainer>
  );
};

export default Video; 