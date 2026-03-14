const { deleteToken, saveToken } = require("../services/notification.service");

const registerToken = async (req, res) => {
    try {
        const { uid, token, platform } = req.body;
        const savedToken = await saveToken(uid, token, platform);
        res.status(200).json({
            success: true,
            message: "Token registered",
            token: savedToken,
        });
    } catch (error) {
        console.log("[Error]: ", error);
        res.send(500);
    }
};

const removeToken = async (req, res) => {
    try {
        const { token } = req.params;
        await deleteToken(token);
        res.status(200).json({
            success: true,
            message: "Token delete successfully",
        });
    } catch (error) {
        console.log("[Error]: ", error);
        res.send(500);
    }
};

module.exports = { registerToken, removeToken };
