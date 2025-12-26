# Hướng dẫn tạo Test Images

Để chạy đầy đủ các test, bạn cần tạo thư mục `test-images` với các file sau:

## Tạo thư mục:
```bash
mkdir test-images
```

## Các file cần thiết:

1. **house_ok.jpg** - Ảnh nhà hợp lệ
   - Định dạng: JPG
   - Kích thước: < 10MB
   - Độ phân giải: Khuyến nghị 1920x1080 hoặc nhỏ hơn
   - Nội dung: Ảnh nhà thực tế

2. **house_big_25mb.jpg** - Ảnh nhà lớn để test giới hạn
   - Định dạng: JPG
   - Kích thước: > 10MB (khoảng 25MB)
   - Dùng để test TC_007

3. **style_ok.png** - Ảnh mẫu phong cách
   - Định dạng: PNG
   - Kích thước: < 10MB
   - Nội dung: Ảnh mẫu thiết kế ngoại thất

4. **document.pdf** - File PDF để test sai định dạng
   - Định dạng: PDF
   - Dùng để test TC_006, TC_051

5. **test-avatar.jpg** - Avatar để test upload
   - Định dạng: JPG
   - Kích thước: < 5MB
   - Kích thước: Khuyến nghị 200x200 hoặc 400x400

6. **house_new.jpg** - Ảnh nhà mới để test thay thế
   - Định dạng: JPG
   - Kích thước: < 10MB
   - Dùng để test TC_036

## Lưu ý:

- Các file này chỉ dùng cho testing, không commit vào git
- Có thể dùng ảnh mẫu hoặc tạo ảnh test đơn giản
- Một số test sẽ skip nếu không có file test (không fail)

## Tạo file test đơn giản (nếu cần):

Bạn có thể tạo file ảnh test đơn giản bằng các công cụ online hoặc script:

```bash
# Tạo ảnh test đơn giản bằng ImageMagick (nếu có)
convert -size 1920x1080 xc:blue test-images/house_ok.jpg
convert -size 1920x1080 xc:red test-images/house_new.jpg
```

Hoặc download ảnh mẫu từ các trang như:
- https://unsplash.com/
- https://pixabay.com/





