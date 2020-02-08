import Mail from '../../lib/Mail';

class DeliveryMail {
    get key() {
        return 'DeliveryMail';
    }

    async handle({ data }) {
        const { recipient, deliveryman, product } = data;

        await Mail.sendMail({
            to: `${deliveryman.name} <${deliveryman.email}>`,
            subject: 'New delivery',
            template: 'new_delivery',
            context: {
                deliveryman: deliveryman.name,
                product,
                ...recipient,
            },
        });
    }
}

export default new DeliveryMail();
