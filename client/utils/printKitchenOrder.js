export const printKitchenOrder = (order, table) => {
    const printWindow = window.open(
        "",
        "_blank",
        "width=400,height=600"
    );

    if (!printWindow) {
        alert(
            "Trình duyệt đã chặn cửa sổ in. Vui lòng cho phép popup."
        );
        return;
    }

    const tableName =
        order?.session?.table?.name ||
        order?.session?.table?.tableNumber ||
        order?.session?.table?.qrCode ||
        "Không xác định";

    const items = order.orderItems || [];

    const itemsHtml = items
        .map(
            (item) => `
                <tr>
                    <td>
                        ${item.food?.name || "Món ăn"}

                        ${
                            item.note
                                ? `
                                    <div class="note">
                                        Ghi chú: ${item.note}
                                    </div>
                                `
                                : ""
                        }
                    </td>

                    <td class="quantity">
                        ${item.quantity}
                    </td>
                </tr>
            `
        )
        .join("");

    const createdAt = order.createdAt
        ? new Date(order.createdAt).toLocaleString("vi-VN")
        : new Date().toLocaleString("vi-VN");

    printWindow.document.write(`
        <!DOCTYPE html>

        <html lang="vi">

        <head>
            <meta charset="UTF-8" />

            <title>
                Phiếu bếp - ${order.orderCode || order.id}
            </title>

            <style>

                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    padding: 20px;
                    font-family: Arial, sans-serif;
                    color: #000;
                    font-size: 14px;
                }

                .ticket {
                    width: 100%;
                    max-width: 380px;
                    margin: auto;
                }

                .header {
                    text-align: center;
                    margin-bottom: 15px;
                }

                .title {
                    font-size: 22px;
                    font-weight: bold;
                    margin-bottom: 8px;
                }

                .order-code {
                    font-size: 14px;
                    font-weight: bold;
                }

                .info {
                    border-top: 1px dashed #000;
                    border-bottom: 1px dashed #000;
                    padding: 10px 0;
                    margin: 10px 0;
                }

                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 5px 0;
                }

                .table-name {
                    font-size: 20px;
                    font-weight: bold;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                th {
                    text-align: left;
                    border-bottom: 1px solid #000;
                    padding: 6px 0;
                }

                td {
                    padding: 9px 0;
                    border-bottom: 1px dashed #ccc;
                    vertical-align: top;
                }

                .quantity {
                    width: 50px;
                    text-align: center;
                    font-size: 18px;
                    font-weight: bold;
                }

                .note {
                    margin-top: 3px;
                    font-size: 12px;
                    font-style: italic;
                }

                .footer {
                    text-align: center;
                    margin-top: 15px;
                    font-size: 12px;
                }

                @media print {

                    body {
                        padding: 0;
                    }

                    .ticket {
                        max-width: none;
                    }

                }

            </style>
        </head>

        <body>

            <div class="ticket">

                <div class="header">

                    <div class="title">
                        PHIẾU BẾP
                    </div>

                    <div class="order-code">
                        ${order.orderCode || `#${order.id}`}
                    </div>

                </div>


                <div class="info">

                    <div class="info-row">

                        <span>
                            Bàn
                        </span>

                        <span class="table-name">
                            ${tableName}
                        </span>

                    </div>

                    <div class="info-row">

                        <span>
                            Thời gian
                        </span>

                        <span>
                            ${createdAt}
                        </span>

                    </div>

                </div>


                <table>

                    <thead>

                        <tr>

                            <th>
                                Món ăn
                            </th>

                            <th style="text-align:center">
                                SL
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        ${itemsHtml}

                    </tbody>

                </table>


                ${
                    order.note
                        ? `
                            <div class="info">

                                <strong>
                                    Ghi chú đơn:
                                </strong>

                                <div>
                                    ${order.note}
                                </div>

                            </div>
                        `
                        : ""
                }


                <div class="footer">
                    --- BẾP ---
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