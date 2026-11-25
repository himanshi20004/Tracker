const fs = require('fs');
const multer = require('multer');
const path = require('path');
const ErrorHander = require('../utils/errorhander');

const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const baseName = path.basename(file.originalname, path.extname(file.originalname))
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .slice(0, 80);
        const safeName = `${Date.now()}-${baseName || 'resource'}.pdf`;
        cb(null, safeName);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
        files: 1,
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase();
        const isPdfMime = file.mimetype === 'application/pdf';
        if (ext !== '.pdf' || !isPdfMime) {
            return cb(new ErrorHander('Only valid PDF files are allowed', 400));
        }
        cb(null, true);
    },
});

module.exports = upload;
