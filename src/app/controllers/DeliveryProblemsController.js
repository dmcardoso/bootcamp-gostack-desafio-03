import * as Yup from 'yup';
import DeliveryProblem from '../models/DeliveryProblem';
import Delivery from '../models/Delivery';

class DeliveryProblemsController {
    async index(request, response) {
        const { page = 1 } = request.query;
        const { deliveryId } = request.params;
        const deliveries = await DeliveryProblem.findAll({
            where: { delivery_id: deliveryId },
            limit: 20,
            offset: (page - 1) * 20,
            include: [
                {
                    model: Delivery,
                    as: 'delivery',
                },
            ],
        });

        return response.json(deliveries);
    }

    async store(request, response) {
        const { description } = request.body;
        const { deliveryId } = request.params;

        const schema = Yup.object().shape({
            description: Yup.string().required(),
            deliveryId: Yup.number().required(),
        });

        if (!(await schema.isValid({ description, deliveryId }))) {
            return response.status(400).json({ error: 'Validation fails' });
        }

        const deliveryProblem = await DeliveryProblem.create({
            description,
            delivery_id: deliveryId,
        });

        return response.json(deliveryProblem);
    }
}

export default new DeliveryProblemsController();
