"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ticket_history extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ticket_history.belongsTo(models.user, {
        foreignKey: "user_id",
      });
      ticket_history.belongsTo(models.ticket, {
        foreignKey: "ticket_id",
      });
    }
  }
  ticket_history.init(
    {
      uuid: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: DataTypes.INTEGER,
      ticket_id: DataTypes.INTEGER,
      description: DataTypes.TEXT,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "ticket_history",
      underscored: true,
    }
  );
  return ticket_history;
};
