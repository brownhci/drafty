const tableCellInputFormCSRFInput: HTMLInputElement = document.querySelector('input[name=\'_csrf\']');
const deleteUserDataForm = document.getElementById('delete-data-form');
const thankYouMessage = document.getElementById('delete-data-thankyou');
function deleteUserDataPOST() {
  const data: Record<any, any> = {'_csrf': tableCellInputFormCSRFInput.value};
  const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
  };
  fetch('/account/delete', options)
      .then(async response => {
          const isJson = response.headers.get('content-type')?.includes('application/json');
          const data = isJson && await response.json();
          if (!response.ok) {
              const error = (data && data.message) || response.status;
              return Promise.reject(error);
          }
          thankYouMessage.style.display = 'block';
          thankYouMessage.innerHTML = 'We have received your request and will process it soon. Thank you!';
      }).catch(error => {
          thankYouMessage.style.display = 'block';
          thankYouMessage.innerHTML = 'Oh no we are sorry there appears to be error logging your request. :( The developers of Drafty have been notified.';
          console.error('There was an error!', error);
      });
}
deleteUserDataForm.addEventListener('click', (e) => {
  e.preventDefault();
  deleteUserDataPOST();
});