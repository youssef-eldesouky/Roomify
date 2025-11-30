// Set min date to today
const today = new Date().toISOString().split('T')[0];
document.getElementById('checkin').min = today;
document.getElementById('checkout').min = today;

// Update checkout date
document.getElementById('checkin').addEventListener('change', function () {
    const checkinDate = new Date(this.value);
    checkinDate.setDate(checkinDate.getDate() + 1);
    const minCheckout = checkinDate.toISOString().split('T')[0];

    const checkout = document.getElementById('checkout');
    checkout.min = minCheckout;

    if (checkout.value < minCheckout) {
        checkout.value = minCheckout;
    }
});

// Search form alert
document.getElementById('searchForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const destination = document.getElementById('destination').value;
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const guests = document.getElementById('guests').value;

    alert(`Searching for:\nDestination: ${destination}\nCheck-in: ${checkin}\nCheck-out: ${checkout}\nGuests: ${guests}`);
});