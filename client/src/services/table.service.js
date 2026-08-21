import axiosClient from "../api/axiosClient";

const getByFloor = async (floorId)=>{
    const res=await axiosClient.get(`/tables/floor/${floorId}`);
    return res.data;
};

const getById = async(id)=>{
    const res=await axiosClient.get(`/tables/${id}`);
    return res.data;
};

const handlePayment = async () => {
    await orderService.payment(order.id);
    reload();
};

const open = async (tableId, data) => {
    const res = await axiosClient.post(
        `/tables/${tableId}/open`,
        data
    );

    return res.data;
};

const create = async (data) => {
    const res = await axiosClient.post("/tables", data);
    return res.data;
};

const update = async (id, data) => {
    const res = await axiosClient.put(`/tables/${id}`, data);
    return res.data;
};

const remove = async (id) => {
    const res = await axiosClient.delete(`/tables/${id}`);
    return res.data;
};

export default{
    getByFloor,
    getById,
    handlePayment,
    open,
    create,
    update,
    remove,
};