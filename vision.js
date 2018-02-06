/* 
 * Authentication is verified automatically by
 * setting the environment variable GOOGLE_APPLICATION_CREDENTIALS.
 *
 * see https://cloud.google.com/docs/authentication/getting-started
 *
 */

// import the Google Cloud client library, i.e. Vision API
const vision = require('@google-cloud/vision');

// create a client that uses Application Default Credentials (ADC)
const client = new vision.ImageAnnotatorClient();

var response = client.landmarkDetection({ 
	'image' : {'source': {'image_uri': 'http://www.istanbulite.com/wp-content/uploads/2014/08/1galatatower_small.jpg'}}
});

console.log( response)
//response.annotations[0].landmarkAnnotations.forEach( landmark => console.log( landmark));

/*
// perform landmark detection
const filename = './images/674f86b220a6c7831c1df0bbf21a8aae';
client
	.landmarkDetection(filename)
	.then( results => {
		const landmarks = results[0].landmarkAnnotations;
		console.log('Landmarks:');
		landmarks.forEach(landmark => console.log(landmark));
	})
	.catch( err => {
		console.error('ERROR:', err);
	});
*/
