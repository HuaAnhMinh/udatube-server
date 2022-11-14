import Jimp from "jimp";

export const resizeImage = async (url: string, width: number, height: number): Promise<Buffer> => {
  console.log(`Resizing image: ${url} to ${width}x${height}`);
  const srcImage = await Jimp.read(url);
  console.log(`Original image size: ${srcImage.getWidth()}x${srcImage.getHeight()}`);
  if (srcImage.getWidth() === width && srcImage.getHeight() === height) {
    return;
  }

  srcImage.scaleToFit(width, height);
  const backgroundImg = new Jimp(width, height, 0xFFFFFFFF);
  if (srcImage.getWidth() > srcImage.getHeight()) {
    backgroundImg.composite(srcImage, 0, height / 2 - srcImage.getHeight() / 2);
  }
  else if (srcImage.getWidth() < srcImage.getHeight()) {
    backgroundImg.composite(srcImage, width / 2 - srcImage.getWidth() / 2, 0);
  }
  else {
    backgroundImg.composite(srcImage, 0, 0);
  }
  console.log(`Resized image size: ${backgroundImg.getWidth()}x${backgroundImg.getHeight()}`);
  return await backgroundImg.getBufferAsync(Jimp.MIME_PNG);
};