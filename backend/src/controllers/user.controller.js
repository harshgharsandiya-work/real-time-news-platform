const { syncUser } = require("../services/user.service");

const syncUserToDb = async (req, res) => {
    try {
        const { uid, email, displayName } = req.body;

        if (!uid || !email) {
            return res.send(400);
        }

        const user = await syncUser(uid, email, displayName);

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        res.send(500);
    }
};

module.exports = { syncUserToDb };
