
const sepayWebhookService = require("./sepayWebhook.service");

const handleWebhook = async (req, res) => {
    try {
        if (!Buffer.isBuffer(req.rawBody)) {
            return res.status(400).json({
                success: false,
                message: "Không nhận được dữ liệu webhook gốc.",
            });
        }

        let payload;

        try {
            payload = JSON.parse(req.rawBody.toString("utf8"));
        } catch {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu webhook không phải JSON hợp lệ.",
            });
        }

        const result = await sepayWebhookService.processWebhook(payload);

        return res.status(200).json({
            success: true,
            message: "Webhook đã được xử lý.",
            data: result,
        });
    } catch (error) {
        console.error("SEPAY WEBHOOK ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Không thể xử lý giao dịch webhook.",
        });
    }
};

module.exports = {
    handleWebhook,
};
