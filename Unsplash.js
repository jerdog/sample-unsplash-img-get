// Unsplash.js - taken from https://javascript.plainenglish.io/a-beginners-guide-to-unsplash-api-in-javascript-2524c51ae1f3

import { createApi } from 'unsplash-js';
// import logger from '../utils/logger.js';
import fetch from 'node-fetch';
import fs from 'fs';


export class Unsplash {
  constructor(accessKey) {
    // Create an instance of the Unsplash API using the provided access key
    this.unsplash = createApi({ accessKey, fetch });
  }

  async getPhoto(type, query, page = 1, per_page = 8, orientation = 'landscape' ) {
    try {
//      // Log that a request is being sent to the Unsplash API
//      logger.info(`Sending request to Unsplash API with search phrase: ${query}`);

       // Send a request to the Unsplash API to search for photos
      const response  = await this.unsplash.search.getPhotos({
        query,
        page,
        per_page,
        orientation,
      });

      // Select a random photo from the response
      const aRandomPhoto = response.response.results[Math.floor(Math.random() * 8)];
      // Get the regular size photo url
      const photoUrl = aRandomPhoto.urls.regular;
      // Fetch the photo
      const photo = await fetch(photoUrl);
      // Get the photo buffer
      const photoBuffer = await photo.arrayBuffer();
      // Create caption for the photo - in Unsplash attribution style
      const caption = `
        <a style="text-decoration: none; cursor: default; pointer-events: none; color: inherit;">
          Photo by
        </a>
        <a href="${aRandomPhoto.user.links.html}" rel="noopener ugc nofollow" target="_blank">
          ${aRandomPhoto.user.name}
        </a>
        on
        <a href="https://unsplash.com" rel="noopener ugc nofollow" target="_blank">
          Unsplash
        </a>
      `;

//      // Log that a response has been received
//      logger.info(`Received response from Unsplash API`);

      // Check the value of the "type" parameter and execute the corresponding code block
      switch (type) {
        case 'buffer':
          // Convert the photo buffer to Uint8Array
          const data = new Uint8Array(photoBuffer);
          console.log(`${query}.jpg buffer ready`);
          // Return an object containing the photo's buffer and attributes
          return {
            attributes: {
              caption: caption,
              title: query.toLowerCase(),
              alt_text: `an image of ${query.toLowerCase()}`,
            },
            buffer: data
          };
        case 'file':
          // Convert the photo buffer to a Buffer
          const image = Buffer.from(photoBuffer);
           // Create a file path for the photo
          const filePath = `./images/${query}.jpg`
          // Write the photo to the file system
          await fs.promises.writeFile(filePath, image);
          console.log(caption);
          console.log(`${query}.jpg saved`);
          break;
        default:
          console.log(`Invalid type: ${type}`);
          return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }

}