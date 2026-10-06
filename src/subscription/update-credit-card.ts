import type { FormInstance } from 'antd';
import type { PaymentInfo } from '@/signup/payment-info.component';
import HttpClient from '@/util/http-client/fetch-client.util';

export async function updateSubscriptionCreditCard(subscriptionId: string, form: Pick<FormInstance<PaymentInfo>, 'validateFields'>) {
    // Read the current form at confirmation time, including when the modal
    // callback was created before the user entered their payment details.
    const payment = await form.validateFields();
    const expiry = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(payment.expiryDate ?? '');
    const number = (payment.number ?? '').replace(/[\s-]/g, '');
    const holderName = payment.holderName?.trim();
    if (!expiry || !/^\d{13,19}$/.test(number) || !/^\d{3,4}$/.test(payment.cvv ?? '') || !holderName) {
        throw new Error('Confira os dados do cartão e a validade no formato MM/AA.');
    }
    const expiryYear = `20${expiry[2]}`;
    const now = new Date();
    if (Number(expiryYear) < now.getFullYear()
        || (Number(expiryYear) === now.getFullYear() && Number(expiry[1]) < now.getMonth() + 1)) {
        throw new Error('A validade do cartão já expirou.');
    }
    await HttpClient.fetch('/subscription/update-credit-card', {
        method: 'PUT',
        body: JSON.stringify({
            subscriptionId,
            saveCard: payment.saveCard ?? false,
            creditCard: { holderName, number, expiryMonth: expiry[1], expiryYear, ccv: payment.cvv },
        }),
    }, false);
}
