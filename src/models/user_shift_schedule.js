"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class user_shift_schedule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user_shift_schedule.belongsTo(models.user, {
        foreignKey: "user_id",
      });
      user_shift_schedule.belongsTo(models.shift_schedule, {
        foreignKey: "shift_schedule_id",
      });
    }
  }
  user_shift_schedule.init(
    {
      uuid: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
      },
      name: DataTypes.STRING,
      user_id: DataTypes.INTEGER,
      shift_schedule_id: DataTypes.INTEGER,
      day_off: DataTypes.ENUM(
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
      ),
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "user_shift_schedule",
      underscored: true,
    }
  );
  return user_shift_schedule;
};
