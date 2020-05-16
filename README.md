# react-img

React component for rendering images in a performant and good looking way. This is heavily inspired by [gatsby-images](https://www.gatsbyjs.org/packages/gatsby-image) but it only includes the React layer, which means, it doesn't include any built-in solutions for generating image sources. The main purpose of this package is to provide the same great UX provided by `gatsby-images` but leaving the task of providing the image sources to the consumer. Internally, it makes use of the new [`loading`](https://addyosmani.com/blog/lazy-loading/) attribute for browsers that support it, and the [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) for browser that don't. The end result will be very similar to the experience provided by Medium on their images.

</a><a href="https://bundlephobia.com/result?p=@framini/react-img@latest" target="\_parent">
<img alt="" src="https://badgen.net/bundlephobia/minzip/@framini/react-img@latest" />
</a>

## Install

With Yarn

```
yarn install @framini/react-img
```

With NPM

```
npm install @framini/react-img
```

## Usage

As of the time writing (16-05-2020), when there's no [art direction](https://developer.mozilla.org/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images#Art_direction) involved, `<img>` is preferred over `<picture>` since we can optimize how they load by specifying their `width` and `height`. You could read more about it [here](https://web.dev/optimize-cls/) or watch this great [video by Jen Simmons](https://www.youtube.com/watch?v=4-d_SoCHeWE&list=WL) which also covers what might be the next steps for optimizing the `<picture>` tag. TL;DR version of why `width` and `height` are needed: They are used for calculating the aspect ratio of the image.

```js
import { Img } from '@framini/react-img';

const SomeComponent = () => {
  return (
    <Img
      alt=""
      placeholderSrc="https://res.cloudinary.com/dhixlxpxv/image/upload/e_blur:3000,w_500/v1589040757/space_wzvnu7.webp"
      src="https://res.cloudinary.com/dhixlxpxv/image/upload/w_500/v1589040757/space_wzvnu7.webp"
      width={500}
      height={362}
    />
  );
};
```

When art direction is needed, a `<picture>` tag can be rendered like this:

```css
.picture-example {
  width: 200px;
  height: 200px;
}

@media (min-width: 300px) {
  .picture-example {
    width: 300px;
    height: 600px;
  }
}

@media (min-width: 500px) {
  .picture-example {
    width: 500px;
    height: 600px;
  }
}
```

```js
import { Img } from '@framini/react-img';

const SomeComponent = () => {
  return (
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
              'https://res.cloudinary.com/dhixlxpxv/image/upload/w_400,h_400/v1589040757/space_wzvnu7.webp',
            media: '(min-width: 300px)',
          },
        ]}
      />
    </div>
  );
};
```

## Example

- [Demo Site](https://framini.github.io/react-img/)

- Or you can play around with it locally by running `yarn storybook`.
