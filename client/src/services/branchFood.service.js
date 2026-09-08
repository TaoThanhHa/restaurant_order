import api from "../api/axiosClient";

const branchFoodService = {
    getAll() {
        return api.get("/branch-foods");
    },

    updateStatus(foodId, status) {
        return api.patch(`/branch-foods/${foodId}/status`, {status,});
    },

};

export default branchFoodService;