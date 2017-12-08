const express = require('express');
const multer = require('multer');		// an express middleware which simplifies uploading of files
const fileType = require('file-type');	// to get MIME type of the stored file
const fs = require('fs');
const app = express();

const port = 3000;
app.listen(port, "localhost");

// maximum file size: 10MB
const upload = multer({
    dest:'images/', 
    limits: {fileSize: 10000000, files: 1},
    fileFilter:  (req, file, callback) => {
    
        if (!file.originalname.match(/\.(jpg|jpeg)$/)) {

            return callback(new Error('Only Images are allowed !'), false)
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
        
        res.status(404).json({message: 'Image Not Found !'})

    } else {

        res.status(500).json({message: err.message}) 
    } 
});


console.log(`App Runs on ${port}`);
