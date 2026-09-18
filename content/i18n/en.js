// English edition.

export { TOOLS, VARIANTS } from './en-tools.js';
export { PAGES, VARIANT_PAGES } from './en-pages.js';

export const SITE = {
  tagline: 'Convert, compress and inspect — nothing gets uploaded',
  description: 'Convert and compress images, SVG and PDF, and work with JSON, CSV, YAML and text. Everything runs in your browser: no file is ever sent to a server.',
};

export const HOME = {
  h1: 'Convert, compress and inspect — nothing gets uploaded',
  lead: 'Images, SVG, PDF, JSON, CSV and text. Every tool runs inside your browser: the files never leave your computer, and there are no size limits and no queues.',
  body: [
    'Most online converters work the same way: you upload the file, a server processes it, and you download it again. That means waiting for the upload, trusting whoever holds the file, and living with whatever size limit the service imposes.',
    'None of that happens here. The browser already knows how to decode and encode PNG, JPEG and WebP, and the rest arrives as libraries loaded into the page. The file goes nowhere: it is opened, processed and saved from the same tab. You can even pull the network cable once the tool has loaded.',
  ],
};

export const FORMATS = {
  png: {
    name: 'PNG',
    lossless: true,
    alpha: true,
    blurb: 'a lossless format with transparency, ideal for screenshots, logos and drawings with flat areas of colour',
    weak: 'it is heavy with photographs, because it does not exploit the fact that the eye misses fine detail',
  },
  jpeg: {
    name: 'JPEG',
    lossless: false,
    alpha: false,
    blurb: 'the photographic format everyone has, with lossy compression and universal support',
    weak: 'it has no transparency and degrades a little every time it is saved again',
  },
  webp: {
    name: 'WebP',
    lossless: false,
    alpha: true,
    blurb: 'the recommended format for the web since 2020: transparency, lossy and lossless modes, and 25 to 35 % less weight than an equivalent JPEG',
    weak: 'older desktop software still does not always open it',
  },
  avif: {
    name: 'AVIF',
    lossless: false,
    alpha: true,
    blurb: 'the smallest of the four at equal quality, often half the size of a JPEG',
    weak: 'encoding it is slow and support outside the browser is still patchy',
  },
};

export const PAIR_ANGLES = {
  'png-a-webp': 'This is the conversion that pays for itself: a PNG screenshot routinely goes from well over a megabyte to a few tens of kilobytes, and the transparency comes through untouched.',
  'jpg-a-webp': 'Recompressing a JPEG is never free, but WebP is efficient enough that the trade still comes out ahead: at the same perceived quality the file usually lands a third smaller.',
  'png-a-jpg': 'Worth doing when the PNG is really a photograph. Remember JPEG has no alpha channel: anything transparent will be painted with whichever background colour you pick.',
  'jpg-a-png': 'Converting to PNG recovers nothing the JPEG already threw away, and almost always makes the file bigger. It is for when some program only accepts PNG, not for gaining quality.',
  'webp-a-png': 'The way back for older editing software that still cannot open WebP. The result is lossless with respect to the WebP you feed it, but it will weigh considerably more.',
  'webp-a-jpg': 'Useful when the image has to go to a system that only swallows JPEG. If the WebP had transparency, it is flattened onto the background colour before encoding.',
  'png-a-avif': 'AVIF squeezes photographic PNGs harder than anything else on this list, at the cost of a few seconds of computation per image.',
  'jpg-a-avif': 'For photo galleries you already hold as JPEG, AVIF typically halves the weight. Worth serving with a WebP alternative through <picture>.',
  'avif-a-png': 'So that software which cannot yet read AVIF can open the image. The resulting PNG will be far larger: that is the price of going back to a lossless format.',
  'avif-a-jpg': 'The compatibility exit for when an older system does not understand AVIF and a huge PNG will not do either.',
};

export function pairCopy(from, to, angle) {
  return {
    intro: [
      `Convert ${from.name} images to ${to.name} straight in your browser, one at a time or all at once. No file is uploaded anywhere: your own computer does the decoding and the encoding, which is why the conversion is instant and there is no size limit.`,
      angle,
      `${from.name} is ${from.blurb}. The trade-off is that ${from.weak}. ${to.name}, on the other hand, is ${to.blurb}, although ${to.weak}.`,
    ].filter(Boolean),
    faq: [
      {
        q: `Is quality lost going from ${from.name} to ${to.name}?`,
        a: to.lossless
          ? `No. ${to.name} is lossless, so the result holds exactly the pixels it was handed. That said, if the source had already lost quality, that does not come back.`
          : `${to.name} compresses with loss, so yes, a little — controlled by the quality slider. At 80-85 the difference does not show on a screen. Always start from the original so recompressions do not stack up.`,
      },
      {
        q: 'What happens to transparency?',
        a: from.alpha && to.alpha
          ? `It survives: both ${from.name} and ${to.name} have an alpha channel.`
          : from.alpha
            ? `${to.name} has no alpha channel, so transparent areas are painted with the background colour you choose before encoding.`
            : `${from.name} has no transparency, so there is nothing to keep: the result will be opaque either way.`,
      },
      {
        q: 'Can I convert a lot at once?',
        a: 'Yes. Drop in as many files as you like: they are processed in parallel across every core your processor has, and you can download them together as a ZIP.',
      },
      {
        q: 'Are the images sent to a server?',
        a: 'No. Everything happens inside this tab. Once the page has loaded you can disconnect from the network and carry on converting.',
      },
    ],
  };
}

export const pairLabels = (fromLabel, toLabel) => ({
  title: `${fromLabel} to ${toLabel}`,
  desc: `Convert ${fromLabel} images to ${toLabel} in batches, inside your browser.`,
});

export const META = {
  toolTitle: (title, site) => `${title} online, in your browser — ${site}`,
  variantTitle: (title, site) => `${title} online, free and with no upload — ${site}`,
  homeTitle: (site, tagline) => `${site} — ${tagline}`,
};
