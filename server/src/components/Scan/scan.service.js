const prisma = require("../../config/prisma");

  
// SCAN QR
  

const scan = async (qrCode) => {

  if (!qrCode) {
    throw new Error("Mã QR không hợp lệ.");
  }

  // TÌM BÀN
  const table = await prisma.table.findUnique({
    where: {
      qrCode,
    },
    include: {
      floor: {
        include: {
          branch: true,
        },
      },
    },
  });

  if (!table) {
    throw new Error("Bàn không tồn tại.");
  }
 
  // KIỂM TRA DINING SESSION
  let session = await prisma.diningSession.findFirst({
    where: {
      tableId: table.id,
      status: "ACTIVE",
    },
    orderBy: {
      id: "desc",
    },
  });

    
  // CHƯA CÓ SESSION -> TẠO MỚI
  if (!session) {

    session = await prisma.diningSession.create({
      data: {
        tableId: table.id,
        status: "ACTIVE",
      },
    });

  }

    
  // RETURN
    

  return {
    table,
    session,
  };

};

module.exports = {
  scan,
};