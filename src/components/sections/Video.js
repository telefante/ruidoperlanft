import React from 'react';
import ReactPlayer from 'react-player';
import styled from 'styled-components';

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
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
  return (
    <VideoContainer>
      <ReactPlayer
        className="react-player"
        url={url}
        playing
        loop
        muted
        width="100%"
        height="100%"
      />
    </VideoContainer>
  );
};

export default Video; 