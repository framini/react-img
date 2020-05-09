import React from 'react';

import { Img } from '../src';

import './example.css';

export default {
  title: 'Basic Usage',
};

export const basicUsage = () => (
  <Img
    alt=""
    placeholderSrc="https://res.cloudinary.com/dhixlxpxv/image/upload/e_blur:3000,w_500/v1589040757/space_wzvnu7.webp"
    src="https://res.cloudinary.com/dhixlxpxv/image/upload/w_500/v1589040757/space_wzvnu7.webp"
    // It's recommened to specify dimensions when using loading="lazy"
    // @see https://crbug.com/954323
    width={500}
    height={362}
  />
);

export const pictureElement = () => (
  <div className="picture-example">
    <Img
      alt=""
      placeholderSrc="https://res.cloudinary.com/dhixlxpxv/image/upload/e_blur:3000,w_500/v1589040757/space_wzvnu7.webp"
      fallback="https://res.cloudinary.com/dhixlxpxv/image/upload/w_200/v1589040757/space_wzvnu7.webp"
      sources={[
        {
          srcSet:
            'https://res.cloudinary.com/dhixlxpxv/image/upload/w_600/v1589040757/space_wzvnu7.webp',
          media: '(min-width: 600px)',
        },
        {
          srcSet:
            'https://res.cloudinary.com/dhixlxpxv/image/upload/w_400/v1589040757/space_wzvnu7.webp',
          media: '(min-width: 300px)',
        },
      ]}
      width={500}
    />
  </div>
);
