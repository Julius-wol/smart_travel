import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Room   from '../models/Room.js';

// ─── Helper: tính lại avgRating & reviewCount cho phòng ──────────────────────
const recalcRoomRating = async (roomId) => {
  if (!mongoose.isValidObjectId(roomId)) return;
  const stats = await Review.aggregate([
    { $match: { roomId: new mongoose.Types.ObjectId(roomId) } },
    {
      $group: {
        _id: '$roomId',
        avgRating:   { $avg: '$rating' },
        reviewCount: { $sum: 1 },
        avgCleanliness: { $avg: '$categories.cleanliness' },
        avgLocation:    { $avg: '$categories.location' },
        avgService:     { $avg: '$categories.service' },
        avgValue:       { $avg: '$categories.value' },
      },
    },
  ]);

  if (stats.length > 0) {
    const s = stats[0];
    const avg = (v) => (v ? Math.round(v * 10) / 10 : undefined);
    await Room.findByIdAndUpdate(roomId, {
      rating:      avg(s.avgRating),
      reviewCount: s.reviewCount,
      'ratingBreakdown.overall':     avg(s.avgRating),
      'ratingBreakdown.cleanliness': avg(s.avgCleanliness),
      'ratingBreakdown.location':    avg(s.avgLocation),
      'ratingBreakdown.service':     avg(s.avgService),
      'ratingBreakdown.value':       avg(s.avgValue),
    });
  }
};

// ─── 1. Tạo đánh giá mới ─────────────────────────────────────────────────────
export const createReview = async (req, res) => {
  try {
    const { roomId, fullName, rating, comment, categories, bookingCode } = req.body;

    if (!roomId || !fullName || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ: roomId, fullName, rating, comment.',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating phải từ 1 đến 5.' });
    }

    // Kiểm tra phòng tồn tại
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Phòng không tồn tại.' });
    }

    const review = await Review.create({
      roomId,
      userId:      req.user?._id || undefined,
      fullName:    fullName.trim(),
      avatar:      req.body.avatar || '',
      rating:      Number(rating),
      comment:     comment.trim(),
      categories:  categories || {},
      bookingCode: bookingCode || '',
    });

    // Cập nhật avgRating trên Room ngay sau khi lưu
    await recalcRoomRating(roomId);

    console.log(`⭐ Review mới: ${fullName} đánh giá ${rating}★ cho phòng ${room.title}`);

    return res.status(201).json({
      success: true,
      message: 'Cảm ơn bạn đã đánh giá!',
      data: review,
    });
  } catch (error) {
    console.error('Lỗi createReview:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi gửi đánh giá.' });
  }
};

// ─── 2. Lấy danh sách đánh giá theo phòng ─────────────────────────────────────
export const getReviewsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ roomId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      Review.countDocuments({ roomId }),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: reviews,
    });
  } catch (error) {
    console.error('Lỗi getReviewsByRoom:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// ─── 3. Lấy tóm tắt rating của phòng ─────────────────────────────────────────
export const getRoomRatingSummary = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId).select('rating reviewCount ratingBreakdown title');
    if (!room) {
      return res.status(404).json({ success: false, message: 'Phòng không tồn tại.' });
    }

    if (!mongoose.isValidObjectId(roomId)) {
      return res.status(404).json({ success: false, message: 'ID phòng không hợp lệ.' });
    }

    // Phân phối sao (1★ - 5★)
    const dist = await Review.aggregate([
      { $match: { roomId: new mongoose.Types.ObjectId(roomId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    dist.forEach((d) => { distribution[d._id] = d.count; });

    return res.status(200).json({
      success: true,
      data: {
        rating:          room.rating,
        reviewCount:     room.reviewCount,
        ratingBreakdown: room.ratingBreakdown,
        distribution,
      },
    });
  } catch (error) {
    console.error('Lỗi getRoomRatingSummary:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};
