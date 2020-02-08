import { Op } from 'sequelize';
import Delivery from '../models/Delivery';
import DeliveryProblem from '../models/DeliveryProblem';

class DeliveryWithProblems {
    async index(request, response) {
        const { page = 1 } = request.query;
        const deliveries = await Delivery.findAll({
            limit: 20,
            offset: (page - 1) * 20,
            include: [
                {
                    model: DeliveryProblem,
                    as: 'delivery_problems',
                    required: true,
                },
            ],
        });

        return response.json(deliveries);
    }
}

export default new DeliveryWithProblems();
