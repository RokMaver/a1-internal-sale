document.addEventListener('DOMContentLoaded', function () {
    const selectedItemsContainer = document.getElementById('selected-items-container');
    const totalPriceElement = document.getElementById('total-price');
    let selectedItems = JSON.parse(localStorage.getItem('selectedItems')) || {}; // Load stored selection

    document.querySelectorAll('.left table').forEach(table => {
        let checkedCount = 0;
        let tableLimit = -1;
        const tableName = table.previousElementSibling.textContent.trim();

        if (!selectedItems[tableName]) {
            selectedItems[tableName] = [];
        }

        // Count previously checked items
        checkedCount = selectedItems[tableName].filter(item => item.quantity > 0).length;

        table.querySelectorAll('tr').forEach(row => {
            const checkbox = row.querySelector('.item-checkbox');
            const incrementButton = row.querySelector('.increment-btn');
            const decrementButton = row.querySelector('.decrement-btn');
            const quantityControls = row.querySelector('.quantity-controls');

            if (checkbox && incrementButton && decrementButton && quantityControls) {
                const itemName = checkbox.getAttribute('data-name');
                const itemPrice = parseFloat(checkbox.getAttribute('data-price'));
                const itemLimit = parseInt(checkbox.getAttribute('data-limit'), 10);
                const stockQuantity = parseInt(checkbox.getAttribute('data-quantity'), 10);

                if (tableLimit === -1) {
                    tableLimit = itemLimit === -1 ? -1 : 2; // If -1, unlimited; otherwise, max 2 selections
                }

                const maxQuantity = itemLimit === -1 ? stockQuantity : Math.min(itemLimit, stockQuantity);

                if (!selectedItems[tableName].some(item => item.name === itemName)) {
                    selectedItems[tableName].push({
                        name: itemName,
                        quantity: 0,
                        price: itemPrice,
                        max: maxQuantity,
                        order: null
                    });
                }

                // Restore previous selection
                const storedItem = selectedItems[tableName].find(item => item.name === itemName);
                if (storedItem && storedItem.quantity > 0) {
                    checkbox.checked = true;
                    quantityControls.classList.add('show-controls');
                    incrementButton.disabled = false;
                    decrementButton.disabled = false;
                }

                checkbox.addEventListener('change', function () {
                    if (checkbox.checked) {
                        if (checkedCount >= tableLimit && tableLimit !== -1) {
                            alert(`You can only select ${tableLimit} items from this table.`);
                            checkbox.checked = false;
                            return;
                        }
                        checkedCount++;
                        assignOrderToSelectedItem(tableName, itemName);
                        updateSelectedItem(tableName, itemName, 1);
                        quantityControls.classList.add('show-controls');
                        incrementButton.disabled = false;
                        decrementButton.disabled = false;
                    } else {
                        checkedCount--;
                        removeOrderFromItem(tableName, itemName);
                        updateSelectedItem(tableName, itemName, 0);
                        quantityControls.classList.remove('show-controls');
                        incrementButton.disabled = true;
                        decrementButton.disabled = true;
                    }
                    updateSelectedItemsContainer();
                    saveToLocalStorage();
                });

                incrementButton.addEventListener('click', function () {
                    const currentItem = findSelectedItem(tableName, itemName);
                    if (currentItem && currentItem.quantity < maxQuantity) {
                        currentItem.quantity++;
                        checkbox.checked = true;
                        quantityControls.classList.add('show-controls');
                        updateSelectedItemsContainer();
                        saveToLocalStorage();
                    }
                });

                decrementButton.addEventListener('click', function () {
                    const currentItem = findSelectedItem(tableName, itemName);
                    if (currentItem && currentItem.quantity > 0) {
                        currentItem.quantity--;
                    }
                    if (currentItem.quantity === 0) {
                        checkbox.checked = false;
                        checkedCount--;
                        removeOrderFromItem(tableName, itemName);
                        quantityControls.classList.remove('show-controls');
                        incrementButton.disabled = true;
                        decrementButton.disabled = true;
                    }
                    updateSelectedItemsContainer();
                    saveToLocalStorage();
                });
            }
        });
    });

    function saveToLocalStorage() {
        // Check if there are any selected items with quantity > 0
        let hasSelectedItems = Object.values(selectedItems).some(tableItems =>
            tableItems.some(item => item.quantity > 0)
        );

        if (hasSelectedItems) {
            localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
        } else {
            localStorage.removeItem('selectedItems'); // Remove key if no items are selected
        }
    }


    function assignOrderToSelectedItem(tableName, itemName) {
        const item = findSelectedItem(tableName, itemName);
        if (item && item.order === null) {
            item.order = getNextAvailableOrder(tableName);
        }
    }

    function removeOrderFromItem(tableName, itemName) {
        const item = findSelectedItem(tableName, itemName);
        if (item) {
            item.order = null;
        }
        reorderItemsInTable(tableName);
    }

    function getNextAvailableOrder(tableName) {
        const tableItems = selectedItems[tableName].filter(item => item.order !== null);
        return tableItems.length > 0 ? Math.max(...tableItems.map(item => item.order)) + 1 : 1;
    }

    function reorderItemsInTable(tableName) {
        let orderNumber = 1;
        selectedItems[tableName]
            .filter(item => item.quantity > 0)
            .sort((a, b) => (a.order || Infinity) - (b.order || Infinity))
            .forEach(item => {
                item.order = orderNumber++;
            });
    }

    function updateSelectedItem(tableName, itemName, quantity) {
        const item = findSelectedItem(tableName, itemName);
        if (item) {
            item.quantity = quantity;
            saveToLocalStorage();
        }
    }

    function findSelectedItem(tableName, itemName) {
        if (selectedItems[tableName]) {
            return selectedItems[tableName].find(item => item.name === itemName);
        }
        return null;
    }

    function updateSelectedItemsContainer() {
        selectedItemsContainer.innerHTML = '';
        let totalPrice = 0;

        for (const [tableName, items] of Object.entries(selectedItems)) {
            const filteredItems = items.filter(item => item.quantity > 0);

            if (filteredItems.length > 0) {
                const tableSection = document.createElement('div');
                tableSection.innerHTML = `<h3>${tableName}</h3>`;
                const itemList = document.createElement('ol');

                filteredItems.sort((a, b) => a.order - b.order);

                filteredItems.forEach(item => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `<strong>${item.name}</strong> - Količina: ${item.quantity} - Cena: ${(item.quantity * item.price).toFixed(2)} €`;
                    itemList.appendChild(listItem);
                    totalPrice += item.quantity * item.price;
                });

                tableSection.appendChild(itemList);
                selectedItemsContainer.appendChild(tableSection);
            }
        }

        totalPriceElement.textContent = `Skupna cena: ${totalPrice.toFixed(2)} €`;
    }

    updateSelectedItemsContainer();
});
