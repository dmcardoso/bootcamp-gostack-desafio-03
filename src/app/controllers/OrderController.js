import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import File from '../models/File';

class OrderController {
    async index(request, response) {
        const { deliverymanId } = request.params;
        const { page = 1 } = request.query;

        const deliveries = await Delivery.findAll({
            where: {
                end_date: null,
                canceled_at: null,
                deliveryman_id: deliverymanId,
            },
            order: ['product'],
            limit: 20,
            offset: (page - 1) * 20,
            include: [
                {
                    model: Recipient,
                    as: 'recipients',
                    attributes: ['name'],
                },
                {
                    model: Deliveryman,
                    as: 'deliveryman',
                    attributes: ['name', 'email'],
                    include: [
                        {
                            model: File,
                            as: 'avatar',
                            attributes: ['path', 'url', 'name'],
                        },
                    ],
                },
            ],
        });

        return response.json(deliveries);
    }
}

export default new OrderController();
