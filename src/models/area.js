'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class area extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  area.init({
    uuid: DataTypes.STRING,
    name: DataTypes.STRING,
    sequence: DataTypes.DECIMAL,
    code: DataTypes.DECIMAL,
    is_active: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'area',
    underscored: true,
  });
  return area;
};