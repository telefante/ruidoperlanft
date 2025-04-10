import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import ReactPlayer from "react-player";

const VideoContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
overflow: hidden;
  z-index: -1; /* Ensure video is behind other content */
  opacity: 0.5; /* Adjust opacity for visibility */
`;

const Video = ({ url }) => {
  const playerRef = useRef(null);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  useEffect(() => {
    // Autoplay the video when the component mounts
    if (playerRef.current) {
      const attemptPlay = () => {
        const player = playerRef.current.getInternalPlayer();
        if (player) {
          player.play().catch(error => {
            console.error("Autoplay prevented:", error);
            // Attempt to play again on user interaction (e.g., click)
            const playHandler = () => {
              player.play().catch(error => {
                console.error("Autoplay prevented after interaction:", error);
              });
              document.removeEventListener('click', playHandler); // Remove after first attempt
            };
            document.addEventListener('click', playHandler);
          });
        }
      };

      if (isMobile) {
        // Attempt to play on mobile after a delay
        setTimeout(attemptPlay, 500);
      } else {
        attemptPlay();
      }
    }
  }, [url, isMobile]);

  return (
    <VideoContainer>
      {typeof window !== "undefined" ? (
        <ReactPlayer
          ref={playerRef}
          url={url}
          playing={false}
          loop
          muted={true}
          controls={false}
          width="100%"
           height="100%"
        />
      ) : (
        <p>Loading video...</p>
      )}
    </VideoContainer>
  );
};

export default Video;