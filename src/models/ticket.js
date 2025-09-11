"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ticket extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ticket.belongsTo(models.user, {
        foreignKey: "user_id",
        as: "user",
      });
      ticket.belongsTo(models.customer, {
        foreignKey: "customer_id",
      });
      ticket.belongsTo(models.user, {
        foreignKey: "executor_id",
        as: "executor",
      });
      ticket.belongsTo(models.ticket_category, {
        foreignKey: "ticket_category_id",
      });
      ticket.belongsTo(models.ticket_status, {
        foreignKey: "ticket_status_id",
      });
      ticket.belongsTo(models.ticket_access, {
        foreignKey: "ticket_access_id",
      });
      ticket.belongsTo(models.ticket_trouble_category, {
        foreignKey: "ticket_trouble_category_id",
      });
      ticket.belongsTo(models.area, {
        foreignKey: "area_id",
      });
      ticket.hasMany(models.ticket_history, {
        foreignKey: "ticket_id",
      });
      ticket.hasMany(models.ticket_attachment, {
        foreignKey: "ticket_id",
      });
      ticket.hasMany(models.ticket_activity, {
        foreignKey: "ticket_id",
      });
      ticket.hasMany(models.ticket_user_reminder, {
        foreignKey: "ticket_id",
      });
    }
  }
  ticket.init(
    {
      uuid: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
      },
      code: DataTypes.STRING,
      number: DataTypes.DECIMAL,
      year: DataTypes.DECIMAL,
      display_name: DataTypes.STRING,
      user_id: DataTypes.INTEGER,
      subject: DataTypes.TEXT,
      description: DataTypes.TEXT,
      customer_id: DataTypes.INTEGER,
      network_number: DataTypes.TEXT,
      address: DataTypes.TEXT,
      case_number: DataTypes.TEXT,
      executor_id: DataTypes.INTEGER,
      ticket_category_id: DataTypes.INTEGER,
      ticket_status_id: DataTypes.INTEGER,
      ticket_access_id: DataTypes.INTEGER,
      area_id: DataTypes.INTEGER,
      eta: DataTypes.DECIMAL,
      pic: DataTypes.TEXT,
      pic_phone_number: DataTypes.TEXT,
      lat: DataTypes.TEXT,
      lng: DataTypes.TEXT,
      gmap: DataTypes.TEXT,
      priority_level: DataTypes.ENUM("low", "medium", "high", "urgent"),
      ticket_trouble_category_id: DataTypes.INTEGER,
      trouble_description: DataTypes.TEXT,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "ticket",
      underscored: true,
    }
  );
  return ticket;
};
