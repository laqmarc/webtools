// English page prose.

export const PAGES = {
  // -------------------------------------------------------------- image
  'image-convert': {
    intro: [
      'Convert PNG, JPG, WebP and AVIF in any direction, one at a time or fifty at once. The decoding and encoding are done by the browser itself, so the images are never uploaded and the conversion is close to instant.',
      'Each format has its job: PNG for graphics with flat areas of colour, JPEG for maximum compatibility, WebP as the default for the web, and AVIF when weight matters more than computation time.',
    ],
    steps: [
      'Drag the images onto the area above, or click to pick them.',
      'Choose the target format and, where it applies, the quality.',
      'Press “Process” and download the results one by one or together as a ZIP.',
    ],
    faq: [
      { q: 'Which format should I use on the web?', a: 'WebP in nearly every case. Every browser has supported it since 2020 and it weighs 25 to 35 % less than a JPEG of equivalent quality. AVIF is smaller still, but takes far longer to encode.' },
      { q: 'Is quality lost when converting?', a: 'It depends on the target. PNG and lossless WebP keep the exact pixels. JPEG, ordinary WebP and AVIF recompress, and the loss accumulates: always convert from the original, never from an already-compressed copy.' },
      { q: 'What happens to transparency?', a: 'PNG, WebP and AVIF keep it. JPEG has none, so the alpha channel is flattened onto the background colour you choose before encoding.' },
      { q: 'Is there a size or file-count limit?', a: 'None that we impose. The only limit is the tab’s memory, because images are decoded whole. With very large files it is worth working in batches.' },
    ],
  },
  'image-compress': {
    intro: [
      'Bring image weight down in one of two ways. You can fix a quality and see what comes out, or say how much the file is allowed to weigh and let the page get there on its own.',
      'The second mode runs a binary search over the quality until it finds the highest one that fits the budget, and if even the lowest sensible quality is too big, it shrinks the pixel dimensions in 20 % steps until it fits.',
    ],
    steps: [
      'Drop in the images you want to slim down.',
      'Choose whether to fix the quality or a maximum size in kilobytes.',
      'Check the percentage-saved column and download whatever convinces you.',
    ],
    faq: [
      { q: 'What quality is good enough?', a: 'Between 75 and 85 in WebP is where most people cannot tell the result from the original. Below 60 you start to see artefacts in gradients and around text.' },
      { q: 'Why does it not use all of the size limit I asked for?', a: 'Because the search never goes above quality 95. Past that point the file grows fast with no visible gain, so if 95 already fits, it stops there.' },
      { q: 'Can I compress without changing format?', a: 'Yes, choose “Keep the original”. It works well with JPEG and WebP; with PNG the gain is small, because it is a lossless format and re-encoding it frees little.' },
      { q: 'What does the maximum width do?', a: 'It shrinks the image before compressing. It is usually the most effective lever of all: serving a 4000 px photo on a page that shows it at 800 px wastes 96 % of the pixels.' },
    ],
  },
  'image-resize': {
    intro: [
      'Change image dimensions by giving a width, a height, or both. Fill in only one box and the other is worked out to keep the proportions.',
      'When you give both, you decide what happens to the difference in ratio: fit the whole image inside, fill the rectangle and crop the overflow, or stretch it to the exact size.',
    ],
    steps: ['Add the images.', 'Type a width, a height or both, and choose how they should fit.', 'Process and download.'],
    faq: [
      { q: 'Why are small images not enlarged?', a: 'Because “do not enlarge” is on. Upscaling adds no detail, it only interpolates pixels and the result looks soft. Turn it off if you genuinely need the larger size.' },
      { q: 'What is the difference between “inside” and “fill and crop”?', a: '“Inside” fits the whole image within the measurements you give, so the result may be smaller on one side. “Fill and crop” covers the whole rectangle and trims the overflow from the sides.' },
      { q: 'Will it look blurry?', a: 'Scaling uses the browser’s high-quality filter, which is good at shrinking. For very aggressive reductions, going in two passes sometimes keeps more bite.' },
    ],
  },
  'image-crop': {
    intro: [
      'Draw the crop with the mouse on the picture, with a rule-of-thirds grid over it and the pixel measurements updating as you drag. You can start fresh with a new rectangle, move the existing one, or pull its corners.',
      'The real point, though, is the batch: load twenty photos, leave the box ticked, and the same relative crop lands on all of them. Because it is stored as proportions rather than pixels, it works even when the images are different sizes.',
    ],
    steps: [
      'Drag in the images; the first one appears on the canvas.',
      'Draw or adjust the rectangle, and lock an aspect ratio if you need a specific one.',
      'Press “Crop” and download the result, as a ZIP if there is more than one.',
    ],
    faq: [
      { q: 'How do I get a perfect square?', a: 'Choose 1:1 in the aspect ratio. From then on the rectangle keeps its proportions as you drag, and whatever was already there is adjusted around its own centre.' },
      { q: 'My photos are different sizes — does it still work?', a: 'Yes. The crop is stored as a fraction of each image, so “the middle third” is the middle third of each one, not a pixel rectangle that would fall outside some of them.' },
      { q: 'Can I crop one differently from the rest?', a: 'Untick “Apply the same crop to all” and only the image selected in the thumbnail strip is cropped.' },
    ],
  },
  'image-rotate': {
    intro: [
      'Rotate images in quarter turns and flip them horizontally or vertically. Both can be combined in a single pass.',
      'Unlike turning a photo in the system viewer, the rotation here is applied to the actual pixels, not to an orientation tag that every program then interprets as it pleases.',
    ],
    steps: ['Add the badly oriented images.', 'Choose the angle and, if needed, the flip.', 'Process and download.'],
    faq: [
      { q: 'Why do my photos already look upright before I rotate them?', a: 'Because the page reads the camera’s EXIF orientation and applies it when opening the image. What you see in the thumbnail is therefore what everyone else will see.' },
      { q: 'Is quality lost when rotating?', a: 'Rotating by multiples of 90 degrees only rearranges pixels, so no. Any loss comes from re-encoding into a lossy format.' },
      { q: 'Can I rotate by an arbitrary angle?', a: 'No. Free angles force interpolation and a decision about the empty corners, and that needs a preview this tool does not have.' },
    ],
  },
  'image-strip': {
    intro: [
      'Photos taken on a phone carry a hidden payload: the date, the handset model, the camera settings and, very often, the exact GPS coordinates of where they were taken. None of it shows when you open the image, but it is there, and it travels with the file.',
      'This tool re-encodes the image from the bare pixels, so the resulting file carries no metadata at all. The EXIF orientation is applied before being discarded, so the photo does not come out sideways.',
    ],
    steps: ['Add the photos you want cleaned.', 'Leave the quality high if you want the result to look identical.', 'Process and download the clean files.'],
    faq: [
      { q: 'Do the GPS coordinates really disappear?', a: 'Yes. The new file is built from scratch out of the pixel matrix, and none of the original’s EXIF, IPTC or XMP fields are copied across.' },
      { q: 'Is the colour profile removed too?', a: 'Yes, and that is the trade-off to watch. If the photo carried a wide profile such as Display P3, the result will be read as sRGB and very saturated colours may shift slightly.' },
      { q: 'Will the file size change?', a: 'A little, in either direction. A few kilobytes of metadata go, but the re-encoding may not match the camera’s exactly. At quality 95 the visual difference is nil.' },
    ],
  },
  'image-watermark': {
    intro: [
      'Put a signature or a notice over your photos, in a corner or tiled diagonally across the whole image. In batches, which is where it earns its keep: fifty product shots with the same mark cost the same as one.',
      'The size is given as a percentage of the short side rather than in pixels, so the mark looks the same on a portrait phone photo as on an eight-thousand-pixel panorama.',
    ],
    steps: ['Drag in the photos.', 'Type the text and choose its position, size and opacity.', 'Process and download.'],
    faq: [
      { q: 'Does it actually protect the image?', a: 'It deters, which is not the same thing. A mark in the corner is cropped out in a second; one tiled over the image is far more annoying to remove, but not impossible either.' },
      { q: 'Can I use a logo instead of text?', a: 'Not yet — the mark is text. In the meantime you can compose the logo with the text in an editor and treat that as an image.' },
      { q: 'Why is the mark unreadable on some photos?', a: 'Because the colour matches the background. Leave the shadow on, which is exactly what it is for, or pick a colour that contrasts.' },
    ],
  },
  'image-exif': {
    intro: [
      'See everything a photograph is carrying: camera and lens model, aperture, shutter speed, ISO, dates and, if location was on, the exact coordinates of where it was taken.',
      'It is the other half of “Strip metadata”: first you look at what is there, then you decide whether it bothers you. Nothing leaves the tab, which with personal photos is not a small detail.',
    ],
    steps: ['Drop in a photo.', 'Read the data grouped by topic.', 'If there is GPS, you get a prominent warning.'],
    faq: [
      { q: 'Why does my photo have no metadata?', a: 'Because something stripped it along the way. WhatsApp, Instagram and most networks remove it on upload, and a screenshot never had any.' },
      { q: 'What exactly should worry me?', a: 'The GPS coordinates, especially on photos taken at home. Also the date and, in professional settings, the camera body’s serial number, which identifies the device.' },
      { q: 'How do I remove it?', a: 'With “Strip metadata”, which re-encodes the image from the bare pixels and copies no fields.' },
    ],
  },
  favicons: {
    intro: [
      'One image gives you the whole set: PNG icons at 16, 32, 48, 192 and 512 pixels, the 180 one iOS asks for, and a real favicon.ico with three sizes inside it.',
      'The image is cropped square from the centre and scaled with the browser’s high-quality filter. With the HTML snippet included, you only have to copy four lines into your <head>.',
    ],
    steps: ['Drop in the logo, the squarer the better.', 'If you want a background or some padding, set it.', 'Process and download the ZIP with everything in it.'],
    faq: [
      { q: 'How big should the source image be?', a: 'At least 512 × 512 pixels, and square if possible. If it is an SVG, turn it into a large PNG first with “SVG to PNG”, so you control the resolution.' },
      { q: 'Is the .ico still needed?', a: 'Yes, for browsers and sites that still ask for it at the root by default. It weighs almost nothing and saves you failed requests in the server log.' },
      { q: 'Why is it illegible at 16 pixels?', a: 'Because a logo with fine detail does not survive sixteen pixels. That size usually needs a simplified version, often just the initial or the symbol.' },
    ],
  },
  'images-to-gif': {
    intro: [
      'Make an animated GIF from a series of images. The order is the order of the list, and since rows can be dragged, reordering frames is a matter of moving them.',
      'Frames are fitted into a shared canvas, centred and undistorted, so mixing images of different sizes does not make the animation jump about.',
    ],
    steps: ['Drag the images in the order you want.', 'Set the frame duration and the width.', 'Combine and download the GIF.'],
    faq: [
      { q: 'Why is it so heavy?', a: 'Because GIF is a format from the 1980s: lossless, limited to 256 colours and with no compression between frames. Drop the width, trim the palette or use fewer frames.' },
      { q: 'What frame duration should I use?', a: '100 ms is ten images per second, which looks smooth without blowing up the weight. Below 20 ms many browsers impose their own minimum anyway.' },
      { q: 'What does “play backwards at the end” do?', a: 'It appends the frames in reverse, so the animation goes out and back instead of jumping abruptly when it loops.' },
    ],
  },
  'remove-background': {
    intro: [
      'Cut the subject out of a photograph and leave the background transparent, or swap it for a solid colour. Good for product shots, portraits and anything that has to sit on top of another design.',
      'A neural network (u2netp) does the work, running on your machine through ONNX Runtime compiled to WebAssembly. The model weighs 4.4 MB and downloads once; after that the photo never leaves the tab.',
      'Do not expect the result of an hour with masks in Photoshop. Do expect a clean, usable cut-out in a few seconds, which for most purposes is exactly what was needed.',
    ],
    steps: ['Drag in the photos.', 'Choose whether the background goes transparent or takes a colour.', 'Soft edge for hair and fur; clean edge for objects with a defined outline.'],
    faq: [
      { q: 'When does it work well and when not?', a: 'Very well with a clear subject against a distinct background: people, products, animals. Less well with scenes that have no obvious protagonist, with very thin objects, or when subject and background share a colour.' },
      { q: 'What is the difference between soft and clean edges?', a: 'Soft keeps the partial transparency at the boundary, which is what stops hair looking like a silhouette cut out with scissors. Clean decides for each pixel whether it is in or out, and suits hard-edged objects.' },
      { q: 'Why is the first run so slow?', a: 'Because the inference engine and the model have to be downloaded and compiled. From the second image onwards everything is in memory and it is much faster.' },
    ],
  },

  // ------------------------------------------------------------- vector
  'svg-optimize': {
    intro: [
      'SVGs that come out of Illustrator, Figma or Inkscape drag along a lot the browser does not need: editor comments, metadata blocks, proprietary attributes, generated identifiers and coordinates with twelve decimal places.',
      'This page runs SVGO over them with the default preset plus a few switches worth exposing. On icons exported from a design tool it routinely cuts 40 to 70 % of the weight without changing a pixel of the drawing.',
    ],
    steps: ['Drag in the SVGs, as many as you like.', 'Adjust the path decimals if you need more or less precision.', 'Process and check how far each one dropped before downloading.'],
    faq: [
      { q: 'How many decimals should I keep in paths?', a: 'Three is fine for almost everything. With small icons you can go to one or two and save more still; if the drawing has long smooth curves, going too low can make visible corners appear.' },
      { q: 'Why is there an option to drop width and height?', a: 'Because an icon that should scale with CSS is better off with only a viewBox: with no fixed size it takes whatever the container gives it. If you are inlining the SVG on its own, keep them.' },
      { q: 'What does the id prefix do?', a: 'It puts the file name in front. If you put several SVGs on one page and each has a gradient called "a", they collide; with the prefix each keeps its own.' },
    ],
  },
  'svg-to-png': {
    intro: [
      'Rasterise an SVG at whatever size you need. Because the source is vector, you can ask for any resolution without pixelation: the same icon serves a 32 px favicon and a 4000 px poster.',
      'The size can be given in pixels or as a multiplier of the viewBox, which is the convenient way to pull @2x and @3x versions of a whole icon set in one pass.',
    ],
    steps: ['Add the SVGs.', 'Give a width in pixels, or leave it at zero and use the scale.', 'Choose whether you want a transparent background, then process.'],
    faq: [
      { q: 'Why do I get 300×150?', a: 'That is the size a browser assigns to an SVG with no width, height or viewBox. Add a viewBox to the file, or give an explicit width here.' },
      { q: 'The lettering is missing — what happened?', a: 'An SVG rasterised inside a page cannot load external fonts or outside files. Convert the text to curves in your editor before exporting.' },
      { q: 'Can I get a WebP instead of a PNG?', a: 'Yes, the format selector offers PNG, WebP and JPEG. For icons with transparency, PNG or WebP; for illustrations on a solid background, WebP weighs far less.' },
    ],
  },

  // ---------------------------------------------------------------- pdf
  'pdf-compress': {
    intro: [
      'In a scanned or photographed PDF, nearly all the weight is in the images inside it. This tool finds them one by one, re-encodes them smaller and puts them back, without touching anything else in the document.',
      'That is what separates it from most online compressors, which flatten every page into a photograph: here the text is still text you can select and search, the links still work and the structure survives. On a typical scan the reduction runs from 60 to 90 %.',
      'Images that cannot be re-encoded safely — transparency masks, JPEG 2000, CMYK, one-bit bitmaps — are left exactly as they were. A silently mangled image would be far worse than a file that did not shrink as much.',
    ],
    steps: ['Drop in the PDF, or several.', 'Pick a quality, or simply say how much it may weigh.', 'Download the result and check it before you throw the original away.'],
    faq: [
      { q: 'Is the selectable text lost?', a: 'No. Only the embedded images are replaced; the text layer, bookmarks and links are untouched. If the PDF is a scan with no OCR, it never had any.' },
      { q: 'When should I use the rasterising mode?', a: 'When weight matters more than everything else. It redraws each page as a photograph: the drop is dramatic, but the text stops being selectable and searchable, and there is no way back.' },
      { q: 'My PDF barely shrinks — why?', a: 'Because the weight is not in images. A text-and-vector document from a word processor is already compact: there is nothing to squeeze, and the tool says so next to the result.' },
      { q: 'Is greyscale worth it?', a: 'Very much, if the document is scanned text. It drops the colour information, which on a white page with black type is mostly sensor noise, and the result often halves again.' },
    ],
  },
  'pdf-organize': {
    intro: [
      'The other PDF tools ask you to type “1-3, 7” at a document you cannot see. This one draws it for you: every page as a thumbnail, to drag where it belongs, turn one at a time and drop the ones that are in the way.',
      'Once the result is in front of you, you export. The new PDF is built by copying the original pages in the order you left them, so the text, the links and the quality are untouched.',
    ],
    steps: ['Drop in the PDF and wait for the thumbnails.', 'Drag the pages about, turn the crooked ones and drop the spares.', 'Press “Export the PDF”.'],
    faq: [
      { q: 'Can I undo?', a: 'The “Back to the original” button restores the order, the rotations and the dropped pages in one go. And until you export, the file on your disk has not been touched.' },
      { q: 'Why do the thumbnails take a while?', a: 'Because each page is genuinely drawn by the rendering engine, exactly as a PDF reader would. On long documents they appear as they are produced.' },
      { q: 'Is quality lost?', a: 'None. The thumbnails are only for looking at; the export copies the original pages without redrawing them.' },
    ],
  },
  'pdf-to-images': {
    intro: [
      'Turn each page of a PDF into an image, at whatever resolution you tell it. Useful for sending a single page over a messaging app, dropping it into a presentation, or uploading it somewhere that will not take PDFs.',
      'Resolution is asked for in dots per inch, which is the way of saying it that does not depend on paper size: 150 dpi reads comfortably on screen and 300 is print quality.',
    ],
    steps: ['Drop in the PDF.', 'Choose the format and resolution, and a page range if you want one.', 'Process and download them singly or as a ZIP.'],
    faq: [
      { q: 'What resolution should I use?', a: '150 dpi for screen, 300 for print. Above 300 the file grows a lot and the improvement is hard to see when the source is vector text.' },
      { q: 'Which format suits me?', a: 'PNG if the page is text and graphics, which is the usual case and where JPEG leaves mush around the letters. JPEG or WebP if the page is mostly a photograph.' },
      { q: 'Why did a very large page come out smaller than I asked?', a: 'There is a pixel ceiling per page so the tab does not run out of memory. An A0 at 600 dpi would be a gigapixel; in that case the scale is lowered by exactly as much as needed.' },
    ],
  },
  'pdf-to-text': {
    intro: [
      'Pull the text out of a PDF to copy it, search it or feed it to something else. It reads the text layer the document already carries — the same one you select with the mouse in a reader.',
      'A PDF does not store paragraphs: it stores runs of text with a position. Here they are grouped by their height on the page, which is the closest thing to what you read; anything cleverer starts guessing at columns and gets it wrong.',
    ],
    steps: ['Drop in the PDF.', 'Choose whether to join the wrapped lines.', 'Download the .txt or copy it.'],
    faq: [
      { q: 'It gives me nothing — why?', a: 'Because the PDF is a scan: pages that are photographs, with no text layer at all. Reading those needs OCR, which is a different thing and not what this tool does.' },
      { q: 'What does joining wrapped lines do?', a: 'It merges the line breaks that exist only because the page ran out, and keeps the ones that separate real paragraphs. Turn it off if you want the text exactly as laid out.' },
      { q: 'Does it respect columns and tables?', a: 'Not really. The text comes out in the order it sits in the document, which on a two-column page is often not the reading order.' },
    ],
  },
  'pdf-extract-images': {
    intro: [
      'Recover the photographs and graphics inside a PDF as separate files. These are not screenshots of the pages: they are the original images, exactly as they were embedded.',
      'With “as they are in the PDF”, JPEG photographs come out byte for byte as they sit there, with no re-encoding at all. The rest are redrawn, because their internal format is not an image file that can be saved as-is.',
    ],
    steps: ['Drop in the PDF.', 'Raise the minimum width if you do not want icons and decorative rules.', 'Process and download them as a ZIP.'],
    faq: [
      { q: 'Why do fewer come out than I can see?', a: 'Two reasons. The minimum-width filter discards the small ones, and images in formats that cannot be read safely are left alone rather than risking a mangled save.' },
      { q: 'Do they come out at the original resolution?', a: 'Yes. What is extracted is the image as it sits in the document, which often has far more resolution than shows on the printed page.' },
      { q: 'What if I want the whole pages instead?', a: 'Then you want “PDF to images”, which draws each complete page, text and all.' },
    ],
  },
  'pdf-merge': {
    intro: [
      'Join several PDFs into one, keeping the pages as they are: the text stays selectable, internal links keep working and nothing is re-encoded along the way.',
      'The order is the order of the list, which is the order you picked them in, but you can also ask for them to be sorted by file name — usually what you want when the documents are called 01, 02, 03.',
    ],
    steps: ['Drag in all the PDFs you want to join.', 'Check the order, or switch to sorting by name.', 'Press “Combine” and download the result.'],
    faq: [
      { q: 'Is quality lost?', a: 'None. Pages are copied whole from one document to the other; they are not redrawn and any images they contain are not recompressed.' },
      { q: 'Can I merge password-protected PDFs?', a: 'Only ones with permission restrictions, which are ignored. Files that ask for a password to open are encrypted and cannot be read without it.' },
      { q: 'What happens to bookmarks and forms?', a: 'Form fields and bookmarks from the original documents do not carry over. If the PDF is a form that must stay fillable, merge it with desktop software.' },
    ],
  },
  'pdf-split': {
    intro: [
      'Split a PDF three ways: one page per file, blocks of a fixed number of pages, or the specific ranges you name.',
      'The result is one file per piece, and when there is more than one they can be downloaded together in a ZIP with the names already numbered.',
    ],
    steps: ['Add the PDF.', 'Choose how to split it and, where relevant, type the ranges.', 'Process and download the pieces.'],
    faq: [
      { q: 'How are ranges written?', a: 'Comma separated, with a hyphen for intervals: “1-3, 7, 10-12” produces three files. Each comma-separated group becomes one output document.' },
      { q: 'Can ranges overlap?', a: 'Yes. Nothing stops you asking for “1-5, 3-8”; page 3 will appear in both files.' },
      { q: 'What if I ask for a page that does not exist?', a: 'Ranges are clipped to the last page of the document. If it has 10 and you ask for “8-50”, you get 8 to 10.' },
    ],
  },
  'pdf-rotate': {
    intro: [
      'Fix pages that were scanned sideways or upside down. The rotation is added to whatever the page already has, so the result is what you see in the reader, not a sum you have to work out yourself.',
      'You can turn the whole document or only a few pages, which is the usual case when the scanner has only turned the landscape sheets.',
    ],
    steps: ['Add the PDF.', 'Choose the angle and, if it is not all of them, type the pages.', 'Process and download.'],
    faq: [
      { q: 'How do I name only some pages?', a: 'With the same range notation: “1-3, 7, 10-12”. Leave the field empty and every page is turned.' },
      { q: 'Is the document recompressed?', a: 'No. Rotating a page changes one attribute in the PDF structure; the content is untouched and loses nothing.' },
      { q: 'Why did my reader already show the page the right way up?', a: 'Some readers rotate the view without saving it. This tool writes the rotation into the file, so it comes out right everywhere, including in print.' },
    ],
  },
  'pdf-extract': {
    intro: [
      'Keep only the pages you want, or do the opposite and remove the ones you do not. It is the same operation seen from both sides, and the switch flips it.',
      'Useful for sending just the relevant chapter, dropping a blank cover, or removing pages with data you would rather not share.',
    ],
    steps: ['Add the PDF.', 'Type the pages, for example “1-3, 7”.', 'Tick the box if you want to delete them rather than keep them.'],
    faq: [
      { q: 'Can the deleted pages be recovered from the new file?', a: 'No. The output document is built by copying only the pages that are kept, so the rest are simply not there, hidden or otherwise.' },
      { q: 'Is the order I type respected?', a: 'Pages come out in ascending order, not in the order you type them. To reorder, use “Organise pages”.' },
      { q: 'Can I drop the last page without knowing how many there are?', a: 'Type a high enough number at the end of a range: it is clipped to the last page that exists.' },
    ],
  },
  'images-to-pdf': {
    intro: [
      'Build a PDF with one image per page. It works both for turning phone photos of documents into a single file, and for packaging a set of screenshots into something you can send and print.',
      'With the “Each image’s own” page size, every page has exactly its photo’s dimensions — no white margins, no scaling. With A4 or Letter, the images are fitted in, centred.',
    ],
    steps: ['Drag the images in the order you want them.', 'Choose the page size, orientation and margin.', 'Press “Combine” and download the PDF.'],
    faq: [
      { q: 'Which image formats does it take?', a: 'Anything the browser can open. JPEGs and PNGs are embedded directly; everything else is converted to PNG first.' },
      { q: 'How do I change the page order?', a: 'By dragging the rows in the list, which is the order of the result.' },
      { q: 'The PDF is huge — what can I do?', a: 'Compress or resize the images first. A 12-megapixel photo has far more resolution than any printer will use on an A4 sheet.' },
    ],
  },
  'pdf-watermark': {
    intro: [
      'Stamp “DRAFT”, “CONFIDENTIAL” or whatever you need across every page of a PDF. The text is written as real text in the document, not as an image pasted on top.',
      'With tiling on, the mark covers the whole page diagonally, which is the classic pattern for documents that are not meant to be reused.',
    ],
    steps: ['Drop in the PDF.', 'Type the text and choose the position, size and opacity.', 'Process and download.'],
    faq: [
      { q: 'Can the mark be removed?', a: 'With a decent PDF editor, yes: the text is just another object in the document. It marks intent; it does not prevent anything.' },
      { q: 'Can I use accents?', a: 'Yes. What will not go in are characters outside Latin-1, because the PDF’s built-in fonts do not have them; if you use one, you are told before anything happens.' },
      { q: 'Does it sit above or below the content?', a: 'Above. At a low opacity the text underneath still reads perfectly well.' },
    ],
  },
  'pdf-page-numbers': {
    intro: [
      'Add page numbers to a PDF that has none, which is the usual situation after merging several documents or scanning a stack of sheets.',
      'You choose the format — bare number, “1 / 10”, “Page 1 of 10” — the position, the size and which page starts the count, so the cover does not take number one.',
    ],
    steps: ['Drop in the PDF.', 'Choose the format and where it goes.', 'If there is a cover, say how many pages to skip.'],
    faq: [
      { q: 'How do I leave the cover unnumbered?', a: 'Put 1 in “skip the first”. Numbering starts on the second page, and the number shown is whatever you set in “start at”.' },
      { q: 'Does the number cover the content?', a: 'It can, if the document already has text low down. Raise the margin until it is clear; it is measured in points, and 28 is a shade under a centimetre.' },
      { q: 'Can it be undone?', a: 'Not from here, so keep the original. The number becomes part of the page content.' },
    ],
  },
  ocr: {
    intro: [
      'A scan or a photo of a document is an image: the text you can see cannot be selected, searched or copied. OCR recognises it and hands it back as real text.',
      'You can ask for a plain text file or, better, a searchable PDF: the same picture as always, with an invisible text layer underneath. It looks exactly the same, but now you can search it and copy from it.',
      'The recognition is done by Tesseract compiled to WebAssembly, running inside the tab. A scanned contract or invoice is not sent to a service to be read, which with that kind of document is not a small detail.',
    ],
    steps: ['Drop in the scan, the photo or the PDF.', 'Choose the document language: getting it right changes a lot.', 'Decide between plain text and a searchable PDF, then process.'],
    faq: [
      { q: 'Why do I have to state the language?', a: 'Because recognition does not work letter by letter: it uses a language model to choose between possible readings. With the wrong language, “word” can come back as “vvord”.' },
      { q: 'Can I tick two at once?', a: 'Yes, for bilingual documents. There is a cost: each added language makes the job slower and adds some confusion.' },
      { q: 'The result has mistakes — what can I do?', a: 'OCR depends mostly on the quality of the original. Raise the resolution to 300 dpi, straighten the image if it is skewed, and check the contrast is good.' },
      { q: 'Does it read handwriting?', a: 'Essentially no. Tesseract is trained on printed text; with handwriting the results are not usable.' },
    ],
  },

  // --------------------------------------------------------------- data
  'json-to-csv': {
    intro: [
      'Turn a list of JSON objects into a table that Excel, Numbers or Google Sheets open directly. The columns come from the keys, and every key that appears in any of the objects is collected.',
      'Nested objects are flattened with dot notation, so {"address": {"city": "Girona"}} becomes a column called address.city.',
    ],
    steps: ['Paste the JSON or open a file.', 'Choose the separator your spreadsheet expects.', 'Copy the result or download it as .csv.'],
    faq: [
      { q: 'Which separator should I pick?', a: 'The comma is the standard, but Excel in many European locales expects a semicolon. If everything lands in one column when you open the file, switch.' },
      { q: 'Excel mangles my accents — why?', a: 'Because it does not detect that the file is UTF-8. Tick the BOM box: it adds an invisible marker at the start that makes Excel get it right.' },
      { q: 'What happens to values that are lists?', a: 'They are stored inside the cell as JSON text. A table has no way to represent a list in a single cell, so showing it plainly is the honest option.' },
    ],
  },
  'csv-to-json': {
    intro: [
      'Turn a table into a list of JSON objects, with the headers as field names. The separator is detected from the first line, but you can force it if detection goes wrong.',
      'The reader follows RFC 4180: it respects quotes, doubled quotes inside a value, and line breaks in the middle of a quoted field.',
    ],
    steps: ['Paste the CSV or open the file.', 'Check that the separator and the header box are right.', 'Copy the JSON or download it.'],
    faq: [
      { q: 'What does converting numbers and booleans do?', a: 'Without it everything comes out as quoted text. With it, “42” becomes the number 42 and “true” the boolean. Values that look numeric but are not — a postcode with a leading zero — are left as text.' },
      { q: 'My CSV has no headers.', a: 'Untick the box. Each row comes out as a list of values instead of an object with field names.' },
      { q: 'What if two columns share a name?', a: 'The second wins, because a JSON object cannot have two identical keys. Rename one of the columns before converting.' },
    ],
  },
  'json-to-yaml': {
    intro: [
      'Turn JSON into YAML keeping the key order. It is what you need when a configuration you hold as JSON has to go inside a docker-compose, a Kubernetes manifest or a CI workflow.',
      'The output avoids anchors and references, so it is readable and can be pasted as-is even where structures repeat.',
    ],
    steps: ['Paste the JSON.', 'Adjust the indentation if your project uses another.', 'Copy the YAML.'],
    faq: [
      { q: 'What indentation should I pick?', a: 'Two spaces is the majority convention and what Docker Compose and Kubernetes use. YAML never allows tabs.' },
      { q: 'Why are some strings quoted and others not?', a: 'YAML only needs quotes when a value could be mistaken for another type: “true”, “null”, “1.0” or a string starting with a special character.' },
      { q: 'Is the key order kept?', a: 'Yes, the output follows the order of the input JSON.' },
    ],
  },
  'yaml-to-json': {
    intro: [
      'Convert YAML to JSON to read it from code, validate it against a schema, or simply see its structure without depending on indentation.',
      'It accepts files with several documents separated by “---”: in that case the result is a list with one entry per document.',
    ],
    steps: ['Paste the YAML or open the file.', 'Choose the output indentation.', 'Copy or download the JSON.'],
    faq: [
      { q: 'Why does it say the YAML is invalid?', a: 'Almost always indentation: a tab among the spaces, or a level that does not line up. The error message gives the line where the reader lost its footing.' },
      { q: 'Is information lost in the conversion?', a: 'Yes, whatever JSON cannot represent: comments, anchors and references, and the distinction between string styles. All the values survive.' },
      { q: 'What about dates?', a: 'YAML recognises them as a type of their own; going to JSON they become text strings in ISO format.' },
    ],
  },
  'json-format': {
    intro: [
      'Indent, minify or sort the keys of a JSON document, and when it is invalid get the line, the column and what was expected there.',
      'The browser engine no longer says where it failed, so when JSON does not parse the page walks it again with its own analyser, which can: “a comma too many before }”, “expected a key name in double quotes”, always with the exact position.',
    ],
    steps: ['Paste the JSON, however messy.', 'Choose indented, minified or key-sorted output.', 'Copy the result.'],
    faq: [
      { q: 'What is sorting the keys for?', a: 'For comparing two JSON documents that hold the same content in a different order. Once both are sorted, a text diff shows only the real differences.' },
      { q: 'Is the file uploaded anywhere?', a: 'No. Everything happens inside the tab, which matters when the JSON you paste holds API keys or customer data.' },
      { q: 'Does it accept JSON with comments or trailing commas?', a: 'No, and it will tell you exactly where. That is not standard JSON, even though some configuration files allow it.' },
    ],
  },
  'jwt-decode': {
    intro: [
      'Open a JSON Web Token and show what is inside: the header’s algorithm, every field of the payload, and the issued, valid-from and expiry dates converted to local time.',
      'A JWT is not encrypted, only Base64-encoded: anyone holding it can read the contents. Which is why you should never put anything in one you would not want seen.',
    ],
    steps: ['Paste the token, with or without the Bearer prefix.', 'Read the header and the payload.', 'Check the expiry line.'],
    faq: [
      { q: 'Is the signature verified?', a: 'No. Verifying it would need the issuer’s secret or public key, and this tool has neither. It is for seeing the contents, not for deciding whether the token can be trusted.' },
      { q: 'Does the token reach a server?', a: 'No. The decoding is plain Base64 done in the tab, which matters rather a lot when what you are pasting is a live session token.' },
      { q: 'What does expired mean?', a: 'That the exp field is earlier than now. Many servers allow a few seconds of clock skew, but an expired token is normally rejected.' },
    ],
  },
  'base64-text': {
    intro: [
      'Encode and decode text in Base64, with full UTF-8 support: accents, eszetts and emoji go through and come back intact.',
      'The URL-safe variant swaps + and / for - and _, and drops the trailing padding, which is what JWTs and many query parameters expect.',
    ],
    steps: ['Choose the direction.', 'Paste the text or the Base64.', 'Copy the result.'],
    faq: [
      { q: 'Is Base64 encryption?', a: 'Not remotely. It is just a way of representing data with transport-safe characters. Anyone can undo it in a second: it protects nothing.' },
      { q: 'Why will my Base64 not decode?', a: 'Usually the padding. This page adds any missing “=” signs itself and accepts both the standard and the URL-safe variant, so if it still fails the text is truncated.' },
      { q: 'How much does the text grow?', a: 'About a third: every three bytes become four characters.' },
    ],
  },
  'base64-file': {
    intro: [
      'Turn a file into a data URI ready to paste into a stylesheet, some HTML or a configuration file. Handy for inlining a small icon and saving a network request.',
      'It makes sense with small files. Past a few kilobytes, inlining starts to lose: the resource can no longer be cached separately and the stylesheet gets heavier for everyone.',
    ],
    steps: ['Drop in the file.', 'Choose the full data URI or just the Base64.', 'Process and download the .txt.'],
    faq: [
      { q: 'Up to what size is inlining worth it?', a: 'As a rule of thumb, under about 4 kB. Above that, the 33 % growth and the lost caching usually do more harm than good.' },
      { q: 'Can I inline an SVG?', a: 'Yes, but SVG is usually better encoded with percent-escapes than Base64: it takes less room and stays readable inside the CSS.' },
      { q: 'Does the MIME type come out right?', a: 'It comes from what the operating system reports for the file. If the browser does not know the type, application/octet-stream is used and you can correct it by hand.' },
    ],
  },
  hash: {
    intro: [
      'Compute MD5, SHA-1, SHA-256, SHA-384 and SHA-512 of a text or a file, all five at once. The usual reason is checking that a download matches the sum published alongside it.',
      'The SHA family is computed by the browser’s WebCrypto, which is native code. MD5 is not in there because it is no longer considered secure, so this page carries its own implementation: it still turns up in plenty of older checksum files.',
    ],
    steps: ['Pick the Text or File tab.', 'Type the text or drop the file.', 'Compare the value with the one you were given.'],
    faq: [
      { q: 'Is the file uploaded to compute the hash?', a: 'No. It is read into the tab’s memory and hashed there. With very large files, bear in mind it is loaded whole.' },
      { q: 'Which hash should I look at?', a: 'Whichever the distributor publishes. If you get to choose, SHA-256. MD5 and SHA-1 are fine for spotting a corrupted download, but not for proving nobody tampered with it deliberately.' },
      { q: 'Why does the hash change when the file “is the same”?', a: 'Because a single differing bit changes it completely. A CRLF line ending instead of LF, or one added metadata field, gives an entirely different result.' },
    ],
  },

  // ------------------------------------------------------- text and web
  'minify-css': {
    intro: [
      'Minify CSS with CSSO, which does rather more than strip whitespace: it shortens colours, collapses shorthand properties and, if you let it, merges rules that share declarations.',
      'Restructuring is where the real difference comes from, and it is also what deserves a second look: it changes the order of rules, and in stylesheets with a lot of crossing specificity that can change the outcome.',
    ],
    steps: ['Paste the CSS.', 'Decide whether to enable restructuring.', 'Copy or download the .min.css.'],
    faq: [
      { q: 'Is restructuring safe to enable?', a: 'It is in the vast majority of stylesheets, but check the page afterwards. If you have rules that depend on source order to beat each other, better to leave it off.' },
      { q: 'What are /*! */ comments?', a: 'The convention for a comment that must not be removed, such as a licence header. With the box ticked they survive and the rest go.' },
      { q: 'How much is usually saved?', a: 'Between 15 and 30 % on a hand-written stylesheet. If the server already gzips or brotlis, the end gain is more modest, but still real.' },
    ],
  },
  'minify-js': {
    intro: [
      'Minify JavaScript with Terser, the same minifier behind most build tools. It strips comments and whitespace, shortens local variable names and simplifies dead code.',
      'It handles modern syntax, including ES modules, optional chaining and private class fields.',
    ],
    steps: ['Paste the code.', 'Tick whether it is an ES module and choose the target.', 'Copy or download the .min.js.'],
    faq: [
      { q: 'Why do I have to say whether it is an ES module?', a: 'Because modules are always in strict mode and have their own scope. Told that, Terser can shorten names that in a classic script would be globals and off limits.' },
      { q: 'Will shortening names break anything?', a: 'Local names are safe. What does break is code that reaches them by string, such as a framework injecting dependencies by parameter name.' },
      { q: 'It reports a syntax error the browser did not.', a: 'Terser parses the whole file first. Often it is syntax newer than the chosen target: raise the target to ES2020 and try again.' },
    ],
  },
  'text-count': {
    intro: [
      'Counts characters, words, lines, paragraphs and sentences as you type, and tells you how long it takes to read and how long to say out loud.',
      'Below are the limits people actually fight with: the title and meta description for search, and what fits in a post. The bar turns red when you go over.',
    ],
    steps: ['Paste or type the text.', 'Watch the count, which updates itself.', 'Keep an eye on the limit bars if you are writing for a specific place.'],
    faq: [
      { q: 'How does it count words?', a: 'As runs of letters and digits, so a web address counts as several. It is the same rule most counters use.' },
      { q: 'Where does the reading time come from?', a: '220 words per minute for silent reading and 130 for reading aloud, which are the usual averages for an adult with ordinary prose.' },
      { q: 'Why 158 characters for the meta description?', a: 'Because that is roughly where Google starts truncating it in results. It is not a written rule: it depends on the device and the query.' },
    ],
  },
  'text-case': {
    intro: [
      'Convert text to upper case, lower case, sentence case, or any of the conventions used in programming: camelCase, PascalCase, snake_case, kebab-case and CONSTANT_CASE.',
      'Title Case follows the usual style: short prepositions and articles stay lower case unless they open the title.',
    ],
    steps: ['Paste the text.', 'Choose the convention.', 'Copy the result.'],
    faq: [
      { q: 'Does it respect accents?', a: 'Yes. “ángel” becomes “ÁNGEL” and back again correctly, because the conversion uses Unicode rules rather than an ASCII table.' },
      { q: 'What does sentence case do exactly?', a: 'It lowercases everything, then capitalises the first letter of the text and whatever follows a full stop, exclamation mark or question mark.' },
      { q: 'What is CONSTANT_CASE for?', a: 'It is the convention for constants and environment variables in many languages: upper-case words joined by underscores.' },
    ],
  },
  'text-lines': {
    intro: [
      'Sort a list, drop its repeats and blank lines, number it or reverse it. It is the work that otherwise gets done by hand in a text editor, settled here with four checkboxes.',
      'The sort understands accents and numbers properly: “Álex” comes before “Bernard”, and “file10” after “file9”, not before it.',
    ],
    steps: ['Paste the list, one entry per line.', 'Tick what you want done.', 'Copy the result.'],
    faq: [
      { q: 'Why does “file10” come after “file9”?', a: 'Because the sort is natural: when it finds numbers inside text it compares them as numbers, not as text. That is nearly always what you want.' },
      { q: 'Does it drop duplicates that differ only in case?', a: 'Only if you tick “ignore case when comparing”. By default “Apple” and “apple” count as different.' },
      { q: 'Is the original order kept if I do not sort?', a: 'Yes. With “leave as is”, the other operations respect the order you pasted.' },
    ],
  },
  'url-encode': {
    intro: [
      'Encode and decode the percent-encoding of web addresses, which is what turns a space into “%20” and a “ç” into “%C3%A7”.',
      'The difference between the two scopes matters. For a single value you must also escape “/”, “?”, “&” and “=”, because inside a parameter they are text; for a whole address they have to be left alone or you break it.',
    ],
    steps: ['Choose the direction and the scope.', 'Paste the address or the value.', 'Copy the result.'],
    faq: [
      { q: 'Which scope should I choose?', a: 'If what you are encoding is the contents of a parameter, “a single value”. If it is a whole address and you only want to fix its spaces and accents, “a whole address”.' },
      { q: 'Spaces as “+” or as “%20”?', a: '“+” is the convention for GET form submissions, and many servers understand it. Outside the query string, “%20” is the only correct form.' },
      { q: 'It says it cannot decode.', a: 'That means there is a “%” not followed by two valid hex digits. It usually happens when the text was already decoded and contained a literal percent sign.' },
    ],
  },
  'html-entities': {
    intro: [
      'Turn “<”, “>”, “&” and quotes into their entities, which is what you must do to show code inside a page without the browser swallowing it as markup.',
      'Going the other way, the decoding is done by the browser’s own parser, so it understands every named entity there is rather than a short list.',
    ],
    steps: ['Choose the direction.', 'Paste the text or the code.', 'Copy the result.'],
    faq: [
      { q: 'Which characters are escaped by default?', a: 'The five that mean something in markup — &, <, >, " and \' — plus the non-breaking space. With the box ticked, everything above code point 127 as well.' },
      { q: 'Do accents need escaping?', a: 'Not if the page declares UTF-8, which it always should. The option is there for older systems and for HTML email, which still struggles with encoding.' },
      { q: 'Is this enough to prevent injection?', a: 'Escaping for HTML content is one piece, but inside an attribute, a <script> or a URL the rules differ. Do not treat this tool as a security control.' },
    ],
  },
  slugify: {
    intro: [
      'Turn a title into a clean address: no accents, no symbols, no spaces, all lower case. It is what a content management system does when you publish an article.',
      'It handles Catalan and Spanish properly: the ñ becomes “n”, the ç becomes “c”, and the geminated l of “col·legi” comes out “collegi”, not “col-legi”.',
    ],
    steps: ['Paste the title.', 'Choose the separator and, if you need one, a maximum length.', 'Copy the slug.'],
    faq: [
      { q: 'Hyphens or underscores?', a: 'Hyphens. Google reads them as word separators and underscores not, so for public addresses the hyphen is always the choice.' },
      { q: 'What does the maximum length do?', a: 'It truncates, but not mid-word: it steps back to the last separator unless that leaves it too short. Three to six words is usually the sweet spot.' },
      { q: 'Can I change the slug of a published article?', a: 'You can, but it is a new address: anything linking to the old one stops working. If you do it, leave a 301 redirect behind.' },
    ],
  },
  'format-html': {
    intro: [
      'Indent minified or badly laid-out HTML so it can be read. Useful for understanding code a tool spat out, reviewing a template, or seeing what is inside an HTML email.',
      'It respects inline elements and does not break text in the middle of a paragraph, which is what makes automatic indentation useful rather than annoying.',
    ],
    steps: ['Paste the markup.', 'Adjust the indentation.', 'Copy or download the result.'],
    faq: [
      { q: 'Does it change how the page looks?', a: 'With well-formed HTML it should not. Whitespace between inline elements does count, so check if you have delicate inline-block layout.' },
      { q: 'Does it work for JSX or templates?', a: 'Only partly. JSX braces and tags like {{ }} or <?php ?> confuse it, because it parses HTML and nothing else.' },
      { q: 'What about minifying it?', a: 'This tool goes the other way. For page weight, the CSS and JavaScript matter most, and both have their own tools here.' },
    ],
  },
  'format-xml': {
    intro: [
      'Indent an XML document and, while it is at it, check that it is well formed: an unclosed tag or an illegal character is reported before anything is touched.',
      'Useful for RSS feeds, sitemaps, configuration files and any API response that arrives as XML on one unreadable line.',
    ],
    steps: ['Paste the XML.', 'Choose the indentation.', 'Copy the result.'],
    faq: [
      { q: 'What does “not valid” mean here?', a: 'That it is not well formed: an unclosed tag, a bare “&” that should be “&amp;”, or two root elements. The message says what was expected.' },
      { q: 'Does it validate against a schema?', a: 'No. It checks the structure, not whether it satisfies an XSD or DTD, which is a much stricter check.' },
      { q: 'Are comments and CDATA sections kept?', a: 'Yes, they are in the result. What may change is the indentation of what is inside them.' },
    ],
  },
  'format-sql': {
    intro: [
      'Lay out a SQL query written on one line: keywords upper-cased, each field on its own line and the JOINs aligned. It reads instead of having to be deciphered.',
      'It understands the MySQL, PostgreSQL, SQLite, MariaDB and BigQuery dialects, which is what stops it mangling the syntax specific to each.',
    ],
    steps: ['Paste the query.', 'Choose the dialect.', 'Copy the result.'],
    faq: [
      { q: 'Does it change what the query does?', a: 'No. It only touches whitespace, line breaks and keyword case; table and column names are left exactly as you wrote them.' },
      { q: 'Why does it say it cannot parse it?', a: 'Because there is syntax the chosen dialect does not recognise. Try your engine’s specific dialect before “standard SQL”.' },
      { q: 'Can I format several at once?', a: 'Yes, separated by semicolons. They come out separated by a blank line.' },
    ],
  },
  color: {
    intro: [
      'Convert a colour between HEX, RGB, HSL and OKLCH, generate an eleven-step tone scale, and check its contrast against white and black by the WCAG criteria.',
      'OKLCH is the format worth knowing: it is built so that the same lightness is perceived as the same lightness whatever the hue, which HSL does not manage at all. That is why building coherent scales in it is so much easier.',
    ],
    steps: ['Pick a colour with the swatch or type it in any format.', 'Copy whichever format you need.', 'Check the contrast table before using it for text.'],
    faq: [
      { q: 'What contrast do I need?', a: '4.5:1 for normal text and 3:1 for large or bold text, which is level AA. AAA asks for 7:1. Below 3:1 the text is hard work for a lot of people.' },
      { q: 'Why do yellow and blue at the same HSL lightness look so different?', a: 'Because HSL takes no account of how the human eye perceives light, which is far more sensitive to green and yellow. OKLCH corrects for that.' },
      { q: 'What input formats does it take?', a: 'HEX of three, four, six or eight digits, rgb(), hsl(), and CSS colour names such as “tomato” or “rebeccapurple”.' },
    ],
  },
  regex: {
    intro: [
      'Test a regular expression against some text and see the matches highlighted, the position of each one, and the contents of the groups, both numbered and named.',
      'Type a replacement and you see it applied live, with $1, $2 and $& references. It is the JavaScript engine doing the work, so what works here works the same in your code.',
    ],
    steps: ['Write the pattern and tick the flags.', 'Paste the test text.', 'If you need it, write the replacement and watch the result.'],
    faq: [
      { q: 'Which flags are there?', a: 'g to find them all, i to ignore case, m so ^ and $ work line by line, s so the dot includes line breaks, and u for full Unicode mode.' },
      { q: 'Why do I only get one match?', a: 'Because the g flag is off. Without it a regular expression stops at the first one.' },
      { q: 'Do these expressions work in Python or PHP?', a: 'The basics do, but the details differ. Named groups, lookbehind and Unicode classes have different syntax or support depending on the language.' },
    ],
  },
  qr: {
    intro: [
      'Generate a QR code and download it as vector SVG, which is what you want for printing at any size without pixelation, or as PNG at whatever resolution you choose.',
      'You can control the colours and the error-correction level. At high correction the code stays readable even when part of it is covered or damaged, at the cost of more modules and therefore smaller squares.',
    ],
    steps: ['Type the text, the address or whatever you want in it.', 'Adjust the size, the quiet zone and the colours.', 'Download it as SVG or PNG.'],
    faq: [
      { q: 'Which error-correction level should I use?', a: 'M for screens and clean printing. Q or H if the code goes on a label that might be scratched or get wet, or if you are putting a logo in the middle.' },
      { q: 'Why will my phone not read it?', a: 'The three usual causes are too little contrast between the colours, too small a quiet zone (leave at least four modules), or printing it too small for the amount of data it holds.' },
      { q: 'Does the code expire?', a: 'No. There is no service in between: the QR literally contains the text you type. It is not a shortened link that can stop working one day.' },
      { q: 'Can I encode a Wi-Fi network?', a: 'Yes, with the format WIFI:T:WPA;S:network-name;P:password;; . Most phones recognise it and offer to connect.' },
    ],
  },
  diff: {
    intro: [
      'Compare two texts and see, line by line, what was added and what was taken away. Long runs of identical lines are folded so you only see what changed and the context around it.',
      'The comparison uses the longest common subsequence, the same criterion as the diff you already know, so the results look like what your version control shows.',
    ],
    steps: ['Paste the original on the left.', 'Paste the new one on the right.', 'Adjust the context lines if you want more or less.'],
    faq: [
      { q: 'Is anything uploaded?', a: 'No. The comparison happens in the tab, which makes it fit for contracts, logs and any text you should not be pasting into an online service.' },
      { q: 'Why does it say there are too many lines?', a: 'The algorithm needs a table proportional to the product of the two lengths. Past a few million cells it stops on purpose rather than hang the tab.' },
      { q: 'Does it find changes within a line?', a: 'Not yet: a modified line shows as one line removed and one added.' },
    ],
  },
};

export const VARIANT_PAGES = {
  'comprimir-png': {
    intro: [
      'PNG compresses losslessly, which means there is a floor it cannot go below: if the image has gradients or photographic noise, the file will be large and there is not much to do about it without changing format.',
      'So this page is set up to produce a WebP. It keeps transparency just as PNG does, and for a typical screenshot the result is usually ten to thirty times lighter. If you need the output to stay PNG, switch the format to “Keep the original”: the gain will be far more modest.',
    ],
    faq: [
      { q: 'Why does my PNG barely shrink when I choose “Keep the original”?', a: 'Because the PNG was already compressed and this tool re-encodes it with the same lossless algorithm. Re-encoding a lossless format does not invent space: what really cuts the weight is moving to WebP or reducing the pixel dimensions.' },
      { q: 'Is lossless WebP as good as PNG?', a: 'It is identical pixel for pixel and, on average, 26 % smaller. The difference is support: every browser opens it, but some older desktop software still does not.' },
      { q: 'How can I cut the weight a lot without changing format?', a: 'By reducing the pixel dimensions. A 3000 px-wide screenshot that will be shown at 800 px has nine times more pixels than it needs.' },
    ],
  },
  'comprimir-jpg': {
    intro: [
      'This page re-encodes JPEG to JPEG, which is what you need when the destination will take nothing else: an old content management system, a platform that only accepts photos, or a client who explicitly asked for .jpg.',
      'Bear in mind that every recompression stacks up loss. Always start from the camera original, not from a copy that has already been through a messaging app or another compressor.',
    ],
    faq: [
      { q: 'What quality should I use?', a: 'Between 75 and 85 is where almost nobody can tell the result from the original on a screen. Below 60 you start to see blocks in gradients and around text.' },
      { q: 'Can I just say how much it should weigh?', a: 'Yes. Switch the target to “Maximum file size” and give it in kilobytes. The page tries different qualities until it finds the highest that fits, and resizes if it has to.' },
      { q: 'Is the EXIF data kept?', a: 'No. Re-encoding goes through a browser canvas, which only deals in pixels, so the date, camera model and GPS coordinates are lost along the way.' },
    ],
  },
  'jpg-a-pdf': {
    intro: [
      'Gather JPEG photographs into a single PDF, one per page and in whatever order you like. It is the quick route from phone photos of documents to one file you can send or print.',
      'The JPEGs are embedded as they are, without re-encoding, so the PDF loses nothing against the original photos and is produced quickly.',
    ],
    faq: [
      { q: 'What order do the pages come out in?', a: 'The order of the list, which you can change by dragging the rows.' },
      { q: 'How do I make every page A4?', a: 'Switch the page size to A4. Each photo is scaled to fit whole, centred and keeping its proportions, with whatever margin you set.' },
      { q: 'Can I mix portrait and landscape photos?', a: 'Yes. With orientation on “Follow the image”, each page takes the orientation of its contents, so landscape photos do not end up small in the middle of a portrait sheet.' },
    ],
  },
  'png-a-pdf': {
    intro: [
      'Turn PNG screenshots, drawings and diagrams into a PDF with one image per page. Good for delivering a set of screenshots as a single document, or printing a series of plates.',
      'Unlike JPEGs, PNGs are recompressed when embedded in the PDF, so the result usually weighs less than the sum of the originals.',
    ],
    faq: [
      { q: 'Is transparency kept?', a: 'The PDF paints transparent areas white, which is what you will see when printing. If you need the alpha channel, keep the images as PNG.' },
      { q: 'The screenshot prints blurry — why?', a: 'Because a screen PNG has few pixels for the paper size. With the “Each image’s own” page size the PDF keeps the original resolution instead of stretching it to A4.' },
      { q: 'Can I add margins?', a: 'Yes, as long as you pick a fixed page size. The margin is in millimetres and applies equally to all four sides.' },
    ],
  },
};
