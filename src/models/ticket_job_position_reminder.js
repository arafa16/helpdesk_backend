"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ticket_job_position_reminder extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ticket_job_position_reminder.belongsTo(models.ticket, {
        foreignKey: "ticket_id",
      });
      ticket_job_position_reminder.belongsTo(models.job_position, {
        foreignKey: "job_position_id",
      });
    }
  }
  ticket_job_position_reminder.init(
    {
      uuid: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
      },
      ticket_id: DataTypes.INTEGER,
      job_position_id: DataTypes.INTEGER,
      reminder: DataTypes.BOOLEAN,
      schedule_reminder: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "ticket_job_position_reminder",
      underscored: true,
    }
  );
  return ticket_job_position_reminder;
};
