"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ticket_activity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ticket_activity.belongsTo(models.ticket, {
        foreignKey: "ticket_id",
      });
      ticket_activity.belongsTo(models.ticket_status, {
        foreignKey: "ticket_status_id",
      });
      ticket_activity.hasMany(models.ticket_activity_attachment, {
        foreignKey: "ticket_activity_id",
      });
      ticket_activity.hasMany(models.ticket_activity_comment, {
        foreignKey: "ticket_activity_id",
      });
    }
  }
  ticket_activity.init(
    {
      uuid: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
      },
      ticket_id: DataTypes.INTEGER,
      ticket_status_id: DataTypes.INTEGER,
      description: DataTypes.TEXT,
      reminder: DataTypes.BOOLEAN,
      schedule_reminder: DataTypes.DATE,
      start_date: DataTypes.DATE,
      end_date: DataTypes.DATE,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "ticket_activity",
      underscored: true,
    }
  );
  return ticket_activity;
};
