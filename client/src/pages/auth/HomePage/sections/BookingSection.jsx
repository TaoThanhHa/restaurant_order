import { CalendarDays, ChevronDown, Clock3, MapPin, UsersRound } from "lucide-react";
import SectionTitle from "../components/SectionTitle";

export default function BookingSection() {
  const handleSubmit = (event) => {
    event.preventDefault();
    alert("Đã nhận thông tin đặt bàn!");
  };

  return (
    <section id="booking" className="booking-section">
      <div className="container">
        <div className="booking-card">
          <SectionTitle
            eyebrow="DỊCH VỤ CHU ĐÁO"
            title="Đặt Bàn Giữ Chỗ Trực Tuyến"
            description="Xác nhận nhanh chóng chỉ trong 30 giây - Đảm bảo vị trí ngồi đẹp nhất"
          />

          <form onSubmit={handleSubmit} className="booking-form">
            <label>
              Tên người đặt <em>*</em>
              <input required placeholder="Nguyễn Văn A" />
            </label>

            <label>
              Số điện thoại liên hệ <em>*</em>
              <input required type="tel" placeholder="091 234 5678" />
            </label>

            <label>
              Chọn cơ sở <em>*</em>
              <div className="input-icon">
                <MapPin size={15} />
                <select defaultValue="ba-dinh">
                  <option value="ba-dinh">Cơ sở 1: Hoàng Hoa Thám, Ba Đình, Hà Nội</option>
                  <option value="cau-giay">Cơ sở 2: Trần Thái Tông, Cầu Giấy, Hà Nội</option>
                </select>
                <ChevronDown size={15} />
              </div>
            </label>

            <label>
              Giờ đặt & Ngày dùng bữa <em>*</em>
              <div className="input-icon">
                <CalendarDays size={15} />
                <input required type="datetime-local" />
              </div>
            </label>

            <label className="booking-form__full">
              Số lượng khách <em>*</em>
              <div className="input-icon">
                <UsersRound size={15} />
                <select defaultValue="4">
                  <option value="2">2 Người</option>
                  <option value="4">4 Người</option>
                  <option value="6">6 Người</option>
                  <option value="8">8 Người</option>
                  <option value="10">10+ Người</option>
                </select>
                <ChevronDown size={15} />
              </div>
            </label>

            <label className="booking-form__full">
              Lưu ý (nếu có)
              <textarea placeholder="Yêu cầu về vị trí ngồi, ghế trẻ em, trang trí sinh nhật..." />
            </label>

            <button className="primary-btn booking-submit" type="submit">
              Xác Nhận Đặt Bàn Ngay
              <span>✓</span>
            </button>

            <p className="booking-note">
              <Clock3 size={12} />
              Chúng tôi sẽ gọi điện xác nhận lại form đặt bàn, mong quý khác chú ý điện thoại.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}