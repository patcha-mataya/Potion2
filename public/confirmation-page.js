document.addEventListener("DOMContentLoaded", function () {
    const paymentMethod = localStorage.getItem('paymentMethod');
    const paymentContainer = document.getElementById('payment-container');

    if (paymentMethod === 'credit-card') {
        const creditCardFormHTML = `
            <div class="credit-card-form">
                <h2>Enter Your Credit Card Details</h2>
                <form>
                    <div class="form-group">
                        <label for="card-number">Card Number</label>
                        <input type="text" id="card-number" placeholder="Enter card number">
                    </div>
                    <div class="form-group">
                        <label for="expiry-date">Expiry Date</label>
                        <input type="text" id="expiry-date" placeholder="MM/YY">
                    </div>
                    <div class="form-group">
                        <label for="cvv">CVV</label>
                        <input type="text" id="cvv" placeholder="Enter CVV">
                    </div>
                    <button type="submit" class="btn btn-submit">Submit</button>
                </form>
            </div>
        `;
        paymentContainer.innerHTML = creditCardFormHTML;

    } else if (paymentMethod === 'promptpay') {
        const promptpayImageHTML = `
            <h2>Pay with promptpay</h2>
            <img src="https://cdn.discordapp.com/attachments/1149257443025629235/1321135079623491687/image.png?ex=676c226c&is=676ad0ec&hm=da4fa96b52b7494c53f4439226cd9bf74cd1eba131c9c2de6c137917f9b1359b&" alt="PayPal">
        `;
        paymentContainer.innerHTML = promptpayImageHTML;

    } else if (paymentMethod === 'bank-transfer') {
        const bankTransferImageHTML = `
            <h2>Bank Transfer</h2>
            <img src="https://cdn.discordapp.com/attachments/1149257443025629235/1321135011751133295/image.png?ex=676c225c&is=676ad0dc&hm=d22da90bf5955e306a9db197bc5120d70b6ba48e2ebaa07bf3a447dab2eac1f4&" alt="Bank Transfer">
        `;
        paymentContainer.innerHTML = bankTransferImageHTML;
    } else {
        paymentContainer.innerHTML = "<p>Please select a payment method.</p>";
    }
});
