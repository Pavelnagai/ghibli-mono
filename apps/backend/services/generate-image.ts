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
  console.log('Starting image generation with style:', style);
  const base64Image = await fileToBase64(image);
  console.log('Image converted to base64');

  const tempFilePath = `temp-${Date.now()}.png`;
  try {
    fs.writeFileSync(tempFilePath, Buffer.from(base64Image, 'base64'));
    console.log('Temporary file created at:', tempFilePath);

    const imageFile = await toFile(fs.createReadStream(tempFilePath), null, {
      type: 'image/png',
    });
    console.log('Image file prepared for OpenAI');

    const prompt = `Create a high-quality image based on the provided source image, carefully preserving its intricate details, composition, and key elements. Transform the overall style into ${style} art style, while maintaining the original's essence. Pay close attention to lighting, textures, and fine details to ensure a cohesive and visually striking result. Adjust colors, shading, and stylistic features to align with the chosen art style, but keep the core subject and composition recognizable.`;

    console.log('Sending request to OpenAI...');
    const response = await openaiClient.images
      .edit({
        model: 'dall-e-2',
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

    console.log('Received response from OpenAI');
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
        console.log('Temporary file cleaned up');
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
