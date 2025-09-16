"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user.belongsTo(models.location, {
        foreignKey: "location_id",
      });
      user.belongsTo(models.division, {
        foreignKey: "division_id",
      });
      user.belongsTo(models.user_status, {
        foreignKey: "user_status_id",
      });
      user.belongsTo(models.privilege, {
        foreignKey: "privilege_id",
      });
      user.belongsTo(models.company, {
        foreignKey: "company_id",
      });
      user.belongsTo(models.job_position, {
        foreignKey: "job_position_id",
      });
    }
  }
  user.init(
    {
      uuid: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
      },
      name: DataTypes.STRING,
      nip: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      phone_number: DataTypes.STRING,
      location_id: DataTypes.INTEGER,
      division_id: DataTypes.INTEGER,
      user_status_id: DataTypes.INTEGER,
      is_executor: DataTypes.BOOLEAN,
      is_customer: DataTypes.BOOLEAN,
      company_id: DataTypes.INTEGER,
      job_position_id: DataTypes.INTEGER,
      privilege_id: DataTypes.INTEGER,
      photo_name: DataTypes.TEXT,
      photo_type: DataTypes.TEXT,
      photo_url: DataTypes.TEXT,
      background_name: DataTypes.TEXT,
      background_type: DataTypes.TEXT,
      background_url: DataTypes.TEXT,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "user",
      underscored: true,
    }
  );
  return user;
};
