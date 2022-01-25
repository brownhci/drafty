function removeAssociatedInvalidTooltip(element: HTMLInputElement) {
  const nextElement = element.nextElementSibling;
  //console.log(nextElement);
  if (nextElement && nextElement.classList.contains('invalid-tooltip')) {
    nextElement.remove();
  }
}

const formsToValidate = document.getElementsByClassName('custom-validation');
for (const form of Array.from(formsToValidate)) {
  const formToValidate = form as HTMLFormElement;
  form.addEventListener('submit', function(event) {
    if (!formToValidate.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
      form.classList.add('was-validated');
  });

  const formInputs = form.querySelectorAll('input.form-control');
  formInputs.forEach(function(formInput) {
    const formInputToValidate = formInput as HTMLInputElement;
    formInput.addEventListener('change', function() {
      const validClass = 'is-valid';
      const invalidClass = 'is-invalid';
      if (formInputToValidate.checkValidity()) {
        formInput.classList.add(validClass);
        formInput.classList.remove(invalidClass);
        removeAssociatedInvalidTooltip(formInputToValidate);
      } else {
        formInput.classList.add(invalidClass);
        formInput.classList.remove(validClass);
      }
    });
  });
}
