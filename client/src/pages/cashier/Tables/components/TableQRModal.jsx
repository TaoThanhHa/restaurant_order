import { useEffect, useState } from "react";
import { X, QrCode, Download, Printer } from "lucide-react";
import QRCode from "qrcode";

import Button from "../../../../components/Button/Button";

export default function TableQRModal({ open, table, onClose }) {
    const [qrImage, setQrImage] = useState("");

    // LINK KHÁCH HÀNG

    const getCustomerUrl = (qrCode) => {
        if (!qrCode) return "";

        const frontendUrl = import.meta.env.VITE_APP_URL || "http://localhost:5173";

        return `${frontendUrl}/customer/${qrCode}`;
    };

    // TẠO QR

    useEffect(() => {
        if (!open || !table?.qrCode) {
            setQrImage("");
            return;
        }

        const url = getCustomerUrl(table.qrCode);

        QRCode.toDataURL(url, { width: 400, margin: 2 })
            .then(setQrImage)
            .catch((err) => {
                console.error("QR ERROR:", err);
                setQrImage("");
            });
    }, [open, table]);

    // DOWNLOAD

    const handleDownload = () => {
        if (!qrImage || !table) return;

        const link = document.createElement("a");

        link.href = qrImage;
        link.download = `QR-Ban-${table.tableNumber}.png`;
        link.click();
    };

    // PRINT

    const handlePrint = () => {
        if (!qrImage || !table) return;

        const printWindow = window.open("", "_blank", "width=600,height=700");

        if (!printWindow) {
            alert("Trình duyệt đã chặn cửa sổ in.");
            return;
        }

        const customerUrl = getCustomerUrl(table.qrCode);

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>QR Bàn ${table.tableNumber}</title>
                    <style>
                        * { box-sizing: border-box; }

                        body {
                            margin: 0;
                            padding: 40px;
                            font-family: Arial, sans-serif;
                            text-align: center;
                        }

                        h1 { margin-bottom: 8px; }

                        .table {
                            font-size: 20px;
                            font-weight: bold;
                            margin-bottom: 20px;
                        }

                        img {
                            width: 350px;
                            height: 350px;
                        }

                        .url {
                            margin-top: 20px;
                            font-size: 12px;
                            word-break: break-all;
                            color: #555;
                        }

                        .note {
                            margin-top: 15px;
                            font-size: 14px;
                        }
                    </style>
                </head>

                <body>
                    <h1>QUÉT QR ĐỂ GỌI MÓN</h1>

                    <div class="table">Bàn ${table.tableNumber}</div>

                    <img src="${qrImage}" alt="QR Code" />

                    <div class="note">
                        Vui lòng quét mã QR để xem menu và gọi món
                    </div>

                    <div class="url">${customerUrl}</div>
                </body>
            </html>
        `);

        printWindow.document.close();

        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    };

    if (!open || !table) return null;

    const customerUrl = getCustomerUrl(table.qrCode);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 mb-0">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* HEADER */}
                <div className="flex items-center justify-between border-b p-3">
                    <div className="flex items-center gap-2">
                        <QrCode size={22} />
                        <h2 className="text-xl font-bold">QR Bàn {table.tableNumber}</h2>
                    </div>

                    <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-3">
                    {qrImage ? (
                        <>
                            <div id="qr-print-area" className="flex flex-col items-center rounded-xl border bg-gray-50 p-3">
                                <div className="mb-2 text-lg font-bold">BÀN {table.tableNumber}</div>

                                <div className="rounded-xl bg-white shadow">
                                    <img
                                        src={qrImage}
                                        alt={`QR Bàn ${table.tableNumber}`}
                                        className="h-50 w-50"
                                    />
                                </div>

                                <p className="text-sm text-gray-500">
                                    Quét mã QR để xem menu và gọi món
                                </p>
                            </div>

                            {/* URL */}
                            <div className="mt-2">
                                <label className="mb-2 block text-sm font-semibold">Link gọi món</label>

                                <div className="break-all rounded-lg bg-gray-100 p-3 text-xs text-gray-600">
                                    {customerUrl}
                                </div>
                            </div>

                            {/* BUTTONS */}
                            <div className="mt-3 grid grid-cols-2 gap-3">
                                <Button className="flex items-center justify-center gap-2" onClick={handleDownload}>
                                    <Download size={18} />
                                    Lưu QR
                                </Button>

                                <Button className="flex items-center justify-center gap-2" onClick={handlePrint}>
                                    <Printer size={18} />
                                    In QR
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="py-10 text-center text-gray-400">
                            Đang tạo QR...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}