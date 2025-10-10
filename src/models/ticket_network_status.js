"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ticket_network_status extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ticket_network_status.init(
    {
      uuid: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
      },
      name: DataTypes.STRING,
      sequence: DataTypes.DECIMAL,
      code: DataTypes.DECIMAL,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "ticket_network_status",
      underscored: true,
    }
  );
  return ticket_network_status;
};
