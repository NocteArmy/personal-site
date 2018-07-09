module.exports = (sequelize, DataTypes) => {

    const Auth = sequelize.define('Auth', {
        userId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        username: {
            type: 'citext',
            allowNull: false,
            unique: true,
            validate: {
                len: {
                    args: [3,30],
                    msg: 'Username must be between 3 and 30 characters'
                },
                is: /^[A-Za-z0-9_-]+$/
            }
        },
        email: { 
            type: 'citext', 
            allowNull: false,
            unique: true,
            validate: {
                isEmail: {
                    msg: 'Please enter a valid email'
                }
            }
        },
        hashPass: { type: DataTypes.STRING, allowNull: false },
        role: { type: DataTypes.ENUM('ban', 'user', 'mod', 'owner'), allowNull: false, defaultValue: 'user' },
        verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        verifyToken: { type: DataTypes.STRING, allowNull: true },
        verifyTokenExpires: { type: DataTypes.DATE, allowNull: true }
    });

    Auth.associate = models => Auth.hasMany(models.Feedback);
    return Auth;
}