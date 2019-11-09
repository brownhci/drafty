const formsToValidate = document.getElementsByClassName("custom-validation");
for (const form of Array.from(formsToValidate)) {
  const formsToValidate = form as HTMLFormElement;
  form.addEventListener("submit", function(event) {
    if (formsToValidate.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }
      form.classList.add("was-validated");
  });
}