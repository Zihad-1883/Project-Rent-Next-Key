import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';
import { RentalRequest, Property } from '../types/database.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const createRental = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { propertyId, startDate, endDate, contactNumber } = req.body;

    if (!propertyId || !ObjectId.isValid(propertyId)) {
      res.status(400).json({ success: false, message: 'Invalid or missing property details.' });
      return;
    }

    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, message: 'Unauthorized. Session verification failed.' });
      return;
    }

    const db = await getDb();
    const targetPropId = new ObjectId(propertyId);

    // 1. Fetch associated property to get Landlord User ID
    const property = await db.collection<Property>('properties').findOne({ _id: targetPropId });

    if (!property) {
      res.status(404).json({ success: false, message: 'Property listing not found.' });
      return;
    }

    // 2. Validate tenant is not landlord of property
    if (property.landlordId.toString() === req.user.id) {
      res.status(400).json({ success: false, message: 'Landlords cannot rent their own listings.' });
      return;
    }

    // 3. Prevent duplicate active requests for the same property by the same tenant
    const existingRequest = await db.collection<RentalRequest>('rentals').findOne({
      propertyId: targetPropId,
      tenantId: new ObjectId(req.user.id),
      status: 'pending',
    });

    if (existingRequest) {
      res.status(400).json({ success: false, message: 'You already have an active pending rent request for this property.' });
      return;
    }

    // 4. Fetch tenant info to get default contact number (email)
    const tenantUser = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });

    // 5. Build and save request
    const newRental: RentalRequest = {
      propertyId: targetPropId,
      tenantId: new ObjectId(req.user.id),
      landlordId: property.landlordId,
      status: 'pending',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || '',
      contactNumber: contactNumber || tenantUser?.email || '',
      createdAt: new Date(),
    };

    const result = await db.collection<RentalRequest>('rentals').insertOne(newRental);

    res.status(201).json({
      success: true,
      rental: {
        id: result.insertedId.toString(),
        ...newRental,
      },
    });
  } catch (error) {
    console.error('Error creating rental request:', error);
    res.status(500).json({ success: false, message: 'Internal server error processing request.' });
  }
};

export const getMyRentals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const db = await getDb();

    // Query with lookup joins to bundle Property details
    const rentals = await db
      .collection('rentals')
      .aggregate([
        { $match: { tenantId: new ObjectId(req.user.id) } },
        {
          $lookup: {
            from: 'properties',
            localField: 'propertyId',
            foreignField: '_id',
            as: 'property',
          },
        },
        { $unwind: { path: '$property', preserveNullAndEmptyArrays: true } },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    res.status(200).json({
      success: true,
      rentals: rentals.map((r: any) => ({
        id: r._id.toString(),
        status: r.status,
        startDate: r.startDate,
        endDate: r.endDate,
        contactNumber: r.contactNumber,
        createdAt: r.createdAt,
        property: r.property
          ? {
              id: r.property._id.toString(),
              title: r.property.title,
              price: r.property.price,
              location: r.property.location,
              imageUrl: r.property.imageUrl,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error('Error loading tenant rentals:', error);
    res.status(500).json({ success: false, message: 'Internal server error querying rentals.' });
  }
};
