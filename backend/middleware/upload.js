const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// 10MB Limit for all
const limits = { fileSize: 10 * 1024 * 1024 };

const baseMulter = multer({ storage, limits });

// Define Upload Types
const rawUpload = baseMulter.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'thumbnails', maxCount: 7 }
]);

const rawDealUpload = baseMulter.single('image');
const rawCategoryUpload = baseMulter.single('image');
const rawThumbnailUpload = baseMulter.array('thumbnails', 7);
const rawProductUpload = baseMulter.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'thumbnails', maxCount: 7 }
]);


const handleMulterError = (uploadFunction) => (req, res, next) => {
    uploadFunction(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: "File size is too long." });
            }
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(500).json({ message: "Internal Server Error during upload." });
        }
        next();
    });
};

module.exports = { 
    upload: handleMulterError(rawUpload), 
    dealUpload: handleMulterError(rawDealUpload),
    categoryUpload: handleMulterError(rawCategoryUpload), 
    thumbnailUpload: handleMulterError(rawThumbnailUpload), 
    productUpload: handleMulterError(rawProductUpload) 
};