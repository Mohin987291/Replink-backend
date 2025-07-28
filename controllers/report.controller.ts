import type { FastifyRequest, FastifyReply } from 'fastify';
import type { Report } from '../types/report.types.js';
import { asyncHandle, successHandle, errorHandle } from '../utils/handler.js';
import { getReportsByGigId, createReport, getReportByCompanyId, getReportsByRepId } from '../services/report.service.js';
import { createClient } from '@supabase/supabase-js';
import { validateReportData } from '../utils/checkSuspeciousActivity.js';
import axios from 'axios';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const getReportsByGigIdHandler = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  const { gigId } = request.params as { gigId: string };
  const companyId = request.company?.id;

  // Fix: Properly parse query parameters
  const query = request.query as { isRep?: string };
  const isRep = query.isRep === 'true';

  if (!gigId) {
    return errorHandle('Gig ID is required', reply, 400);
  }

  const reports = await getReportsByGigId(gigId);

  if (typeof reports === 'string') {
    return errorHandle(reports, reply, 500);
  }

  if (isRep) {
    const repId = request.Rep?.id;
    if (repId != reports.reports[0].repId) {
      return errorHandle('Unauthorized access to reports', reply, 403);
    }
    return successHandle(reports, reply, 200);
  }

  if (reports.reports[0].companyId !== companyId) {
    return errorHandle('Unauthorized access to reports', reply, 403);
  }

  return successHandle(reports, reply, 200);
});

export const createReportHandler = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  const data = request.body as any;
  const repId = request.Rep?.id;

  if (!repId) {
    return errorHandle('Rep authentication required', reply, 401);
  }

  // Extract form fields
  const formData = {
    gigId: data.gigId?.value || data.gigId,
    companyId: data.companyId?.value || data.companyId,
    reason: data.reason?.value || data.reason,
    latitude: parseFloat(data.latitude?.value || data.latitude),
    longitude: parseFloat(data.longitude?.value || data.longitude),
    repId: repId
  };

  // Validation
  const validationErrors = [];

  if (!formData.gigId) validationErrors.push('Gig ID is required');
  if (!formData.companyId) validationErrors.push('Company ID is required');
  if (!formData.reason || formData.reason.length < 50) {
    validationErrors.push('Reason must be at least 50 characters long');
  }
  if (!formData.latitude || !formData.longitude || isNaN(formData.latitude) || isNaN(formData.longitude)) {
    validationErrors.push('Valid location coordinates are required');
  }
  if (!data.images) {
    validationErrors.push('At least one image is required');
  }

  if (validationErrors.length > 0) {
    console.error('Validation errors:', validationErrors);
    return errorHandle(`Validation failed: ${validationErrors.join(', ')}`, reply, 400);
  }

  // Handle single image upload to Supabase
  let imageUrl: string = '';

  if (data.images) {
    const image = Array.isArray(data.images) ? data.images[0] : data.images; // Take only first image

    try {
      // Convert file buffer using Fastify's toBuffer method
      const fileBuffer = await image.toBuffer();

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const fileExtension = image.filename.split('.').pop() || 'jpg';
      const fileName = `reports/${repId}/${formData.gigId}/${timestamp}_${randomId}.${fileExtension}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('replink-report-images')
        .upload(fileName, fileBuffer, {
          contentType: image.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('replink-report-images')
        .getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        imageUrl = urlData.publicUrl;
      } else {
        throw new Error('Failed to get public URL for image');
      }

    } catch (error) {
      return errorHandle(`Failed to upload image: ${error}`, reply, 500);
    }
  }
  const location = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${formData.latitude},${formData.longitude}`);
  const reportData: Report = {
    gigId: formData.gigId,
    repId: formData.repId,
    companyId: formData.companyId,
    reason: formData.reason,
    latitude: formData.latitude,
    longitude: formData.longitude,
    location: location.data[0]?.display_name || null, // Use location from OpenStreetMap
    imageUrl: imageUrl
  };

  const report = await createReport(reportData);
  if (typeof report === 'string') {
    return errorHandle(report, reply, 500);
  } else {
    successHandle(report, reply, 201);
  }
  await validateReportData(report.repId).catch(console.error)

});

export const getReportByCompanyIdHandler = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  const companyId = request.company?.id;

  if (!companyId) {
    return errorHandle('Company ID is required', reply, 400);
  }

  const reports = await getReportByCompanyId(companyId);

  if (typeof reports === 'string') {
    return errorHandle(reports, reply, 500);
  }

  return successHandle(reports, reply, 200);
});

export const getReportsByRepIdHandler = asyncHandle(async (request: FastifyRequest, reply: FastifyReply) => {
  const { repId } = request.params as { repId: string };
  const { page } = request.query as { page: number };

  if (!repId) {
    return errorHandle('Rep ID is required', reply, 400);
  }

  const reports = await getReportsByRepId(repId, page);

  if (typeof reports === 'string') {
    return errorHandle(reports, reply, 500);
  }

  return successHandle(reports, reply, 200);
});
