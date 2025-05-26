import { toFile } from 'openai';
import fs from 'fs';
import { ImageStyle } from '../types/styles.js';
import { config } from '../db/config.js';
import OpenAI from 'openai';

export const openaiClient = new OpenAI({
  apiKey: config.api.openAiKey,
});

export const generateImage = async (
  image: File,
  style: ImageStyle,
): Promise<{ outputImage: File }> => {
  const base64Image = await fileToBase64(image);
  const tempFilePath = `temp-${Date.now()}.png`;
  try {
    fs.writeFileSync(tempFilePath, Buffer.from(base64Image, 'base64'));

    const imageFile = await toFile(fs.createReadStream(tempFilePath), null, {
      type: 'image/png',
    });

    const prompt = `Act as a professional visual artist and art stylist with deep knowledge
    of historical and contemporary art styles. Transform the provided source image into a
    high-quality artwork in the ${style} art style. Carefully preserve intricate details, composition,
    and key visual elements from the original image.
    Adjust colors, lighting, shading, and textures to match the chosen style while
    maintaining the subject's identity and visual integrity.
    Ensure that the final result reflects both the essence of the original and the artistic
    characteristics of ${style} in a cohesive and visually striking way.
    The image should be in the same style as the source image, but with the chosen art style.`;

    const response = await openaiClient.images
      .edit({
        model: 'gpt-image-1',
        image: imageFile,
        prompt,
        n: 1,
        size: '1024x1024',
      })
      .catch((error: any) => {
        console.error('OpenAI API error:', error);
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
  } catch (error) {
    console.error('Error in generateImage:', error);
    throw error;
  } finally {
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch (error) {
      console.error('Error cleaning up temporary file:', error);
    }
  }
};

const fileToBase64 = async (file: File): Promise<string> => {
  const buffer = Buffer.from(await file.arrayBuffer());
  return buffer.toString('base64');
};
