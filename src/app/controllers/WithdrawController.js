import { setSeconds, setMinutes, setHours, isAfter, isBefore } from 'date-fns';
import * as Yup from 'yup';
import Delivery from '../models/Delivery';

class WithdrawController {
    async store(request, response) {
        const MAX_DELIVERIES_DELIVERYMAN = 5;

        const { deliveryId, deliverymanId } = request.params;

        if (!deliveryId && !deliverymanId) {
            return response
                .status(401)
                .json({ error: 'Invalid delivery and deliveryman' });
        }

        const validWithDrawHours = ['08:00', '18:00'].map(time => {
            const [hour, minute] = time.split(':');
            const value = setSeconds(
                setMinutes(setHours(new Date(), hour), minute),
                0
            );

            return value;
        });

        if (
            isAfter(validWithDrawHours[0], new Date()) ||
            isBefore(validWithDrawHours[1], new Date())
        ) {
            return response
                .status(401)
                .json({ error: "You can't withdraw a delivery now" });
        }

        const deliveryman_deliveries = await Delivery.count({
            where: { deliveryman_id: deliverymanId, canceled_at: null },
        });

        if (deliveryman_deliveries >= MAX_DELIVERIES_DELIVERYMAN) {
            return response
                .status(401)
                .json({ error: "You can't withdraw a delivery today anymore" });
        }

        const delivery = await Delivery.findOne({
            where: {
                id: deliveryId,
                canceled_at: null,
                deliveryman_id: deliverymanId,
            },
        });

        if (!delivery) {
            return response.status(400).json({ error: 'Invalid delivery' });
        }

        await delivery.update({ start_date: new Date() });

        return response.json(delivery);
    }

    async update(request, response) {
        const { deliveryId, deliverymanId } = request.params;
        const { signature_id } = request.body;

        const schema = Yup.object().shape({
            deliveryId: Yup.number().required(),
            deliverymanId: Yup.number().required(),
            signature_id: Yup.number().required(),
        });

        if (
            !(await schema.isValid({ deliverymanId, deliveryId, signature_id }))
        ) {
            return response.status(400).json({ error: 'Validation fails' });
        }

        const delivery = await Delivery.findOne({
            where: {
                id: deliveryId,
                deliveryman_id: deliverymanId,
                canceled_at: null,
            },
        });

        if (!delivery) {
            return response.status(400).json({ error: 'Invalid delivery' });
        }
        if (delivery && delivery.start_date === null) {
            return response
                .status(400)
                .json({ error: 'Delivery has not been withdrawn' });
        }
        if (delivery && delivery.end_date !== null) {
            return response
                .status(400)
                .json({ error: 'Delivery has already been completed' });
        }

        await delivery.update({ end_date: new Date() });

        return response.json(delivery);
    }
}

export default new WithdrawController();
