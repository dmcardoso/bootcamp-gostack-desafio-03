import Mail from '../../lib/Mail';

class CancelDeliveryMail {
    get key() {
        return 'CancelDeliveryMail';
    }

    async handle({ data }) {
        const { deliveryman, name, product } = data;

        await Mail.sendMail({
            to: `${deliveryman.name} <${deliveryman.email}>`,
            subject: 'Delivery canceled',
            template: 'canceldeliverymail',
            context: {
                deliveryman: deliveryman.name,
                name,
                product,
            },
        });
    }
}

export default new CancelDeliveryMail();
