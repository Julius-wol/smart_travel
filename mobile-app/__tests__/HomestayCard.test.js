import React from 'react';
import renderer from 'react-test-renderer';
import { HomestayCard } from '../src/components/HomestayCard';

describe('HomestayCard Component (SMART-84 - Figma Node 29:1190)', () => {
  const mockRoom = {
    _id: 'room_123',
    name: 'An Nhiên Eco Retreat Đà Nẵng',
    city: 'Đà Nẵng',
    address: 'Bán đảo Sơn Trà, Đà Nẵng',
    price: 1250000,
    originalPrice: 1650000,
    discountPercent: 24,
    rating: 4.95,
    reviewCount: 128,
    distanceInfo: '2.5km tới Bãi Bụt',
    cancellationPolicy: 'Miễn phí hủy phòng trước 48h',
    aiRecommended: true,
    images: ['https://example.com/image1.jpg'],
  };

  it('renders homestay card details correctly', async () => {
    let component;
    await renderer.act(async () => {
      component = renderer.create(
        <HomestayCard room={mockRoom} isSaved={false} />
      );
    });

    const jsonStr = JSON.stringify(component.toJSON());
    expect(jsonStr).toContain('An Nhiên Eco Retreat Đà Nẵng');
    expect(jsonStr).toContain('4.95');
    expect(jsonStr).toContain('AI Đề xuất');
    expect(jsonStr).toContain('2.5km tới Bãi Bụt');
    expect(jsonStr).toContain('Xem phòng');
  });

  it('renders discount percentage and cancellation policy', async () => {
    let component;
    await renderer.act(async () => {
      component = renderer.create(
        <HomestayCard room={mockRoom} isSaved={true} />
      );
    });

    const jsonStr = JSON.stringify(component.toJSON());
    expect(jsonStr).toContain('24');
    expect(jsonStr).toContain('%');
    expect(jsonStr).toContain('1.650.000đ');
    expect(jsonStr).toContain('1.250.000đ');
    expect(jsonStr).toContain('Miễn phí hủy phòng trước 48h');
  });

  it('renders amenities properly when they are objects with { id, name, icon, _id }', async () => {
    const roomWithObjectAmenities = {
      ...mockRoom,
      amenities: [
        { id: '1', name: 'Wifi tốc độ cao', icon: 'wifi', _id: '6ace59ef30cddf9c0815f9bd' },
        { id: '2', name: 'Bếp riêng cao cấp', icon: 'restaurant', _id: '6ace59ef30cddf9c0815f9be' },
      ],
    };

    let component;
    await renderer.act(async () => {
      component = renderer.create(
        <HomestayCard room={roomWithObjectAmenities} isSaved={false} />
      );
    });

    const jsonStr = JSON.stringify(component.toJSON());
    expect(jsonStr).toContain('Wifi tốc độ cao');
    expect(jsonStr).toContain('Bếp riêng cao cấp');
  });
});
