import React from 'react';

const isBrowser = typeof window !== `undefined`;

const hasNativeLazyLoadSupport =
  typeof HTMLImageElement !== `undefined` &&
  `loading` in HTMLImageElement.prototype;

const hasIOSupport = isBrowser && window.IntersectionObserver;

let io: IntersectionObserver;
const listeners = new WeakMap();

const getIO = () => {
  if (
    typeof io === `undefined` &&
    typeof window !== `undefined` &&
    window.IntersectionObserver
  ) {
    io = new window.IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (listeners.has(entry.target)) {
            const cb = listeners.get(entry.target);
            // Edge doesn't currently support isIntersecting, so also test for an intersectionRatio > 0
            if (entry.isIntersecting || entry.intersectionRatio > 0) {
              io.unobserve(entry.target);
              listeners.delete(entry.target);
              cb();
            }
          }
        });
      },
      { rootMargin: `200px` }
    );
  }

  return io;
};

const listenToIntersections = (el: HTMLElement | null, cb: () => void) => {
  if (el === null) {
    return;
  }

  const observer = getIO();

  if (observer) {
    observer.observe(el);
    listeners.set(el, cb);
  }

  return () => {
    observer.unobserve(el);
    listeners.delete(el);
  };
};

const noscriptImg = (props: ImgElementProps) => {
  // Check if prop exists before adding each attribute to the string
  // output below to prevent HTML validation issues caused by empty
  // values like width="" and height=""
  const src = props.src ? `src="${props.src}" ` : `src="" `; // required attribute
  const sizes = props.sizes ? `sizes="${props.sizes}" ` : ``;
  const srcSet = props.srcSet ? `srcset="${props.srcSet}" ` : ``;
  const title = props.title ? `title="${props.title}" ` : ``;
  const alt = props.alt ? `alt="${props.alt}" ` : `alt="" `; // required attribute
  const width = props.width ? `width="${props.width}" ` : ``;
  const height = props.height ? `height="${props.height}" ` : ``;
  const crossOrigin = props.crossOrigin
    ? `crossorigin="${props.crossOrigin}" `
    : ``;
  const loading = props.loading ? `loading="${props.loading}" ` : ``;
  const draggable = props.draggable ? `draggable="${props.draggable}" ` : ``;

  return `<img ${loading}${width}${height}${sizes}${srcSet}${src}${alt}${title}${crossOrigin}${draggable}style="position:absolute;top:0;left:0;opacity:1;width:100%;height:100%;object-fit:cover;object-position:center"/>`;
};

const noscriptPicture = (props: PictureElementProps) => {
  const sources = props.sources.reduce((reducer, item) => {
    const media = item.media ? `media="${item.media}"` : '';
    // TODO: add remaining attributes

    return `${reducer}<source srcSet="${item.srcSet}" ${media}>`;
  }, ``);

  return `<picture>${sources}${noscriptImg(props)}</picture>`;
};

const imageCache: Record<string, boolean> = {};
const inImageCache = (el: HTMLImageElement | null) => {
  if (el === null) {
    return false;
  }

  // Will get the currently active image source
  const src = el.currentSrc;

  return imageCache[src] ?? false;
};

type ProgressImageStatus = 'idle' | 'load' | 'loaded';

const useImage = ({
  isCritical,
  seenBefore,
}: {
  // `isCritical` means that we shouldn't delay its render
  isCritical?: boolean;
  seenBefore?: boolean;
}) => {
  // we use `firstLoad` as a safe guard to avoid rendering different
  // things on the server/client
  const [firstLoad, setFirstLoad] = React.useState(true);
  const useIOSupport =
    !hasNativeLazyLoadSupport && hasIOSupport && !isCritical && !seenBefore;

  const initialIsVisible =
    isCritical || (!firstLoad && (hasNativeLazyLoadSupport || !useIOSupport));

  const initialStatus = initialIsVisible ? 'load' : 'idle';

  const [status, setStatus] = React.useState<ProgressImageStatus>(
    initialStatus
  );

  // For browsers with IntersectionObserver support the image might
  // not be visible on the initial render so we'll also rely on the
  // `status` value. If it's anything other than `idle` it means the
  // image must be visible
  const isVisible = initialIsVisible || status !== 'idle' || seenBefore;

  React.useEffect(() => {
    setFirstLoad(false);
  }, []);

  return { status, isVisible, useIOSupport, setStatus };
};

const BaseImg = React.forwardRef(
  (
    {
      loading = 'lazy',
      ...restProps
    }: React.ImgHTMLAttributes<HTMLImageElement> & {
      alt: string;
      loading?: 'lazy' | 'eager' | 'auto';
    },
    ref
  ) => {
    return (
      // @ts-ignore
      <img ref={ref} {...restProps} loading={loading} alt={restProps.alt} />
    );
  }
);

BaseImg.displayName = 'Img';

type PictureSource = React.DetailedHTMLProps<
  React.SourceHTMLAttributes<HTMLSourceElement>,
  HTMLSourceElement
>;

type CommonImgProps = {
  placeholderSrc?: string;
  loading?: 'eager' | 'lazy' | 'auto';
  alt: string;
  objectPosition?: React.CSSProperties['objectPosition'];
};

type ImgElementProps = CommonImgProps &
  React.ImgHTMLAttributes<HTMLImageElement>;
type PictureElementProps = {
  sources: PictureSource[];
  fallback: string;
} & ImgElementProps;

type ImgBaseProps = ImgElementProps | PictureElementProps;

type ImgOverload = {
  (props: ImgElementProps): JSX.Element;
  (props: PictureElementProps): JSX.Element;
};

const isPictureElement = (props: ImgBaseProps): props is PictureElementProps =>
  'sources' in props && 'fallback' in props;

const isImageElement = (props: ImgBaseProps): props is ImgElementProps =>
  !isPictureElement(props);

const PictureElement = (props: PictureElementProps) => {
  return (
    <picture>
      {props.sources.map((source, i) => {
        return <source key={i} {...source} />;
      })}
      {props.children}
    </picture>
  );
};

export const Img: ImgOverload = ({
  placeholderSrc,
  objectPosition = 'center center',
  ...restProps
}: ImgBaseProps) => {
  const elRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);

  // Will define if the images gets rendered right away or not
  const isCritical = restProps.loading === 'eager';

  // If the images has been seen before we'll render it directly
  const seenBefore = isBrowser && inImageCache(imageRef.current);

  const { status, isVisible, useIOSupport, setStatus } = useImage({
    isCritical,
    seenBefore,
  });

  // Needed for users loading the page without JS enabled
  const addNoScript = !isCritical;

  React.useEffect(() => {
    if (!imageRef.current || !isVisible || status !== 'loaded') {
      return;
    }

    imageCache[imageRef.current.currentSrc] = true;
  }, [imageRef, isVisible, status]);

  React.useEffect(() => {
    // If the browser doesn't support IntersectionObserver then
    // there's nothing else to do here
    if (useIOSupport) {
      // This code only makes sense for browsers *not* supporting the
      // native `lazy-load` for images. At the time of writing
      // (2020-05-09) only Chrome has it enabled by default.
      const cleanupListeners = listenToIntersections(elRef.current, () => {
        setStatus('load');
      });

      return () => {
        cleanupListeners && cleanupListeners();
      };
    }

    return;
  }, [setStatus, useIOSupport]);

  const imgProps = {
    onLoad: () => {
      setStatus('loaded');
    },
    width: restProps.width,
    style: {
      position: 'absolute',
      top: '0px',
      left: '0px',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition,
      opacity: status === 'loaded' ? 1 : 0,
      transition: seenBefore
        ? 'opacity 200ms ease 0s'
        : 'opacity 500ms ease 0s',
    },
    ref: imageRef,
  };

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        width: '100%',
      }}
      ref={elRef}
    >
      {placeholderSrc && (
        <img
          aria-hidden="true"
          src={placeholderSrc}
          alt={status === 'loaded' ? '' : restProps.alt}
          style={{
            position: 'absolute',
            top: '0px',
            left: '0px',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition,
            opacity: status === 'loaded' ? 0 : 1,
            transition: 'opacity 200ms ease 500ms',
          }}
        />
      )}

      {isVisible && isImageElement(restProps) && (
        <BaseImg {...restProps} {...(imgProps as any)} />
      )}

      {isVisible && isPictureElement(restProps) && (
        <PictureElement {...restProps}>
          <BaseImg
            {...restProps}
            {...(imgProps as any)}
            src={restProps.fallback}
          />
        </PictureElement>
      )}

      {addNoScript && isImageElement(restProps) && (
        <noscript
          dangerouslySetInnerHTML={{
            __html: noscriptImg(restProps),
          }}
        />
      )}

      {addNoScript && isPictureElement(restProps) && (
        <noscript
          dangerouslySetInnerHTML={{
            __html: noscriptPicture(restProps),
          }}
        />
      )}
    </div>
  );
};
