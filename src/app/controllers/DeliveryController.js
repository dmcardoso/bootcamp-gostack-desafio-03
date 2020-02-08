import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';
import Queue from '../../lib/Queue';
import DeliveryMail from '../jobs/DeliveryMail';

class DeliverymanController {
    async index(request, response) {
        const { page = 1 } = request.query;
        const deliveries = await Delivery.findAll({
            where: { canceled_at: null },
            order: ['product'],
            limit: 20,
            offset: (page - 1) * 20,
            include: [
                {
                    model: File,
                    as: 'signature',
                    attributes: ['path', 'url', 'name'],
                },
                {
                    model: Recipient,
                    as: 'recipients',
                    attributes: [
                        'name',
                        'street',
                        'number',
                        'complement',
                        'city',
                        'state',
                        'cep',
                    ],
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

    async store(request, response) {
        const schema = Yup.object().shape({
            product: Yup.string().required(),
            recipient_id: Yup.number().required(),
            deliveryman_id: Yup.number().required(),
        });

        if (!(await schema.isValid(request.body))) {
            return response.status(400).json({ error: 'Validation fails' });
        }

        const { recipient_id, deliveryman_id, product } = request.body;
        const recipient = await Recipient.findByPk(recipient_id);
        const deliveryman = await Deliveryman.findOne({
            where: { id: deliveryman_id, deleted_at: null },
        });

        if (!recipient) {
            return response.status(400).json({ error: 'Invalid recipient' });
        }

        if (!deliveryman) {
            return response.status(400).json({ error: 'Invalid deliveryman' });
        }

        const delivery = await Delivery.create(request.body);

        await Queue.add(DeliveryMail.key, {
            recipient: recipient.get(),
            product,
            deliveryman,
        });

        return response.json(delivery);
    }

    async update(request, response) {
        const schema = Yup.object().shape({
            product: Yup.string(),
            recipient_id: Yup.number(),
            deliveryman_id: Yup.number(),
        });

        if (!(await schema.isValid(request.body))) {
            return response.status(400).json({ error: 'Validation fails' });
        }

        const { id } = request.params;
        const delivery = await Delivery.findByPk(id, {
            include: [
                {
                    model: Recipient,
                    as: 'recipients',
                    attributes: [
                        'name',
                        'street',
                        'number',
                        'complement',
                        'city',
                        'state',
                        'cep',
                    ],
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

        if (!delivery) {
            return response.status(401).json({ error: 'Invalid delivery' });
        }

        const { recipient_id, deliveryman_id } = request.body;

        if (recipient_id && delivery.recipient_id !== recipient_id) {
            const recipient = await Recipient.findByPk(recipient_id);
            if (!recipient) {
                return response
                    .status(401)
                    .json({ error: 'Invalid recipient' });
            }
        }

        if (deliveryman_id && delivery.deliveryman_id !== deliveryman_id) {
            const deliveryman = await Deliveryman.findOne({
                where: { id: deliveryman_id, deleted_at: null },
            });
            if (!deliveryman) {
                return response
                    .status(401)
                    .json({ error: 'Invalid deliveryman' });
            }
        }

        await (await delivery.update(request.body)).reload();

        return response.json(delivery);
    }

    async delete(request, response) {
        const delivery = await Delivery.findByPk(request.params.id, {
            include: [
                {
                    model: Recipient,
                    as: 'recipients',
                    attributes: [
                        'name',
                        'street',
                        'number',
                        'complement',
                        'city',
                        'state',
                        'cep',
                    ],
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

        delivery.canceled_at = new Date();
        await delivery.save();

        return response.json(delivery);
    }
}

export default new DeliverymanController();
