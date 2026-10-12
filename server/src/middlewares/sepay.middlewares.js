const crypto = require("crypto");

module.exports = function verifySePayWebhook(req, res, next) {
    const secret = process.env.SEPAY_WEBHOOK_SECRET;
    const signature = req.get("X-SePay-Signature") || "";
    const timestamp = req.get("X-SePay-Timestamp") || "";

    if (!secret || !Buffer.isBuffer(req.rawBody)) {
        return res.status(401).json({
            success: false,
            message: "Thiếu Secret Key hoặc raw body",
        });
    }

    const timestampSeconds = Number(timestamp);

    if (
        !Number.isFinite(timestampSeconds) ||
        Math.abs(Date.now() / 1000 - timestampSeconds) > 300
    ) {
        return res.status(401).json({
            success: false,
            message: "Timestamp không hợp lệ hoặc đã hết hạn",
        });
    }

    const expected =
        "sha256=" +
        crypto
            .createHmac("sha256", secret)
            .update(`${timestamp}.${req.rawBody.toString("utf8")}`)
            .digest("hex");

    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signature);

    if (
        expectedBuffer.length !== signatureBuffer.length ||
        !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
    ) {
        return res.status(401).json({
            success: false,
            message: "Chữ ký webhook không hợp lệ",
        });
    }

    next();
};