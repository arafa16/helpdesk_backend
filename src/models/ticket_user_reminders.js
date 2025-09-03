"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ticket_user_reminder extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ticket_user_reminder.belongsTo(models.user, {
        foreignKey: "user_id",
      });
      ticket_user_reminder.belongsTo(models.ticket, {
        foreignKey: "ticket_id",
      });
    }
  }
  ticket_user_reminder.init(
    {
      uuid: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: DataTypes.INTEGER,
      ticket_id: DataTypes.INTEGER,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "ticket_user_reminder",
      underscored: true,
    }
  );
  return ticket_user_reminder;
};
