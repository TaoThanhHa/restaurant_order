import api from "../api/axiosClient";

const getAll = async() =>{
    return api.get(`/branch-foods`);
};

const updateStatus = async(foodId, status) =>{
    return api.patch(`/branch-foods/${foodId}/status`, {status, });
};
 
export default {
    getAll,
    updateStatus,
}