import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';
import { Review, Property } from '../types/database.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { propertyId, rating, comment } = req.body;

    if (!propertyId || !ObjectId.isValid(propertyId)) {
      res.status(400).json({ success: false, message: 'Invalid or missing property identifier.' });
      return;
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
      return;
    }

    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      res.status(400).json({ success: false, message: 'A written feedback message is required.' });
      return;
    }

    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, message: 'Unauthorized. Authenticated session required.' });
      return;
    }

    const db = await getDb();
    const propId = new ObjectId(propertyId);

    // 1. Confirm property existence
    const property = await db.collection<Property>('properties').findOne({ _id: propId });
    if (!property) {
      res.status(404).json({ success: false, message: 'Property listing not found.' });
      return;
    }

    // 2. Fetch tenant name if not in req.user
    const tenantUser = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    const tenantName = tenantUser?.name || 'Anonymous Tenant';

    // 3. Build and insert review
    const newReview: Review = {
      propertyId: propId,
      tenantId: new ObjectId(req.user.id),
      tenantName,
      rating: ratingNum,
      comment: comment.trim(),
      createdAt: new Date(),
    };

    const result = await db.collection<Review>('reviews').insertOne(newReview);

    res.status(201).json({
      success: true,
      review: {
        id: result.insertedId.toString(),
        ...newReview,
      },
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, message: 'Internal server error submitting review.' });
  }
};

export const getPropertyReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;

    if (!propertyId || typeof propertyId !== 'string' || !ObjectId.isValid(propertyId)) {
      res.status(400).json({ success: false, message: 'Invalid or missing property details lookup.' });
      return;
    }

    const db = await getDb();
    const reviews = await db
      .collection<Review>('reviews')
      .find({ propertyId: new ObjectId(propertyId) })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      reviews: reviews.map((r) => ({
        id: r._id!.toString(),
        ...r,
      })),
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Internal server error loading feedback reviews.' });
  }
};
