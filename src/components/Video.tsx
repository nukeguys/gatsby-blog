import React, { CSSProperties } from 'react';

interface IProps {
  videoSrcURL: string;
  videoTitle: string;
  style: Omit<CSSProperties, 'position' | 'paddingTop'>;
}

export default function Video({ videoSrcURL, videoTitle, style }: IProps) {
  const videoStyle: CSSProperties = {
    ...style,
    position: 'relative',
    paddingTop: '56.25%',
  };
  return (
    <div className="video" style={videoStyle}>
      <iframe
        src={videoSrcURL}
        title={videoTitle}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        width={560}
        height={315}
        frameBorder="0"
        allowFullScreen
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          margin: '0 auto',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}
