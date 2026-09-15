import { ChevronLeft, ChevronRight, Clock3, MapPin, Phone, Navigation } from "lucide-react";
import SectionTitle from "../components/SectionTitle";

const branch = {
  name: "Làng Tre Garden - Ba Đình",
  address: "Số 18 Đường Hoàng Hoa Thám, Phường Thụy Khuê, Quận Ba Đình, Hà Nội",
  phone: "024 3882 9999",
  hotline: "0909 234 5678",
  email: "badinh@langtre-restaurant.vn",
  hours: "09:00 - 22:30 (Mở cửa tất cả các ngày)",
};

export default function BranchSection() {
  return (
    <section id="branches" className="section branches">
      <div className="container">
        <SectionTitle
          eyebrow="HỆ THỐNG CHI NHÁNH"
          title="Thông Tin Các Cơ Sở"
          description="Dễ dàng tìm thấy Làng Tre tại các trung tâm thành phố"
        />

        <div className="branch-layout">
          <div className="branch-info">
            <div className="branch-info__top">
              <span className="status-pill">CƠ SỞ CHÍNH (CS1)</span>
              <div className="branch-arrows">
                <button aria-label="Cơ sở trước"><ChevronLeft size={14} /></button>
                <button aria-label="Cơ sở sau"><ChevronRight size={14} /></button>
              </div>
            </div>

            <h3>{branch.name}</h3>

            <div className="branch-detail">
              <MapPin />
              <span>{branch.address}</span>
            </div>

            <div className="branch-detail">
              <Phone />
              <span><b>{branch.phone}</b></span>
            </div>

            <div className="branch-detail">
              <span className="detail-icon">✉</span>
              <span>{branch.email}</span>
            </div>

            <div className="branch-detail">
              <Clock3 />
              <span>{branch.hours}</span>
            </div>

            <div className="branch-actions">
              <button className="text-btn"><Navigation size={14} /> Chỉ đường</button>
            </div>
          </div>

          <div className="map-card">
            <iframe
              title="Bản đồ Làng Tre Ba Đình"
              src="https://www.openstreetmap.org/export/embed.html?bbox=105.815%2C21.025%2C105.845%2C21.045&layer=mapnik&marker=21.035%2C105.83"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}