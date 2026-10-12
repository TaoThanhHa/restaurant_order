export function getDeviceId() {
    let deviceId = localStorage.getItem("deviceId");

    if (!deviceId) {
        if (crypto?.randomUUID) {
            deviceId = crypto.randomUUID();
        } else {
            deviceId =
                "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
                    const r = Math.random() * 16 | 0;
                    const v = c === "x" ? r : (r & 0x3) | 0x8;
                    return v.toString(16);
                });
        }

        localStorage.setItem("deviceId", deviceId);
    }

    return deviceId;
}