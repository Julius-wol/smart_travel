1. Lấy export md từ ticket về dán vào docs
2. Prompt cho AI sài speckit đọc hiểu ticket
Input
- mô tả ticket @/docs/task_spec (đính file vào)
(prompt kỹ thì AI nó k tự đoán)
Output
- đọc hiểu ticket và sài speckit tool để research

3. Lấy link figma của ui mobile app paste vào prompt, yêu cầu AI đọc UI và Chạy bước lập kế hoạch kỹ thuật: speckit-plan (tạo plan.md, research.md, data-model.md, và API contracts)..
4. Sau khi duyệt plan, tiến hành speckit-tasks để phân rã checklist công việc cụ thể cho Mobile app & Backend.
5. Implement BE và test api cho chính xác theo test cases sinh ra từ Speckit.
6. Implement Mobile app dựa theo spec và API đã có.
8. Fix lỗi mobile app nếu thấy chưa giống.
- có thể chụp hình UI của mobile app để AI fix cho giống