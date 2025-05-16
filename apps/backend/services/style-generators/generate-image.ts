import { toFile } from 'openai';
import { openaiClient } from 'openai/client';
import fs from 'fs';
import { ImageStyle } from '@ghibli/types';

export const generateImage = async (
  image: File,
  style: ImageStyle,
): Promise<{ outputImage: File }> => {
  const base64Image = await fileToBase64(image);

  const tempFilePath = `temp-${Date.now()}.png`;
  fs.writeFileSync(tempFilePath, Buffer.from(base64Image, 'base64'));

  try {
    const imageFile = await toFile(fs.createReadStream(tempFilePath), null, {
      type: 'image/png',
    });

    const prompt = `Create a high-quality image based on the provided source image, carefully preserving its intricate details, composition, and key elements. Transform the overall style into ${style} art style, while maintaining the original's essence. Pay close attention to lighting, textures, and fine details to ensure a cohesive and visually striking result. Adjust colors, shading, and stylistic features to align with the chosen art style, but keep the core subject and composition recognizable.`;

    const response = await openaiClient.images
      .edit({
        model: 'gpt-image-1',
        image: imageFile,
        prompt,
        n: 1,
        size: '1024x1024',
      })
      .catch((error) => {
        if (error.response?.status === 400) {
          throw new Error(
            'Image content was rejected by safety system. Please try a different image or style.',
          );
        }
        throw error;
      });

    if (!response.data?.[0]?.b64_json) {
      throw new Error('Failed to generate image');
    }

    const image_bytes = Buffer.from(response.data[0].b64_json, 'base64');
    const resultPath = `result-${Date.now()}.png`;

    return {
      outputImage: new File([image_bytes], resultPath, { type: 'image/png' }),
    };
  } finally {
    fs.unlinkSync(tempFilePath);
  }
};

const fileToBase64 = async (file: File): Promise<string> => {
  const buffer = Buffer.from(await file.arrayBuffer());
  return buffer.toString('base64');
};
