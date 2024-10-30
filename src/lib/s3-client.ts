import { ACCESS_KEY, ENDPOINT, REGION, SECRET_KEY } from '$env/static/private';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
	forcePathStyle: true,
	region: REGION,
	endpoint: ENDPOINT,
	credentials: {
		accessKeyId: ACCESS_KEY,
		secretAccessKey: SECRET_KEY
	}
});

export const saveImage = async (key: string, bucket: string, data: any, contentType: string) => {
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: data,
        ContentType: contentType
    });

    try {
        const resp = await s3Client.send(command);
        return {
            success: true,
            resp
        };
    } catch (error) {
        console.error('S3 upload error ', error);
        return {
            success: false,
            error
        };
    }
};