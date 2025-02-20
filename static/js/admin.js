document.getElementById("setDeadlineBtn").addEventListener("click", function() {
    let dateTimeInput = document.createElement("input");
    dateTimeInput.type = "datetime-local";
    dateTimeInput.style.position = "absolute";
    dateTimeInput.style.opacity = "0";
    document.body.appendChild(dateTimeInput);

    dateTimeInput.addEventListener("change", function() {
        document.getElementById("deadline").value = this.value;
        document.getElementById("submitBtn").style.display = "inline-block"; // Show submit button
    });

    dateTimeInput.showPicker();
});