export const printInvoice = (order, paymentMethod) => {
    const printWindow = window.open(
        "",
        "_blank",
        "width=400,height=700"
    );

    if (!printWindow) {
        alert(
            "Trình duyệt đã chặn cửa sổ in. Vui lòng cho phép popup."
        );
        return;
    }

    const items =
        order?.orderItems?.filter(
            item => item.status !== "CANCELLED"
        ) || [];

    const total = items.reduce(
        (sum, item) =>
            sum +
            Number(item.price) * Number(item.quantity),
        0
    );

    const customerPhone =
    order?.orderMembers?.[0]?.customer?.phone || null;

    const isTakeAway = order?.orderType === "TAKE_AWAY";

    const tableName = isTakeAway
        ? "MANG VỀ"
        : (
            order?.session?.table?.tableNumber ||
            order?.session?.table?.name ||
            order?.session?.table?.qrCode ||
            "Không xác định"
        );

    const paymentText =
        paymentMethod === "CASH"
            ? "Tiền mặt"
            : "Chuyển khoản";

    const createdAt = order?.createdAt
        ? new Date(order.createdAt).toLocaleString("vi-VN")
        : new Date().toLocaleString("vi-VN");

    const itemsHtml = items
        .map(
            item => `
                <div class="item">
                    <div class="item-name">
                        ${item.food?.name || "Món ăn"}
                    </div>

                    <div class="item-row">
                        <span>
                            ${item.quantity} x
                            ${Number(item.price).toLocaleString()}đ
                        </span>

                        <strong>
                            ${(
                                Number(item.price) *
                                Number(item.quantity)
                            ).toLocaleString()}đ
                        </strong>
                    </div>
                </div>
            `
        )
        .join("");

    printWindow.document.write(`
        <!DOCTYPE html>

        <html lang="vi">

        <head>

            <meta charset="UTF-8">

            <title>
                Hóa đơn ${order?.orderCode || order?.id}
            </title>

            <style>

                * {
                    box-sizing: border-box;
                }

                html,
                body {
                    margin: 0;
                    padding: 0;
                    width: 80mm;
                }

                body {
                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;

                    color: #000;
                    font-size: 13px;
                }

                .invoice {
                    width: 80mm;
                    padding: 8px;
                }

                .center {
                    text-align: center;
                }

                .restaurant {
                    font-size: 20px;
                    font-weight: bold;
                }

                .title {
                    margin-top: 4px;
                    font-size: 16px;
                    font-weight: bold;
                }

                .code {
                    margin-top: 4px;
                    font-size: 12px;
                }

                .line {
                    margin: 8px 0;
                    border-top: 1px dashed #000;
                }

                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 5px 0;
                }

                .table {
                    font-size: 18px;
                    font-weight: bold;
                }

                .items {
                    margin-top: 8px;
                }

                .item {
                    padding: 7px 0;
                    border-bottom: 1px dashed #ccc;
                }

                .item-name {
                    font-weight: bold;
                    font-size: 14px;
                }

                .item-row {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 3px;
                }

                .total {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 10px;
                    font-size: 18px;
                    font-weight: bold;
                }

                .payment {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 6px;
                }

                .footer {
                    margin-top: 15px;
                    padding-top: 8px;
                    border-top: 1px dashed #000;
                    text-align: center;
                    font-size: 12px;
                }

                @media print {

                    @page {
                        size: 80mm auto;
                        margin: 0;
                    }

                    html,
                    body {
                        width: 80mm;
                        margin: 0;
                        padding: 0;
                    }

                    .invoice {
                        width: 80mm;
                    }

                }

            </style>

        </head>

        <body>

            <div class="invoice">

                <div class="center">

                    <div class="restaurant">
                        QUÁN ĂN
                    </div>

                    <div class="title">
                        HÓA ĐƠN THANH TOÁN
                    </div>

                    <div class="code">
                        ${order?.orderCode || `#${order?.id}`}
                    </div>

                </div>

                <div class="line"></div>

                <div class="info-row">

                    <span>
                        ${isTakeAway ? "Loại đơn" : "Bàn"}
                    </span>

                    <span class="table">
                        ${tableName}
                    </span>

                </div>

                ${customerPhone ? `
                    <div class="info-row">
                        <span>SĐT</span>
                        <span>${customerPhone}</span>
                    </div>
                ` : ""}

                <div class="info-row">

                    <span>Thời gian</span>

                    <span>
                        ${createdAt}
                    </span>

                </div>

                <div class="line"></div>

                <div class="items">

                    ${itemsHtml}

                </div>

                <div class="line"></div>

                <div class="total">

                    <span>
                        Tổng tiền
                    </span>

                    <span>
                        ${total.toLocaleString()}đ
                    </span>

                </div>

                <div class="payment">

                    <span>
                        Thanh toán
                    </span>

                    <strong>
                        ${paymentText}
                    </strong>

                </div>

                <div class="footer">

                    Cảm ơn quý khách!
                    <br>
                    Hẹn gặp lại quý khách.

                </div>

            </div>

            <script>

                window.onload = function () {

                    window.focus();

                    window.print();

                };

                window.onafterprint = function () {

                    window.close();

                };

            </script>

        </body>

        </html>
    `);

    printWindow.document.close();
};