import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
    async store(request, response) {
        const schema = Yup.object().shape({
            nome: Yup.string().required(),
            rua: Yup.string().required(),
            numero: Yup.string().required(),
            complemento: Yup.string(),
            estado: Yup.string().required(),
            cidade: Yup.string().required(),
            cep: Yup.string().required(),
        });

        if (!(await schema.isValid(request.body))) {
            return response.status(400).json({ error: 'Validation fails' });
        }

        const recipientExists = await Recipient.findOne({
            where: { nome: request.body.nome },
        });

        if (recipientExists) {
            return response
                .status(400)
                .json({ error: 'Recipient already exists' });
        }
        const recipient = await Recipient.create(request.body);

        return response.json(recipient);
    }

    async update(request, response) {
        const schema = Yup.object().shape({
            nome: Yup.string(),
            rua: Yup.string(),
            numero: Yup.string(),
            complemento: Yup.string(),
            estado: Yup.string(),
            cidade: Yup.string(),
            cep: Yup.string(),
        });

        if (!(await schema.isValid(request.body))) {
            return response.status(400).json({ error: 'Validation fails' });
        }

        const { id } = request.params;
        const { nome } = request.body;

        const recipient = await Recipient.findByPk(id);

        if (nome && nome !== recipient.nome) {
            const recipientExists = await Recipient.findOne({
                where: { nome: request.body.nome },
            });

            if (recipientExists) {
                return response
                    .status(400)
                    .json({ error: 'Recipient already exists' });
            }
        }

        const recipient_updated = await recipient.update(request.body);

        return response.json(recipient_updated);
    }
}

export default new RecipientController();
