# Razprodaja

This project is a web application for managing and displaying items in a table format. Users can select items, adjust quantities, and view the total price of selected items.

## Features

- Display items in a table format.
- Select items using checkboxes.
- Adjust item quantities using increment and decrement buttons.
- Limit the number of selected items per table based on a predefined limit.
- Display the total price of selected items.

## Technologies Used

- HTML
- CSS
- JavaScript
- Go

## Setup

1. Clone the repository:
    ```sh
    git clone https://github.com/RokMaver/razprodaja.git
    cd razprodaja
    ```

2. Install dependencies:
    ```sh
    go mod tidy
    ```

3. Run the application:
    ```sh
    go run main.go
    ```

4. Open your browser and navigate to `http://localhost:8080`.

## File Structure

- `internal/html/items.html`: Contains the HTML structure for displaying items.
- `static/css/items.css`: Contains the CSS styles for the application.
- `static/js/items.js`: Contains the JavaScript logic for handling item selection and quantity adjustments.

## Usage

1. Open the application in your browser.
2. Browse through the items displayed in the tables.
3. Select items by checking the checkboxes.
4. Adjust the quantity of selected items using the increment and decrement buttons.
5. View the selected items and total price in the right panel.

## Constraints

- Users can only check a limited number of items per table if the table limit is a positive number.
- If the table limit is 1, users are limited to a quantity of 1.
- If the table limit is 2, users are limited to a quantity of 2.
- If the table limit is -1, users can check as many items as possible and take as many as there is quantity.
