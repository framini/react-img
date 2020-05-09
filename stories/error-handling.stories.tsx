import React from 'react';

import { Img } from '../src';

import './example.css';

export default {
  title: 'Error Handling',
};

export const brokenImage = () => {
  return (
    <Img
      alt=""
      src="https://res.cloudinary.com/dhixlxpxv/image/upload/vbr/broken.webp"
      width={500}
      height={362}
    />
  );
};

export const customMessageForBrokenImage = () => {
  return (
    <Img
      alt=""
      src="https://res.cloudinary.com/dhixlxpxv/image/upload/vbr/broken.webp"
      width={500}
      height={362}
      errorMessage="Image is broken :("
    />
  );
};

export const customStylesForBrokenImage = () => {
  return (
    <Img
      alt=""
      src="https://res.cloudinary.com/dhixlxpxv/image/upload/vbr/broken.webp"
      width={500}
      height={362}
      errorProps={{
        style: {
          position: 'absolute',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FBE9E7',
          color: 'red',
          fontFamily: 'monospace',
        },
      }}
    />
  );
};
