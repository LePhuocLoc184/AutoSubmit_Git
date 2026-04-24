# 🚀 Git Submit Tool - Trợ Lý Nộp Bài Tự Động (Pro Version)

**Git Submit Tool** là công cụ dòng lệnh (CLI) được thiết kế đặc biệt giúp tự động hóa quy trình nộp bài tập code (C/C++, Web Front-end) lên GitHub. 

Phiên bản này đã được đóng gói thành file thực thi độc lập (`.exe`) và thiết lập như một lệnh hệ thống. Chỉ với một từ khóa `submit`, công cụ sẽ lo toàn bộ quy trình: khởi tạo Git, xử lý conflict, đẩy code và mở web kiểm tra thành quả.

---

## ✨ Tính Năng Nổi Bật

- **Chạy Trực Tiếp (Standalone):** Không cần cài đặt Node.js hay các thư viện trung gian.
- **Khởi Tạo Tự Động:** Tự động `git init` nếu thư mục chưa có Git.
- **Tích Hợp GitHub CLI:** Tạo repository mới trực tiếp từ Terminal.
- **Ghi Nhớ Cấu Hình:** Tự động lưu tên Organization (`IT202RIKKEI`...) cho các lần nộp bài sau.
- **Tự Động "Chữa Cháy":** Cảnh báo và hỗ trợ tự động gộp code (`pull --rebase`) nếu có conflict.
- **One-click Open:** Tự bật trình duyệt web trỏ thẳng vào repo sau khi push thành công.

---

## ⚙️ Yêu Cầu Hệ Thống

Máy tính của bạn chỉ cần cài đặt 2 công cụ lõi sau (Không cần Node.js):

1. **[Git](https://git-scm.com/):** Để quản lý phiên bản code.
2. **[GitHub CLI (`gh`)](https://cli.github.com/):** Để giao tiếp với GitHub.
   > **⚠️ Quan trọng:** Sau khi cài GitHub CLI, hãy mở Terminal và chạy lệnh `gh auth login` để đăng nhập tài khoản GitHub của bạn trước khi dùng tool.

---

## 🛠️ Hướng Dẫn Cài Đặt Lệnh Global

Để biến tool này thành một câu lệnh có thể gọi ở bất kỳ thư mục nào trên máy tính, bạn chỉ cần thiết lập 1 lần duy nhất theo các bước sau:

**1. Tạo thư mục lưu trữ:** Tạo một thư mục ở ổ C (Ví dụ: `C:\PTIT_Tools`) và copy file `submit.exe` tải về vào thư mục đó.

**2. Mở cài đặt hệ thống:** Nhấn phím `Windows` trên bàn phím, gõ chữ **"path"** và chọn mục **"Edit the system environment variables"**.

**3. Thêm vào Path:**
- Trong cửa sổ hiện ra, chọn nút **Environment Variables...** ở góc dưới cùng.
- Nhìn xuống ô **System variables** (nửa dưới), cuộn tìm dòng chữ **Path**, click đúp vào nó (hoặc chọn rồi nhấn Edit).
- Nhấn nút **New** và dán chính xác đường dẫn thư mục vừa tạo (Ví dụ: `C:\PTIT_Tools`) vào ô trống.
- Nhấn **OK** liên tục ở các cửa sổ để lưu lại và thoát ra hết.

*Khởi động lại Terminal (CMD/PowerShell) hoặc VS Code để Windows nhận lệnh mới.*

---

## 🚀 Cách Sử Dụng

Sau khi setup xong, mỗi khi code xong bài và muốn nộp, bạn chỉ cần:

1. Mở Terminal (hoặc CMD/PowerShell) ngay tại thư mục chứa bài tập.
2. Gõ lệnh thần thánh:
   ```bash
   submit


## CÂU LỆNH FIX LỖI
npm install open@8 inquirer@8 chalk@4 ora@5 figlet