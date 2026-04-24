TỚ NGỒI VIBE CODING ĐỂ TẠO RA TOOL NÀY CHO ANH EM TIỆN NỘP BÀI THUI NHÉ

# 🚀 Git Submit Tool - Trợ Lý Ảo Quản Lý & Nộp Bài Tự Động

**Git Submit Tool** là một công cụ dòng lệnh (CLI) được viết bằng Node.js, thiết kế đặc biệt dành cho anh em lập trình viên (đặc biệt là sinh viên IT học C/C++ và Front-end). 

Thay vì phải gõ đi gõ lại hàng tá câu lệnh Git nhàm chán hay click chuột tạo từng thư mục, Trợ lý ảo này sẽ giúp bạn tự động hóa 100% quy trình chỉ với một câu lệnh `submit` duy nhất!

---

## ✨ Tính Năng Nổi Bật

- 🌍 **Lệnh Toàn Cầu (Global Command):** Biến tool thành lệnh hệ thống. Mở Terminal ở bất kỳ đâu, gõ `submit` là chạy!
- 📁 **Tạo Bài Tập Hàng Loạt (Scaffold):** Tự động đẻ ra hàng loạt thư mục bài tập (VD: Bài 4, Bài 5, Bài 6...).
- 📝 **Tạo Sẵn Template Code:** Hỗ trợ nhét sẵn file `index.html, style.css, app.js` (Web) hoặc `main.cpp` (C++) vào thư mục vừa tạo để bạn code luôn.
- 🚀 **Push Hàng Loạt:** Tự động tạo repo trên GitHub và đẩy code của từng bài lên một cách trơn tru.
- 🧠 **Chữa Cháy Conflict:** Phát hiện code trên GitHub bị lệch, tự động đề xuất gộp code (`pull --rebase`) và hiển thị chính xác file nào vừa thay đổi.
- 🌐 **Mở Web Tự Động:** Đẩy code xong là tự động bật trình duyệt bay thẳng vào trang GitHub để ngắm thành quả.

---

## ⚙️ Yêu Cầu Hệ Thống (Bắt buộc)

Trước khi cài đặt, hãy chắc chắn máy bạn đã có đủ 3 "bảo bối" sau:

1. **[Node.js](https://nodejs.org/):** Môi trường chạy Tool.
2. **[Git](https://git-scm.com/):** Để quản lý phiên bản code.
3. **[GitHub CLI (`gh`)](https://cli.github.com/):** Công cụ giao tiếp với GitHub.
   > **⚠️ LƯU Ý SỐNG CÒN:** Sau khi cài GitHub CLI, bạn **phải** mở Terminal và chạy lệnh `gh auth login` để đăng nhập vào tài khoản GitHub của bạn trước thì tool mới có thể tự động tạo repo được nhé!

---

## 🛠️ Hướng Dẫn Cài Đặt (Chỉ 1 lần duy nhất)

**Bước 1:** Tải toàn bộ Source Code của tool này về máy (Bấm nút xanh `Code` -> `Download ZIP`) và giải nén ra một thư mục cố định (VD: `C:\PTIT_Tools\GitSubmit`).

**Bước 2:** Mở Terminal (CMD/PowerShell) tại chính thư mục vừa giải nén đó.

**Bước 3:** Chạy lệnh sau để tải toàn bộ các thư viện cần thiết (không cần cài lẻ tẻ):
```bash
npm install
Bước 4: Chạy lệnh "Thần thánh" để biến tool thành lệnh hệ thống:

Bash
npm link
(Xong! Giờ bạn có thể đóng Terminal này lại).

🎮 Cách Sử Dụng
Sau khi setup xong, quy trình làm việc của bạn sẽ nhàn rỗi như sau:

1. Khởi tạo bài mới:

Mở Terminal ở thư mục môn học.

Gõ lệnh submit -> Chọn tính năng Tạo thư mục bài tập tự động.

Nhập số lượng bài, chọn loại code (Web/C++) và xem tool biểu diễn.

2. Nộp bài (Push Code):

Khi code xong 1 bài, mở Terminal tại thư mục bài đó.

Gõ lệnh submit -> Chọn Nộp bài lên GitHub.

Gõ lời nhắn (Commit message) và Enter. Tool sẽ tự động đẩy code lên mạng!

🤝 Tác Giả
Công cụ được phát triển bằng đam mê để tối ưu hóa thời gian học tập cho anh em coder.

Tác giả: Lê Phước Lộc

Phiên bản: 1.0.0

Chúc anh em code mượt mà, không bug và điểm tuyệt đối! 🎯