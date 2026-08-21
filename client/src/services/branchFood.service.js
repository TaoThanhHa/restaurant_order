import api from "../api/axiosClient";

const branchFoodService = {

      
    // Lấy danh sách món của chi nhánh
      

    getAll() {
        return api.get("/branch-foods");
    },

      
    // Đổi trạng thái món
      

    updateStatus(foodId, status) {
        return api.patch(
            `/branch-foods/${foodId}/status`,
            {
                status,
            }
        );
    },

};

export default branchFoodService;