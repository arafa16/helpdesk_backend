"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ticket_attachment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ticket_attachment.belongsTo(models.ticket, {
        foreignKey: "ticket_id",
      });
    }
  }
  ticket_attachment.init(
    {
      uuid: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
      },
      ticket_id: DataTypes.INTEGER,
      name: DataTypes.TEXT,
      file_name: DataTypes.TEXT,
      file_type: DataTypes.TEXT,
      file_url: DataTypes.TEXT,
      description: DataTypes.TEXT,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "ticket_attachment",
      underscored: true,
    }
  );
  return ticket_attachment;
};
