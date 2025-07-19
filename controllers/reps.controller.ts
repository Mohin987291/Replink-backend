import type { FastifyRequest, FastifyReply } from "fastify";
import type { Reps } from "../types/reps.types.js";
import { asyncHandle, successHandle, errorHandle } from "../utils/handler.js";
import { generToken } from "../utils/generateToken.js";
import { createRep, getRepByEmail, getMe, updateRepProfile, getRatingsByRepId, updateRating, passRep } from "../services/reps.service.js";
import bcryptjs from "bcryptjs";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const RegisterRep = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
    const data = request.body as Reps;

    if (!data.name || !data.email || !data.password) {
        return errorHandle('All fields are required', reply, 400);
    }


    const [existingRep, hashedPassword] = await Promise.all([
        getRepByEmail(data.email),
        bcryptjs.hash(data.password, 10)
    ]);


    if (existingRep) {
        return errorHandle('Rep with this email already exists', reply, 409);
    }
    const rep = await createRep({ ...data, password: hashedPassword });

    if (typeof rep === 'string') {
        return errorHandle(rep, reply, 500);
    } else {
        if (!rep.id) {
            return errorHandle('Rep creation failed', reply, 500);
        }
        const token = generToken(rep.id);
        successHandle({
            token,
            rep: {
                id: rep.id,
                name: rep.name,
                email: rep.email
            }
        }, reply, 201);
    }

});

export const RepLogin = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password }: { email: string; password: string } = request.body as { email: string; password: string };

    if (!email || !password) {
        return errorHandle('Email and password are required', reply, 400);
    }

    const rep = await getRepByEmail(email);
    if (typeof rep === 'string') {
        return errorHandle(rep, reply, 500);
    }
    if (!rep) {
        return errorHandle('Rep not found', reply, 404);
    }

    const isPasswordValid = await bcryptjs.compare(password, rep.password);
    if (!isPasswordValid) {
        return errorHandle('Invalid password', reply, 401);
    }

    const token = generToken(rep.id);
    successHandle({
        token,
        rep: {
            id: rep.id,
            name: rep.name,
            email: rep.email,
            isPassed: rep.isPassed
        }
    }, reply, 200);
});

export const PassRep = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
    const { id }: { id: string } = request.body as { id: string };

    if (!id) {
        return errorHandle('Rep ID is required', reply, 400);
    }

    const updatedRep = await passRep(id);
    if (typeof updatedRep === 'string') {
        return errorHandle(updatedRep, reply, 500);
    }

    successHandle({
        message: 'Rep passed successfully',
        rep: {
            id: updatedRep.id,
            name: updatedRep.name,
            email: updatedRep.email,
            isPassed: updatedRep.isPassed,
            profilePic: updatedRep.profilePic,
            phoneNo: updatedRep.phoneNo,
        }
    }, reply, 200);
});

export const GetMeHandler = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
    const repId = request?.Rep?.id;

    if (!repId) {
        return errorHandle('Rep ID is required', reply, 400);
    }

    const rep = await getMe(repId);
    if (typeof rep === 'string') {
        return errorHandle(rep, reply, 500);
    } else if (!rep) {
        return errorHandle('Rep not found', reply, 404);
    }

    successHandle({
        message: 'Rep fetched successfully',
        rep: {
            id: rep.id,
            name: rep.name,
            email: rep.email,
            isPassed: rep.isPassed,
            isVerified: rep.isVerified,
            profilePic: rep.profilePic,
            phoneNo: rep.phoneNo,
            rating: rep.rating,
            bio: rep.bio
        }
    }, reply, 200);
});

export const GetRepbyId = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
    const { id }: { id: string } = request.params as { id: string };

    if (!id) {
        return errorHandle('Rep ID is required', reply, 400);
    }

    const rep = await getMe(id);
    if (typeof rep === 'string') {
        return errorHandle(rep, reply, 500);
    } else if (!rep) {
        return errorHandle('Rep not found', reply, 404);
    } else {
        successHandle({
            message: 'Rep fetched successfully',
            rep: {
                id: rep.id,
                name: rep.name,
                email: rep.email,
                isPassed: rep.isPassed,
                isVerified: rep.isVerified,
                profilePic: rep.profilePic,
                phoneNo: rep.phoneNo,
                rating: rep.rating,
                bio: rep.bio
            }
        }, reply, 200);
    }
});

export const updateRepProfileHandler = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
    // 1. Extract Rep ID and multipart form data from the request
    const repId = (request as any).Rep?.id;
    const data = request.body as any;

    // Authenticate the request
    if (!repId) {
        return errorHandle('Rep authentication required. Please log in.', reply, 401);
    }

    // 2. Extract text fields from the multipart data
    // The `.value` is used because fastify-multipart wraps fields in objects
    const profileData = {
        name: data.name?.value,
        phoneNo: data.phoneNo?.value,
        bio: data.bio?.value
    };

    let imageUrl = ""; // Initialize imageUrl variable

    // 3. Process the image upload if an image is provided
    if (data.profilePic && data.profilePic.filename) {
        const image = data.profilePic;

        console.log('Image received:', {
            filename: image.filename,
            mimetype: image.mimetype,
        });

        try {
            // Convert the file stream to a buffer
            const fileBuffer = await image.toBuffer();

            // Generate a unique filename to prevent conflicts
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 8);
            const fileExtension = image.filename.split('.').pop() || 'jpg';

            // Define the path within the bucket: pfp/{repId}/unique_filename.ext
            const fileName = `pfp/${repId}/${timestamp}_${randomId}.${fileExtension}`;

            console.log(`Uploading to Supabase with filename: ${fileName}`);

            // Upload the image to your Supabase Storage bucket
            // Replace 'your-bucket-name' with your actual bucket name, e.g., 'replink-assets'
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('replink-report-images') // IMPORTANT: Change to your actual bucket name
                .upload(fileName, fileBuffer, {
                    contentType: image.mimetype,
                    cacheControl: '3600', // Cache for 1 hour
                    upsert: false // Do not overwrite existing files
                });

            if (uploadError) {
                // If the upload fails, throw an error to be caught by the catch block
                throw new Error(`Supabase upload failed: ${uploadError.message}`);
            }

            // Get the public URL for the newly uploaded image
            const { data: urlData } = supabase.storage
                .from('replink-report-images') // IMPORTANT: Use the same bucket name here
                .getPublicUrl(fileName);

            if (urlData?.publicUrl) {
                imageUrl = urlData.publicUrl;
                console.log(`Successfully uploaded. Public URL: ${imageUrl}`);
            } else {
                throw new Error('Failed to get public URL for the uploaded image.');
            }

        } catch (error) {
            console.error("Image upload process failed:", error);
            // Send an error response to the client
            return errorHandle(`Failed to upload profile picture: ${error}`, reply, 500);
        }
    }

    // 4. Consolidate all data (text fields + image URL) into a final object
    const finalRepData = {
        ...profileData,
        profilePic: imageUrl || null // Use the new URL or null if no image was uploaded
    };

    // 5. Log the final data to the console as requested
    console.log("--- Final Rep Profile Data ---");
    console.log(finalRepData);
    console.log("----------------------------");


    const updatedRep = await updateRepProfile(repId, finalRepData);
    if (typeof updatedRep === 'string') {
        return errorHandle('Failed to update Rep profile', reply, 500);
    } else if (!updatedRep) {
        return errorHandle('Failed to update Rep profile', reply, 500);
    }
    successHandle(updatedRep, reply, 200);

});

export const rateRep = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {

    const data = request.body as { repId: string, rating: string };


    const getRatings = await getRatingsByRepId(data.repId);
    if (typeof getRatings === 'string') {
        return errorHandle(getRatings, reply, 500);
    }

    const updatedRatingCount = getRatings?.ratingCount ? getRatings.ratingCount + 1 : 1;
    const updatedRating = ((getRatings?.rating || 0) * (getRatings?.ratingCount || 0) + Number(data.rating)) / updatedRatingCount;

    const updatedRatings = await updateRating(data.repId, {
        rating: updatedRating,
        ratingCount: updatedRatingCount,
    });

    if (typeof updateRating === 'string'){
        return errorHandle(updateRating,reply,500);
    };

    successHandle(updatedRatings, reply, 200);

});