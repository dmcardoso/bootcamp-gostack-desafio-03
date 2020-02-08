import * as Yup from 'yup';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
    async index(request, response) {
        const { page = 1 } = request.query;
        const deliverymans = await Deliveryman.findAll({
            where: { deleted_at: null },
            order: ['name'],
            limit: 20,
            offset: (page - 1) * 20,
            include: [
                {
                    model: File,
                    as: 'avatar',
                    attributes: ['path', 'url', 'name'],
                },
            ],
        });

        return response.json(deliverymans);
    }

    async store(request, response) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string().required(),
            avatar_id: Yup.number(),
        });

        if (!(await schema.isValid(request.body))) {
            return response.status(400).json({ error: 'Validation fails' });
        }

        const deliverymanExists = await Deliveryman.findOne({
            where: { email: request.body.email },
        });

        if (deliverymanExists) {
            return response
                .status(400)
                .json({ error: 'Deliveryman already exists' });
        }

        const deliveryman = await Deliveryman.create(request.body);

        return response.json(deliveryman);
    }

    async update(request, response) {
        const schema = Yup.object().shape({
            name: Yup.string(),
            email: Yup.string(),
            avatar_id: Yup.number(),
        });

        if (!(await schema.isValid(request.body))) {
            return response.status(400).json({ error: 'Validation fails' });
        }

        const { email } = request.body;

        const deliveryman = await Deliveryman.findByPk(request.params.id);

        if (email && email !== deliveryman.email) {
            const deliverymanExists = await Deliveryman.findOne({
                where: { email: request.body.email },
            });

            if (deliverymanExists) {
                return response
                    .status(400)
                    .json({ error: 'Deliveryman already exists' });
            }
        }

        const { id, name, avatar_id } = await deliveryman.update(request.body);

        return response.json({ id, name, email, avatar_id });
    }

    async delete(request, response) {
        const deliveryman = await Deliveryman.findByPk(request.params.id, {
            include: [
                {
                    model: File,
                    as: 'avatar',
                    attributes: ['path', 'url', 'name'],
                },
            ],
        });

        deliveryman.deleted_at = new Date();
        await deliveryman.save();

        return response.json(deliveryman);
    }
}

export default new DeliverymanController();
