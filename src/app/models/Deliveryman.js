import Sequelize, { Model } from 'sequelize';

class Deliveryman extends Model {
    static init(sequelize) {
        super.init(
            {
                name: Sequelize.STRING,
                email: Sequelize.STRING,
                deleted_at: Sequelize.DATE,
            },
            {
                sequelize,
                tableName: 'deliveryman',
            }
        );

        return this;
    }

    static associate(models) {
        this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
    }
}

export default Deliveryman;
