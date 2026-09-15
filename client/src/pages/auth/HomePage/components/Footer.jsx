import { MapPin, Phone, Send } from "lucide-react";

export default function Footer() {
    return (
        <footer id="footer" className="footer">
            <div className="container">
                <div className="footer__grid">
                    <div>
                        <div className="footer-brand">
                            <span className="brand__logo">LT</span>
                            <strong>NHÀ HÀNG LÀNG TRE</strong>
                        </div>

                        <p className="footer__intro">
                            Lưu giữ tinh hoa ẩm thực truyền thống Việt Nam trong không gian mộc mạc của tre và những vị quê.
                        </p>

                        <div className="footer-address">
                            <span>
                                <MapPin size={13} />
                                Cơ sở 1: 18 Hoàng Hoa Thám, Ba Đình, Hà Nội
                            </span>

                            <span>
                                <Phone size={13} />
                                CSĐT: 024 3882 9999
                            </span>
                        </div>

                        <div className="footer-address">
                            <span>
                                <MapPin size={13} />
                                Cơ sở 2: 72 Trần Thái Tông, Cầu Giấy, Hà Nội
                            </span>

                            <span>
                                <Phone size={13} />
                                CSĐT: 024 3882 9999
                            </span>
                        </div>
                    </div>

                    <div className="text-left">
                        <h4>Thời Gian Mở Cửa</h4>

                        <p>
                            Thứ Hai - Thứ Sáu
                            <b>08:00 - 22:30</b>
                        </p>

                        <p>
                            Thứ Bảy - Chủ Nhật
                            <b>07:30 - 22:30</b>
                        </p>

                        <p>
                            Các ngày Lễ, Tết: 
                            <span className="highlight">
                                Mở cửa bình thường
                            </span>
                        </p>

                        <small>
                            ⚠ Vui lòng đặt bàn trước khi đến để được phục vụ
                            tốt nhất.
                        </small>
                    </div>

                    <div>
                        <h4>Mạng Xã Hội</h4>

                        <div className="socials">
                            <a href="#" aria-label="Facebook">
                                f
                            </a>

                            <a href="#" aria-label="Instagram">
                                ◎
                            </a>

                            <a href="#" aria-label="Youtube">
                                ▶
                            </a>

                            <a href="#" aria-label="Zalo">
                                Z
                            </a>
                        </div>
                    </div>
                </div>

                <div className="footer__bottom">
                    <span>
                        © 2026 Nhà Hàng Làng Tre. Tất cả quyền được bảo lưu.
                    </span>

                    <div>
                        <a href="#">Chính sách bảo mật</a>
                        <a href="#">Điều khoản dịch vụ</a>
                        <a href="#">Tuyển dụng</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}