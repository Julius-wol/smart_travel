import React from 'react';
import renderer from 'react-test-renderer';
import ZeroResultView from '../src/components/ZeroResultView';

describe('ZeroResultView Component (SMART-84)', () => {
  it('renders default empty state text when no search query is given', async () => {
    let component;
    await renderer.act(async () => {
      component = renderer.create(<ZeroResultView />);
    });
    const str = JSON.stringify(component.toJSON());
    expect(str).toContain('Không tìm thấy homestay phù hợp');
    expect(str).toContain('Không có homestay nào phù hợp với bộ lọc hiện tại');
  });

  it('renders customized message when search query is provided', async () => {
    let component;
    await renderer.act(async () => {
      component = renderer.create(<ZeroResultView searchQuery="Sapa" />);
    });
    const str = JSON.stringify(component.toJSON());
    expect(str).toContain('Không có kết quả nào cho \\"Sapa\\"');
  });

  it('renders reset button when onResetFilters callback is passed', async () => {
    const mockReset = jest.fn();
    let component;
    await renderer.act(async () => {
      component = renderer.create(<ZeroResultView onResetFilters={mockReset} />);
    });
    const str = JSON.stringify(component.toJSON());
    expect(str).toContain('Xóa tất cả bộ lọc');
  });
});
