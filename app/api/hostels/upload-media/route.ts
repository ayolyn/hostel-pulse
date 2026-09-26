import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { computeImageHashServer, calculateSimilarity, hammingDistanceHex } from '@/lib/phash';

export const runtime = 'nodejs'; // Use Node.js runtime for Buffer & zlib support

function getAdmin() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
    );
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
        }

        const formData = await req.formData();
        const propertyId = formData.get('property_id') as string | null;
        const location = formData.get('location') as string | null;

        // Collect all uploaded image files
        const files: File[] = [];
        const singleFile = formData.get('file') as File | null;
        const singleImage = formData.get('image') as File | null;
        const imageList = formData.getAll('images') as File[];

        if (singleFile && typeof singleFile !== 'string') files.push(singleFile);
        if (singleImage && typeof singleImage !== 'string') files.push(singleImage);
        for (const f of imageList) {
            if (f && typeof f !== 'string') files.push(f);
        }

        if (files.length === 0) {
            return NextResponse.json({ error: "No image files provided." }, { status: 400 });
        }

        const admin = getAdmin();

        // 1. Process and compute perceptual hash for each image
        const processedImages: {
            url: string;
            phash: string;
            filename: string;
        }[] = [];

        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Compute 64-bit dHash in pure TypeScript
            const phash = await computeImageHashServer(buffer);

            // Upload image to Supabase Storage bucket 'property-images'
            const ext = file.name.split('.').pop() || 'jpg';
            const storagePath = `properties/${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

            const { data: uploadData, error: uploadErr } = await admin.storage
                .from('property-images')
                .upload(storagePath, buffer, {
                    contentType: file.type || 'image/jpeg',
                    upsert: false
                });

            let publicUrl = '';
            if (!uploadErr && uploadData) {
                const { data: urlData } = admin.storage
                    .from('property-images')
                    .getPublicUrl(uploadData.path);
                publicUrl = urlData.publicUrl;
            } else {
                // If storage bucket isn't configured, use a placeholder URL
                publicUrl = `/uploads/${storagePath}`;
            }

            processedImages.push({
                url: publicUrl,
                phash,
                filename: file.name
            });
        }

        // 2. Similarity Comparison: query existing hashes in listing_images
        let isDuplicate = false;
        let highestConfidence = 0;
        let matchedPropertyId: string | null = null;
        let matchedImageUrl: string | null = null;
        let flaggedImageUrl: string | null = null;

        // Fetch existing images (optionally filtering by location if present)
        let query = admin
            .from('listing_images')
            .select(`
                id,
                property_id,
                image_url,
                image_phash,
                properties!inner (
                    id,
                    owner_id,
                    agent_id,
                    landlord_id,
                    location,
                    status
                )
            `);

        if (propertyId) {
            query = query.neq('property_id', propertyId);
        }

        const { data: existingHashes } = await query.limit(500);

        if (existingHashes && existingHashes.length > 0) {
            for (const img of processedImages) {
                if (!img.phash || img.phash === '0000000000000000') continue;

                for (const existing of existingHashes) {
                    const prop = existing.properties as any;
                    // Exclude images owned by this user
                    if (prop?.owner_id === user.id || prop?.agent_id === user.id || prop?.landlord_id === user.id) {
                        continue;
                    }

                    const sim = calculateSimilarity(img.phash, existing.image_phash, 8);
                    if (sim.isDuplicate) {
                        if (sim.similarity > highestConfidence) {
                            isDuplicate = true;
                            highestConfidence = sim.similarity;
                            matchedPropertyId = existing.property_id;
                            matchedImageUrl = existing.image_url;
                            flaggedImageUrl = img.url;
                        }
                    }
                }
            }
        }

        // 3. Store new image hashes in listing_images
        if (propertyId) {
            await admin.from('listing_images').delete().eq('property_id', propertyId);
            const rows = processedImages.map(img => ({
                property_id: propertyId,
                image_url: img.url,
                image_phash: img.phash
            }));
            await admin.from('listing_images').insert(rows);

            // 4. Decision Logic: update property status accordingly
            if (isDuplicate && matchedPropertyId) {
                await admin
                    .from('properties')
                    .update({
                        status: 'flagged_duplicate',
                        is_active: false,
                        duplicate_match_property_id: matchedPropertyId,
                        duplicate_confidence_score: highestConfidence,
                        duplicate_flagged_image: matchedImageUrl
                    })
                    .eq('id', propertyId);

                await admin.from('property_audit_logs').insert({
                    property_id: propertyId,
                    changed_by: user.id,
                    action: 'flagged_duplicate_detected',
                    field: 'status',
                    new_value: `flagged_duplicate (${highestConfidence}% match)`
                });
            } else {
                await admin
                    .from('properties')
                    .update({
                        status: 'active',
                        is_active: true
                    })
                    .eq('id', propertyId);
            }
        }

        if (isDuplicate) {
            return NextResponse.json({
                status: 'FLAGGED_DUPLICATE',
                is_duplicate: true,
                confidence_score: highestConfidence,
                matched_property_id: matchedPropertyId,
                matched_image_url: matchedImageUrl,
                flagged_image_url: flaggedImageUrl,
                uploaded_images: processedImages,
                message: "Listing submitted! Your listing is currently queued for quick admin verification."
            }, { status: 200 });
        }

        return NextResponse.json({
            status: 'ACTIVE',
            is_duplicate: false,
            confidence_score: 0,
            matched_property_id: null,
            uploaded_images: processedImages,
            message: "Listing media verified clean and active."
        }, { status: 200 });

    } catch (err: any) {
        console.error("upload-media error:", err);
        return NextResponse.json({ error: err.message || "Failed to process image upload" }, { status: 500 });
    }
}
