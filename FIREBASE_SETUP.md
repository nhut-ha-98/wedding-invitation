# Hướng Dẫn Thiết Lập Google Firebase Firestore Cho RSVP

Tài liệu hướng dẫn tạo project Firebase, bật Firestore Database, cấp quyền ghi công khai và lấy thông tin cấu hình vào ứng dụng.

---

## Bước 1: Tạo Project Firebase
1. Truy cập [Firebase Console](https://console.firebase.google.com/).
2. Nhấp **Add project** (Thêm dự án).
3. Đặt tên project (ví dụ: `wedding-invitation`).
4. Nhấn **Continue** (Google Analytics có thể bật hoặc tắt tùy ý) -> Nhấn **Create project**.

---

## Bước 2: Tạo Firestore Database
1. Ở thanh menu bên trái, vào **Build** -> **Firestore Database**.
2. Nhấn **Create database**.
3. Chọn vị trí Database (Location): chọn `asia-southeast1` (Singapore) hoặc gần nhất.
4. Chọn **Start in test mode** (hoặc chuyển sang production mode để cấu hình rules).
5. Nhấn **Create**.

---

## Bước 3: Cấu Hình Firestore Security Rules (Cho phép khách gửi RSVP)
Để cho phép khách mời gửi thư hồi âm mà không cần đăng nhập tài khoản:
1. Trong màn hình Firestore Database, chuyển sang tab **Rules**.
2. Dán đoạn Rules sau:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rsvps/{document=**} {
      // Cho phép khách ghi mới (create) không cần login
      allow create: if true;
      // Chỉ cho phép đọc / sửa nếu có tài khoản quản trị viên
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

3. Nhấn **Publish** (Xuất bản).

---

## Bước 4: Lấy Project ID & Web API Key
1. Nhấp vào icon bánh răng **Project settings** (Cài đặt dự án) ở góc trên bên trái (cạnh *Project Overview*).
2. Tại tab **General**:
   - Sao chép **Project ID** (ví dụ: `wedding-invitation-abc12`).
   - Sao chép **Web API Key** (ví dụ: `AIzaSyD...`).
   *(Nếu chưa có Web API Key, cuộn xuống mục **Your apps**, chọn biểu tượng Web `</>`, đặt tên app và đăng ký app, Firebase sẽ hiển thị API Key)*.

---

## Bước 5: Cập Nhật Vào `src/environments/environment.ts`
Mở file [environment.ts](file:///z:/me/wedding-invitation-02/src/environments/environment.ts) (hoặc [environment.prod.ts](file:///z:/me/wedding-invitation-02/src/environments/environment.prod.ts)) và điền thông tin:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyD...',
    projectId: 'wedding-invitation-abc12',
    collection: 'rsvps',
  },
};
```

---

## Cấu Trúc Dữ Liệu Lưu Trên Firestore
Mỗi bản ghi được gửi lên collection `rsvps` sẽ có cấu trúc:
- `name` *(string)*: Tên khách mời.
- `attending` *(boolean)*: `true` (Tham dự) / `false` (Không tham dự).
- `guests` *(number)*: Số lượng người đi cùng (1-10).
- `notes` *(string)*: Lời chúc hoặc ghi chú.
- `submittedAt` *(timestamp)*: Thời gian gửi.
