const prisma = require("../config/prisma");

const syncUser = async (uid, email, displayName) => {
    return await prisma.user.upsert({
        where: { uid: uid },
        update: { displayName },
        create: { uid, email, displayName },
    });
};

module.exports = { syncUser };
