import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import constant from '../../utils/constant.js';

dotenv.config();

const s3Client = new S3Client({
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.ACCESSKEY,
        secretAccessKey: process.env.SECRETACCESSKEY,
    },
});

export const generateS3URL = async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(constant.statusCode.notFound).send({ status: false, message: constant.s3.noFileUploaded });
        }

        const fileSizeInKB = file.size / 1024;
        if (fileSizeInKB < 20 || fileSizeInKB > 10240) {
            return res.status(constant.statusCode.required).send({
                status: false,
                message: constant.s3.invalidFileSize(fileSizeInKB),
            });
        }

        const timestamp = Date.now();
        const key = `uploads/${timestamp}_${file.originalname}`;

        const params = {
            Bucket: process.env.BUCKET,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read',
        };

        const command = new PutObjectCommand(params);
        await s3Client.send(command);

        const imageUrl = `https://${process.env.BUCKET}.s3.amazonaws.com/${key}`;
        return res.json({ imageUrl });
    } catch (error) {
        return res.status(constant.statusCode.somethingWentWrong).send({ status: false, message: constant.general.genericError });
    }
};
