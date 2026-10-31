import { jest } from '@jest/globals';
import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import hostRoute from '../src/routes/hostRoute.js';
import User from '../src/models/User.js';
import Room from '../src/models/Room.js';
import Review from '../src/models/Review.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use('/host', hostRoute);

describe('Host Reviews & Feedback Dashboard (SCR-HOST-05 & BR-HOST-01)', () => {
  const hostId = '65f1a2b3c4d5e6f7a8b9c0d1';
  const otherHostId = '65f1a2b3c4d5e6f7a8b9c0d9';
  const myRoomId1 = '65f1a2b3c4d5e6f7a8b9c0d2';
  const myRoomId2 = '65f1a2b3c4d5e6f7a8b9c0d3';
  const otherRoomId = '65f1a2b3c4d5e6f7a8b9c0d4';

  const hostToken = jwt.sign(
    { userId: hostId, role: 'HOST' },
    process.env.ACCES_TOKEN_SECRET || 'secret_key',
    { expiresIn: '1h' }
  );

  const mockHostUser = {
    _id: hostId,
    username: 'robinnguyen',
    email: 'robinnguyen@gmail.com',
    role: 'HOST',
    firstName: 'Robin',
    lastName: 'Nguyen'
  };

  const mockRooms = [
    { _id: myRoomId1, title: 'Villa Mộng Mơ View Hồ', roomCode: 'P-VLZ04', ownerId: hostId },
    { _id: myRoomId2, title: 'Studio Ban Công Hoàng Hôn', roomCode: 'P-VLZ08', ownerId: hostId }
  ];

  beforeEach(() => {
    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue(mockHostUser)
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('1. Unauthenticated request to /host/reviews should be redirected to /host/login', async () => {
    const res = await request(app).get('/host/reviews');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/host/login');
  });

  test('2. Unauthenticated request to /host/api/reviews should return 401 AUTH-401', async () => {
    const res = await request(app).get('/host/api/reviews').set('Accept', 'application/json');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('AUTH-401');
  });

  test('3. Authenticated host receives aggregated stats and reviews from real DB logic', async () => {
    // Mock Room query
    jest.spyOn(Room, 'find').mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockRooms)
      })
    });

    // Mock aggregation for Hero Card
    jest.spyOn(Review, 'aggregate').mockResolvedValue([
      {
        overall: [
          {
            avgRating: 4.71,
            totalReviews: 32,
            cleanlinessAvg: 4.9,
            serviceAvg: 4.8,
            checkinAvg: 4.9,
            accuracyAvg: 4.7,
            locationAvg: 4.6,
            valueAvg: 4.6,
            photoCount: 18
          }
        ],
        starCounts: [
          { _id: 5, count: 22 },
          { _id: 4, count: 6 },
          { _id: 3, count: 2 },
          { _id: 2, count: 1 },
          { _id: 1, count: 1 }
        ]
      }
    ]);

    // Mock countDocuments & find
    jest.spyOn(Review, 'countDocuments').mockResolvedValue(32);
    jest.spyOn(Review, 'find').mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([
                {
                  _id: '65f1a2b3c4d5e6f7a8b9c0e1',
                  fullName: 'Trần Thị Bình',
                  rating: 4,
                  comment: 'Phòng sạch sẽ, view hồ buổi sáng rất đẹp.',
                  images: ['https://example.com/img1.jpg'],
                  stayInfo: { roomTitle: 'Villa Mộng Mơ View Hồ', bookingCode: 'BK-9718' },
                  createdAt: new Date('2026-10-13T09:15:00')
                }
              ])
            })
          })
        })
      })
    });

    const res = await request(app)
      .get('/host/api/reviews')
      .set('Cookie', [`hostToken=${hostToken}`])
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats.avgRating).toBe('4.7');
    expect(res.body.stats.totalReviews).toBe(32);
    expect(res.body.stats.photoCount).toBe(18);
    expect(res.body.stats.starMap[5]).toBe(22);
    expect(res.body.stats.starMap[4]).toBe(6);
    expect(res.body.stats.starMap[2]).toBe(1);
    expect(res.body.stats.subRatings.cleanliness).toBe('4.9');
    expect(res.body.reviews.length).toBe(1);
    expect(res.body.reviews[0].fullName).toBe('Trần Thị Bình');
    expect(res.body.reviews[0].initials).toBe('TB');
  });

  test('4. BR-HOST-01: Querying a room not owned by the host immediately returns 403 AUTH-403', async () => {
    // Host only owns myRoomId1 and myRoomId2
    jest.spyOn(Room, 'find').mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockRooms)
      })
    });

    const res = await request(app)
      .get(`/host/api/reviews?roomId=${otherRoomId}`)
      .set('Cookie', [`hostToken=${hostToken}`])
      .set('Accept', 'application/json');

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('AUTH-403');
    expect(res.body.message).toContain('AUTH-403');
  });

  test('5. Filtering reviews: Low rating (<= 2 stars) flags isNegative === true for warning UI', async () => {
    jest.spyOn(Room, 'find').mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockRooms)
      })
    });

    jest.spyOn(Review, 'aggregate').mockResolvedValue([{ overall: [{ totalReviews: 1, avgRating: 2 }], starCounts: [{ _id: 2, count: 1 }] }]);
    jest.spyOn(Review, 'countDocuments').mockResolvedValue(1);

    jest.spyOn(Review, 'find').mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([
                {
                  _id: '65f1a2b3c4d5e6f7a8b9c0e2',
                  fullName: 'Nguyễn Hải Đăng',
                  rating: 2,
                  comment: 'Vị trí gần biển nhưng cách âm chưa tốt...',
                  images: ['img1.jpg', 'img2.jpg'],
                  stayInfo: { roomTitle: 'Studio Ban Công Hoàng Hôn', bookingCode: 'BK-9602' },
                  createdAt: new Date('2026-09-28T11:00:00')
                }
              ])
            })
          })
        })
      })
    });

    const res = await request(app)
      .get('/host/api/reviews?rating=2')
      .set('Cookie', [`hostToken=${hostToken}`])
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.reviews.length).toBe(1);
    expect(res.body.reviews[0].rating).toBe(2);
    expect(res.body.reviews[0].isNegative).toBe(true);
    expect(res.body.reviews[0].initials).toBe('NĐ');
  });
});

