module.exports = (sequelize, DataTypes) => {

    const User = sequelize.define('User', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        firstName: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                not: ["[0-9<>;]"]
            }
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                not: ["[0-9<>;]"]
            }
        },
        company: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        about: {
            type: DataTypes.TEXT,
            allowNull: true,
            validate: {
                not: ["[<>]"]
            }
        }
    });

    User.associate = (models) => {
        User.belongsTo(models.Auth, {
            onDelete: 'CASCADE',
            foreignKey: 'fk_username',
            targetKey: 'username'
        });
    }
    return User;
}