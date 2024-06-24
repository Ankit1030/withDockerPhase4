exports.makePayment = async (req, res) => {
    try {
        await Settings.findOne().then(async (data) => {
            stripe = require('stripe')(data.skey);
            // console.log(data.skey)
        }
        ).catch((err) => console.error);
        const userid = req.params.userid;
        const estimateFare = Math.round(parseFloat(req.params.estimateFare) * 85);
        const data = await Users.findOne({ _id: userid });
        const cards = data.cards;
        const defaultCard = data.cards.find(card => card.default === true);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: estimateFare,
            currency: 'usd',
            customer: defaultCard.stripeCustomerId,
            payment_method: defaultCard.cardId,
            confirm: true,
            setup_future_usage: 'off_session',
            description: 'Payment for ride',
            return_url: 'http://localhost:4200/rides/confirmed-rides',
        });

        const transfer = await stripe.transfers.create({
            amount: 10000,
            currency: "usd",
            destination: "acct_1P1j2YDFLhxVAwHq",
            description: "Received Payment"
        });
        if (paymentIntent.status === 'requires_action') {
            return res.json(paymentIntent.next_action.redirect_to_url.url);
        }

        if (paymentIntent.status === 'succeeded') {
            return res.status(200).json({ message: 'Payment succeeded' });
        }


    } catch (error) {
        console.error('Error making payment:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}