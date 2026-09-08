# Xây dựng hệ thống quản lý và đặt món bằng mã QR trên nền tảng web

Hệ thống được xây dựng nhằm hỗ trợ nhà hàng quản lý hoạt động kinh doanh, chi nhánh, nhân viên, món ăn, bàn, đơn hàng, hóa đơn và khách hàng trên một nền tảng tập trung.

Hệ thống hỗ trợ mô hình nhà hàng nhiều chi nhánh, đồng thời cho phép khách hàng đặt món trực tiếp thông qua mã QR tại bàn hoặc nhân viên tạo đơn tại quầy/bàn.

## Mục tiêu của hệ thống
-	Số hóa quy trình gọi món và quản lý đơn hàng trong nhà hàng.
-	Hỗ trợ khách hàng tự đặt món bằng mã QR Code.
-	Hỗ trợ nhân viên tạo và xử lý đơn hàng tại bàn.
-	Hỗ trợ đặt món mang về và quản lý quá trình xử lý đơn.
-	Quản lý nhà hàng và nhiều chi nhánh trên một hệ thống tập trung.
-	Phân quyền quản lý giữa Admin, Branch và nhân viên.
-	Quản lý tập trung nhân viên, khách hàng, món ăn, bàn, đơn hàng và hóa đơn.
-	Theo dõi doanh thu và các số liệu thống kê của nhà hàng.
-	Hỗ trợ khách hàng theo dõi đơn hàng và gửi yêu cầu cho nhân viên.
-	Cung cấp giao diện trực quan, dễ sử dụng, phù hợp với từng nhóm người dùng.

## Công nghệ sử dụng
- Frontend: React.js, Vite, Tailwind CSS, JavaScript, Lucide React, React Router 
- Backend: Node.js, Express.js, JavaScript, JWT (JSON Web Token), Nodemailer 
- Cơ sở dữ liệu: PostgreSQL, Prisma ORM
  
## Các đối tượng sử dụng và chức năng
Hệ thống được phân quyền theo từng nhóm người dùng. Mỗi đối tượng có các chức năng phù hợp với vai trò và phạm vi quản lý.
### Admin
Quản lý toàn bộ hệ thống nhà hàng và các chi nhánh.
-	Quản lý chi nhánh, tầng và bàn của các chi nhánh.
-	Quản lý menu và món ăn.
-	Quản lý khách hàng thành viên.
-	Theo dõi và thống kê doanh thu của các chi nhánh.
-	Quản lý thông tin nhà hàng: tên nhà hàng, hình ảnh, giới thiệu.
-	Thay đổi giao diện hệ thống.
### Branch
Quản lý hoạt động của một chi nhánh theo phạm vi được phân quyền.
-	Quản lý tầng và bàn của chi nhánh.
-	Quản lý nhân viên thuộc chi nhánh.
-	Quản lý khách hàng thành viên tại chi nhánh.
-	Quản lý hóa đơn.
-	Theo dõi và thống kê doanh thu của chi nhánh.
### Nhân viên
Nhân viên được chia thành các vị trí với chức năng riêng:
#### Thu ngân
-	Xác nhận và xử lý đơn hàng tại bàn và đơn mang về.
-	Quản lý trạng thái món ăn: cập nhật món hết hàng khi nguyên liệu không còn.
-	Quản lý và xử lý hóa đơn, thanh toán.
-	Tiếp nhận và xử lý các yêu cầu từ khách hàng.
#### Order
-	Hỗ trợ đặt món hộ khách hàng tại bàn.
-	Tạo và gửi đơn hàng đến hệ thống để thu ngân xử lý.
#### Bếp
-	Tiếp nhận và xử lý các món ăn trong đơn hàng.
-	Cập nhật trạng thái món ăn trong quá trình chế biến.
-	Hoàn thành món ăn và chuyển trạng thái để nhân viên phục vụ.
### Khách hàng
Khách hàng có thể sử dụng hệ thống để đặt món, theo dõi đơn hàng và quản lý thông tin cá nhân.
-	Quét mã QR để truy cập hệ thống tại bàn.
-	Xem menu và lựa chọn món ăn.
-	Tạo đơn hàng và theo dõi trạng thái đơn hàng.
-	Gọi thêm món trong quá trình sử dụng dịch vụ.
-	Gửi yêu cầu hỗ trợ đến nhân viên.
-	Quản lý thông tin tài khoản cá nhân.
## Chức năng tài khoản
Các đối tượng sử dụng hệ thống có thể thực hiện các chức năng liên quan đến tài khoản:
-	Đăng nhập.
-	Đăng ký tài khoản.
-	Quên mật khẩu.
-	Đổi mật khẩu.
## Định hướng phát triển
Một số chức năng có thể tiếp tục mở rộng trong tương lai:
-	Đặt bàn trước.
-	Khuyến mãi và mã giảm giá.
-	Tích điểm khách hàng.
-	Thông báo realtime nâng cao.
-	Quản lý nguyên vật liệu và kho.
-	Báo cáo doanh thu nâng cao.
-	Thanh toán trực tuyến đa dạng.
-	Ứng dụng mobile cho nhân viên.
-	Hỗ trợ triển khai hệ thống trên môi trường production.
## Sinh viên thực hiện
22010252
