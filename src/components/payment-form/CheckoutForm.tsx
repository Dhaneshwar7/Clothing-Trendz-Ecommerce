import React, { FormEvent } from 'react';
import {
	// PaymentElement,
	// Elements,
	useStripe,
	useElements,
	CardElement,
} from '@stripe/react-stripe-js';
import { useSelector } from 'react-redux';
import { RootState } from '../../utils/types/types';
import { StripeCardElement } from '@stripe/stripe-js';
const ifValidCardElement = (
	card: StripeCardElement | null
): card is StripeCardElement => card !== null;
const CheckoutForm: React.FC = () => {
	const stripe = useStripe();
	const elements = useElements();

	const { cartItemsTotal } = useSelector((state: RootState) => state.cart);
	// const { user } = useSelector((state: RootState) => state.user);
	// const [errorMessage, setErrorMessage] = useState<string | null>(null);
	// const [isProcessingPayment, setIsProcessingPayment] = useState(false);

	const paymentHandler = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!stripe || !elements) {
			return;
		}

		// setIsProcessingPayment(true);

		const response = await fetch('/.netlify/functions/create-payment-intent', {
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ amount: cartItemsTotal * 100 }),
		}).then(res => res.json());

		const {
			paymentIntent: { client_secret },
		} = response;

		const cardDetails = elements.getElement(CardElement);

		if (!ifValidCardElement(cardDetails)) return;

		const paymentResult = await stripe.confirmCardPayment(client_secret, {
			payment_method: {
				card: cardDetails,
				billing_details: {
					name: 'Guest',
				},
			},
		});

		// setIsProcessingPayment(false);

		if (paymentResult.error) {
			alert(paymentResult.error);
		} else {
			if (paymentResult.paymentIntent.status === 'succeeded') {
				alert('Payment Successful');
			}
		}
	};

	return (
		<form onSubmit={paymentHandler}>
			<CardElement />
			{/* <PaymentElement /> */}
			<button type="submit" >
				Pay
			</button>
			{/* Show error message to your customers */}
			{/* {errorMessage && <div>{errorMessage}</div>} */}
		</form>
	);
};

export default CheckoutForm;
