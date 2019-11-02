const $flashMessages = document.getElementById("flash-messages");
$flashMessages.addEventListener("click", function(event) {
    const target = event.target as HTMLElement;
    if (target.classList.contains("flash-dismiss")) {
        const flashMessage = target.closest("div[role=alert]");
        flashMessage.remove();
    }
});
