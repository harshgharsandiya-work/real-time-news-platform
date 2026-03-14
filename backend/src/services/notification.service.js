const prisma = require("../config/prisma");

const saveToken = async (uid, token, platform = "web") => {
    return await prisma.fcmToken.upsert({
        where: { token: token },
        update: { userId: uid, platform },
        create: { token, userId: uid, platform },
    });
};

const deleteToken = async (token) => {
    return await prisma.fcmToken.delete({
        where: { token: token },
    });
};

//TODO: SUBSCRIBE TO TOPIC

//TODO: UNSUBSCRIBE TO TOPIC

module.exports = { saveToken, deleteToken };
