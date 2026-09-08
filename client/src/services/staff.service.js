import api from "../api/axiosClient";

const staffService = {

    getAll: () =>
        api.get("/employee"),


    getById: (userId) =>
        api.get(
            `/employee/${userId}`
        ),


    create: (data) =>
        api.post(
            "/employee",
            data
        ),


    update: (userId, data) =>
        api.put(
            `/employee/${userId}`,
            data
        ),


    toggleStatus: (userId) =>
        api.patch(
            `/employee/${userId}/toggle-status`
        ),

};

export default staffService;