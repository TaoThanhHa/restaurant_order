const reservationService = require("../src/components/reservation/reservation.service");

const startReservationJob = () => {
    const process = async () => {
        try {
            const result = await reservationService.processNoShows();

            if (result.count > 0) {
                console.log(`Reservation NO_SHOW: ${result.count}`);
            }
        } catch (error) {
            console.error("RESERVATION JOB ERROR:", error.message);
        }
    };

    process();
    return setInterval(process, 60 * 1000);
};

module.exports = startReservationJob;