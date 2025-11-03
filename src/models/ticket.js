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
        foreignKey: "first_executor_id",
        as: "first_executor",
      });
      ticket.belongsTo(models.user, {
        foreignKey: "second_executor_id",
        as: "second_executor",
      });
      ticket.belongsTo(models.user, {
        foreignKey: "third_executor_id",
        as: "third_executor",
      });
      ticket.belongsTo(models.user, {
        foreignKey: "fourth_executor_id",
        as: "fourth_executor",
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
      ticket.belongsTo(models.ticket_network_status, {
        foreignKey: "ticket_network_status_id",
      });
      ticket.belongsTo(models.company, {
        foreignKey: "company_id",
      });
      ticket.hasMany(models.ticket_job_position_reminder, {
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
      rfo: DataTypes.TEXT,
      customer_id: DataTypes.INTEGER,
      network_number: DataTypes.TEXT,
      address: DataTypes.TEXT,
      case_number: DataTypes.TEXT,
      first_executor_id: DataTypes.INTEGER,
      second_executor_id: DataTypes.INTEGER,
      third_executor_id: DataTypes.INTEGER,
      fourth_executor_id: DataTypes.INTEGER,
      ticket_category_id: DataTypes.INTEGER,
      ticket_status_id: DataTypes.INTEGER,
      ticket_access_id: DataTypes.INTEGER,
      area_id: DataTypes.INTEGER,
      complaint_time: DataTypes.DATE,
      eta: DataTypes.DECIMAL,
      pic: DataTypes.TEXT,
      pic_phone_number: DataTypes.TEXT,
      lat: DataTypes.TEXT,
      lng: DataTypes.TEXT,
      gmap: DataTypes.TEXT,
      priority_level: DataTypes.ENUM("low", "medium", "high", "urgent"),
      ticket_trouble_category_id: DataTypes.INTEGER,
      ticket_trouble_description: DataTypes.TEXT,
      solution: DataTypes.TEXT,
      ticket_network_status_id: DataTypes.INTEGER,
      down_time: DataTypes.DATE,
      up_time: DataTypes.DATE,
      new_cable: DataTypes.INTEGER,
      external_pole: DataTypes.INTEGER,
      new_pole_setup: DataTypes.INTEGER,
      open_cut: DataTypes.INTEGER,
      drilling: DataTypes.INTEGER,
      new_closure: DataTypes.INTEGER,
      new_splitter: DataTypes.INTEGER,
      fo_jointing: DataTypes.INTEGER,
      old_datek: DataTypes.TEXT,
      new_datek: DataTypes.TEXT,
      spk_number: DataTypes.STRING,
      justification: DataTypes.TEXT,
      constraint: DataTypes.TEXT,
      company_id: DataTypes.INTEGER,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "ticket",
      created_at: "created_at",
      updated_at: "updated_at",
      underscored: true,
    }
  );
  return ticket;
};
