export function payNow(amt:string) {
  const options = {
    key: 'rzp_test_xxxxxxxx',
    amount: 50000,
    currency: 'INR',
    name: 'Demo Store',
    description: 'Test Payment',

    handler: function (response: any) {
      alert('Payment Successful!');
      console.log(response);
    },

    prefill: {
      name: 'Test User',
      email: 'test@example.com',
      contact: '9999999999'
    },

    theme: {
      color: '#0f172a'
    }
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.open();
}
