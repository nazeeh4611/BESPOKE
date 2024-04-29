const path = require('path');
const fs = require('fs');

const uploadCroppedImage = async (req, res) => {
    try {
        // Access the uploaded file
        const file = req.file;
          console.log("crop function",file)
        // Check if a file was uploaded
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Check if file.buffer is defined and is an instance of Buffer
        if (!file.buffer || !(file.buffer instanceof Buffer)) {
            return res.status(400).json({ error: 'Invalid file data' });
        }

        // Define the file path to save the cropped image
        const filePath = path.join(__dirname, '../public/productImage', file.filename);

        // Save the file to the server using file.buffer
        fs.writeFileSync(filePath, file.buffer);

        // Return the file path as a JSON response
        res.json({ filePath: `/public/productImage/${file.filename}` });
    } catch (error) {
        console.error('Error uploading cropped image:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    uploadCroppedImage,
};