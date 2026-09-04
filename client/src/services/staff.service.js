import api from "../api/axiosClient";

const staffService = {

    // ========================================
    // GET ALL STAFF
    // ========================================

    getAll: () =>
        api.get("/employee"),


    // ========================================
    // GET STAFF BY ID
    // ========================================

    getById: (userId) =>
        api.get(`/employee/${userId}`),


    // ========================================
    // CREATE STAFF
    // ========================================

    create: (data) =>
        api.post("/employee", data),


    // ========================================
    // UPDATE STAFF
    // ========================================

    update: (userId, data) =>
        api.put(
            `/employee/${userId}`,
            data
        ),


    // ========================================
    // TOGGLE STATUS
    // ========================================

    toggleStatus: (userId) =>
        api.patch(
            `/employee/${userId}/status`
        ),

};

export default staffService;
