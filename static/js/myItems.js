document.addEventListener("DOMContentLoaded", function () {
    const itemsList = document.getElementById("itemsList");

    // Retrieve selected items from localStorage
    const selectedItems = JSON.parse(localStorage.getItem("selectedItems")) || {};

    let totalPrice = 0;

    // Loop through selected items and display them
    for (const [tableName, items] of Object.entries(selectedItems)) {
        const filteredItems = items.filter(item => item.quantity > 0);

        if (filteredItems.length > 0) {
            const section = document.createElement("div");
            section.innerHTML = `<h3>${tableName}</h3>`;
            const list = document.createElement("ul");

            filteredItems.forEach(item => {
                const listItem = document.createElement("li");
                listItem.innerHTML = `<strong>${item.name}</strong> - Quantity: ${item.quantity} - Price: €${item.price * item.quantity}`;
                list.appendChild(listItem);

                // Calculate total price
                totalPrice += item.price * item.quantity;
            });

            section.appendChild(list);
            itemsList.appendChild(section);
        }
    }

    // Display total price
    const totalPriceElement = document.createElement("div");
    totalPriceElement.innerHTML = `<h3>Skupna cena: €${totalPrice.toFixed(2)}</h3>`;
    itemsList.appendChild(totalPriceElement);
});