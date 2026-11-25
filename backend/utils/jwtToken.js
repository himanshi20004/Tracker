const toSafeUser = (user) => {
    if (!user) return null;
    const obj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete obj.password;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpire;
    delete obj.__v;
    return obj;
};

const sendToken = (user, statusCode, res) => {
    const token = user.getJWTToken();
    const cookieExpireDays = Number(process.env.COOKIE_EXPIRE) || 5;
    const isProduction = process.env.NODE_ENV === 'production';

    const options = {
        expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction,
    };

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        user: toSafeUser(user),
        token,
    });
};

module.exports = sendToken;
module.exports.toSafeUser = toSafeUser;
