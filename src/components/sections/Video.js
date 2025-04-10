import React, { useState, useEffect } from "react";
import styled from "styled-components";

const VideoContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1; /* Ensure video is behind other content */
`;

const ClientOnlyVideo = ({ url }) => {
  const [ReactPlayer, setReactPlayer] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("react-player").then((module) => {
        setReactPlayer(() => module.default);
      });
    }
  }, []);

  if (!ReactPlayer) {
    return <p>Loading video...</p>;
  }

  return <ReactPlayer url={url} playing={true} loop muted={true} controls={false} width="100%" height="100%" />;
};

const Video = ({ url }) => {
  return (
    <VideoContainer>
      <ClientOnlyVideo url={url} />
    </VideoContainer>
  );
};

export default Video;