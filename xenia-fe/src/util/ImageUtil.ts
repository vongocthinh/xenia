import imageCompression from "browser-image-compression";

export const compressImage = async (image: File, size: number): Promise<File> => {
  const options = {
    maxSizeMB: 2,
    maxWidthOrHeight: size,
    useWebWorker: true,
  };

  const img = new Image();
  img.src = URL.createObjectURL(image);
  let width = img.naturalWidth;
  let height = img.naturalHeight;
  let compressedImage;

  if (width > height) {
    if (width > size) {
      compressedImage = await imageCompression(image, options);
    } else {
      compressedImage = image;
    }
  } else if (width < height) {
    if (height > size) {
      compressedImage = await imageCompression(image, options);
    } else {
      compressedImage = image;
    }
  } else {
    compressedImage = await imageCompression(image, options);
  }
  return compressedImage;
}