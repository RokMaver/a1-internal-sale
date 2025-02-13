document.addEventListener('DOMContentLoaded', function() {
    const tables = document.querySelectorAll('.left table');
    const selectedItemsContainer = document.getElementById('selected-items-container');
    const totalPriceElement = document.getElementById('total-price');
    let selectedItems = [];

    tables.forEach(table => {
        const checkboxes = table.querySelectorAll('.item-checkbox');
        const quantities = table.querySelectorAll('.item-quantity');
        const limit = parseInt(table.querySelector('.item-checkbox').getAttribute('data-limit'), 10);

        checkboxes.forEach((checkbox, index) => {
            checkbox.addEventListener('change', function() {
                const availableQuantity = parseInt(checkbox.getAttribute('data-quantity'), 10);
                if (checkbox.checked) {
                    quantities[index].disabled = false;
                    quantities[index].value = 1;
                    quantities[index].min = 1;
                    quantities[index].max = limit === -1 ? availableQuantity : limit;
                    selectedItems.push({ checkbox, quantity: quantities[index], tableTitle: table.previousElementSibling.textContent });
                } else {
                    quantities[index].disabled = true;
                    quantities[index].value = 0;
                    selectedItems = selectedItems.filter(item => item.checkbox !== checkbox);
                }
                updateSelectedItemsContainer();
                enforceCheckboxLimit(checkboxes, limit);
            });
        });

        quantities.forEach(quantity => {
            quantity.addEventListener('input', updateSelectedItemsContainer);
        });

        function enforceCheckboxLimit(checkboxes, limit) {
            const checkedCount = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
            checkboxes.forEach(checkbox => {
                if (!checkbox.checked) {
                    checkbox.disabled = limit !== -1 && checkedCount >= 2;
                }
            });
        }

        function updateSelectedItemsContainer() {
            selectedItemsContainer.innerHTML = '';
            let totalPrice = 0;
            const groupedItems = selectedItems.reduce((acc, item) => {
                if (!acc[item.tableTitle]) {
                    acc[item.tableTitle] = [];
                }
                acc[item.tableTitle].push(item);
                return acc;
            }, {});

            for (const [tableTitle, items] of Object.entries(groupedItems)) {
                const titleElement = document.createElement('h3');
                titleElement.textContent = tableTitle;
                selectedItemsContainer.appendChild(titleElement);

                let globalIndex = 1; // Reset globalIndex for each table group
                items.forEach(item => {
                    const name = item.checkbox.getAttribute('data-name');
                    const quantity = item.quantity.value;
                    const price = item.checkbox.getAttribute('data-price');
                    const listItem = document.createElement('li');
                    listItem.textContent = `${globalIndex}. ${name} - Količina: ${quantity} - Cena: ${price}`;
                    selectedItemsContainer.appendChild(listItem);
                    totalPrice += parseFloat(price) * quantity;
                    globalIndex++;
                });
            }
            totalPriceElement.textContent = `Skupna cena: ${totalPrice.toFixed(2)} €`;
        }
    });
});