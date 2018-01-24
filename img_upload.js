const express = require('express');
const multer = require('multer');		// an express middleware which simplifies uploading of files
const fileType = require('file-type');	// to get MIME type of the stored file
const fs = require('fs');
const app = express();

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

const port = 3000;
app.listen(port, "localhost");

// maximum file size: 10MB
const upload = multer({
    dest:'images/', 
    limits: {fileSize: 10000000, files: 1},
    fileFilter:  (req, file, callback) => {
    
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {

            return callback(new Error('Only images are allowed!'), false)
        }

        callback(null, true);
    }
}).single('my_image');	// Accept a single file with the key name 'my_image'. The single file will be stored in req.file.

// the upload() callback method above will be called to upload the image.
app.post('/images/upload', (req, res) => {

    upload(req, res, function (err) {

        if (err) 
        {
            res.status(400).json({message: err.message})
        } 
        else 
        {
        	// let is scoped to the nearest enclosing block
            let path = `/images/${req.file.filename}`
            res.status(200).json({message: 'Image is uploaded successfully!', path: path})
        }
    })
});

app.post('/detect_landmark', upload, (req,res) => {
	
	// perform landmark detection
	const filename = req.file.filename;
	console.log( filename);
	client
		.landmarkDetection( req.file.path)
		.then( results => {
			const landmarks = results[0].landmarkAnnotations;

			console.log('Landmarks:');
			landmarks.forEach( landmark => {

				console.log(landmark)

				/*
				console.log( "Desc: " + landmark.description);
				console.log( "Score: " + landmark.score);
				landmark.locations.forEach( loc => {
					console.log( "(Lat, Long): (" + loc.latLng.latitude + ", " + 
													loc.latLng.longitude + ")" );
				});
				*/
			});

			res.status(200).json( landmarks);
		})
		.catch( err => {
			console.error('ERROR:', err);
			res.status(400).json({message: err.message});
		});

});


// to show the image, called :imagename, to the client
app.get('/images/:imagename', (req, res) => {

    let imagename = req.params.imagename
    let imagepath = __dirname + "/images/" + imagename
    let image = fs.readFileSync(imagepath)
    let mime = fileType(image).mime
    
    // Covert the image data to a Buffer and base64 encode it.
	var encoded = new Buffer(image).toString('base64');


	res.writeHead(200, {'Content-Type': mime })
	res.end(image, 'binary')
});


app.use((err, req, res, next) => {

    if (err.code == 'ENOENT') {
        
        res.status(404).json({message: 'Image Not Found!'})

    } else {

        res.status(500).json({message: err.message}) 
    } 
});


console.log(`App Runs on ${port}`);
