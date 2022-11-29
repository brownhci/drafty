const CSRFInput: HTMLInputElement | null = document.querySelector('input[name=\'_csrf\']');
const surveyBanner: HTMLElement | null = document.getElementById('dce-survey-banner');
const surveyBtn: HTMLElement | null = document.getElementById('survey-link');
const closeBtn: HTMLElement | null = document.getElementById('close-dce-survey-banner');

function closeSurvey() {
  if (surveyBanner != undefined) {
    surveyBanner.style.display = 'none';
  }
}

closeBtn?.addEventListener('click', function() {
  closeSurvey();
});

const data: Record<any, any> = {'_csrf': CSRFInput?.value};
  const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
  };

  // 
  fetch('/experiment/survey/link', options)
    .then(async response => {
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson && await response.json();
        if (!response.ok) {
            const error = (data && data.message) || response.status;
            return Promise.reject(error);
        }
        if(data.active) {
          surveyBtn?.setAttribute('href', data.link);
        } else {
          closeSurvey();
        }
    }).catch(error => {
        console.error('There was an error!', error);
    });