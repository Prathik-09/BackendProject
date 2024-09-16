import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp"); // specify the folder where files should be saved
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // specify the filename
    }
});
export const upload=multer({
    storage:storage,
})