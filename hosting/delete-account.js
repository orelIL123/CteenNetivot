const form = document.getElementById('delete-form');
const statusEl = document.getElementById('form-status');

function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = `form-status ${type}`;
}

async function submitDeletionRequest(event) {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = {
    fullName: String(formData.get('fullName') || '').trim(),
    phone: String(formData.get('phone') || '').trim(),
    email: String(formData.get('email') || '').trim(),
    uid: String(formData.get('uid') || '').trim(),
    reason: String(formData.get('reason') || '').trim(),
  };

  if (!payload.fullName || !payload.phone) {
    setStatus('יש למלא לפחות שם מלא ומספר טלפון.', 'error');
    return;
  }

  setStatus('שולח את הבקשה...', 'loading');

  try {
    const response = await fetch('/api/account-deletion-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.error || 'שליחת הבקשה נכשלה.');
    }

    form.reset();
    setStatus('הבקשה נשלחה בהצלחה. נחזור אליכם לאחר בדיקה.', 'success');
  } catch (error) {
    setStatus(
      error instanceof Error ? error.message : 'אירעה שגיאה בשליחת הבקשה. נסו שוב מאוחר יותר.',
      'error'
    );
  }
}

form.addEventListener('submit', submitDeletionRequest);
