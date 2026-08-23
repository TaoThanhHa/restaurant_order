import api from "../api/axiosClient";

const staffService = {

    getAll: (branchId) =>
        api.get(`/staff/branch/${branchId}`),

    getById: (branchId, userId) =>
        api.get(`/staff/branch/${branchId}/${userId}`),

    create: (branchId, data) =>
        api.post(`/staff/branch/${branchId}`, data),

    update: (branchId, userId, data) =>
        api.put(
            `/staff/branch/${branchId}/${userId}`,
            data
        ),

    toggleStatus: (branchId, userId) =>
        api.patch(
            `/staff/branch/${branchId}/${userId}/toggle-status`
        ),

};

export default staffService;