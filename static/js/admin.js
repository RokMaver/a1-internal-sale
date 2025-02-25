document.getElementById("setDeadlineBtn").addEventListener("click", function() {
    let dateTimeInput = document.createElement("input");
    dateTimeInput.type = "datetime-local";
    dateTimeInput.style.position = "absolute";
    dateTimeInput.style.opacity = "0";
    document.body.appendChild(dateTimeInput);

    dateTimeInput.addEventListener("change", function() {
        const selectedDate = new Date(this.value);
        const formattedDate = `${selectedDate.getDate().toString().padStart(2, '0')}.${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}.${selectedDate.getFullYear()}`;
        const formattedTime = `${selectedDate.getHours().toString().padStart(2, '0')}:${selectedDate.getMinutes().toString().padStart(2, '0')}`;
        const formattedDateTime = `${formattedDate} ${formattedTime}`;

        document.getElementById("deadline").value = this.value;
        document.getElementById("submitBtn").style.display = "inline-block"; // Show submit button

        // Display the selected deadline
        let deadlineDisplay = document.getElementById("deadlineDisplay");
        if (!deadlineDisplay) {
            deadlineDisplay = document.createElement("div");
            deadlineDisplay.id = "deadlineDisplay";
            document.querySelector(".container").appendChild(deadlineDisplay);
        }
        deadlineDisplay.textContent = `Selected Deadline: ${formattedDateTime}`;
    });

    dateTimeInput.showPicker();
});
document.getElementById("csvfile").addEventListener("change", function() {
    const fileName = this.files[0].name;
    document.getElementById("fileNameDisplay").textContent = `Selected File: ${fileName}`;
});
document.getElementById("submitBtn").addEventListener("click", function(event) {
    let deadlineValue = document.getElementById("deadline").value;
    let fileInput = document.getElementById("csvfile").files.length;

    if (!deadlineValue || fileInput === 0) {
        event.preventDefault(); // Prevent form submission
        if (!deadlineValue) {
            showNotification("Please select a deadline before confirming.");
        }
        if (fileInput === 0) {
            showNotification("Please upload a CSV file before confirming.");
        }
    }
});

function showNotification(message) {
    const notificationContainer = document.getElementById('notification-container');

    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;

    notificationContainer.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3500); // Remove after 3.5 seconds
}