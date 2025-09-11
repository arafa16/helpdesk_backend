"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class privilege extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  privilege.init(
    {
      uuid: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
      },
      dashboard: DataTypes.BOOLEAN,
      ticket_customer: DataTypes.BOOLEAN,
      ticket_executor: DataTypes.BOOLEAN,
      ticket: DataTypes.BOOLEAN,
      user: DataTypes.BOOLEAN,
      setting: DataTypes.BOOLEAN,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "privilege",
      underscored: true,
    }
  );
  return privilege;
};
