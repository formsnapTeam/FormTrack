// FormSnap Bookmarklet Generator
// This file helps generate bookmarklet code for users

/**
 * Generate a bookmarklet URL for the given API base and auth token
 * @param {string} apiBase - The API base URL (e.g., http://localhost:5000/api)
 * @param {string} token - JWT auth token
 * @returns {string} - Bookmarklet URL
 */
export const generateBookmarklet = (apiBase, token) => {
  const code = `
    (function() {
      var title = document.title;
      var url = window.location.href;
      
      // Show loading indicator
      var overlay = document.createElement('div');
      overlay.id = 'formsnap-overlay';
      overlay.innerHTML = '<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999999;"><div style="background:white;padding:24px 32px;border-radius:12px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,0.2);"><div style="font-size:24px;margin-bottom:8px;">📸</div><div style="font-weight:600;color:#1f2937;">Saving to FormSnap...</div></div></div>';
      document.body.appendChild(overlay);
      
      fetch('${apiBase}/applications/bookmarklet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${token}'
        },
        body: JSON.stringify({ formTitle: title, formUrl: url })
      })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        overlay.remove();
        if (d.success) {
          var successDiv = document.createElement('div');
          successDiv.innerHTML = '<div style="position:fixed;top:20px;right:20px;background:linear-gradient(135deg,#22c55e,#16a34a);color:white;padding:16px 24px;border-radius:12px;z-index:999999;box-shadow:0 4px 20px rgba(34,197,94,0.4);animation:slideIn 0.3s ease;"><strong>✅ Saved!</strong><br><span style="font-size:14px;opacity:0.9;">' + title.substring(0, 40) + (title.length > 40 ? '...' : '') + '</span></div>';
          document.body.appendChild(successDiv);
          setTimeout(function() { successDiv.remove(); }, 3000);
        } else {
          alert('❌ Error: ' + (d.message || 'Failed to save'));
        }
      })
      .catch(function(e) {
        overlay.remove();
        alert('❌ Failed to save. Make sure you are logged in to FormSnap.');
      });
    })();
  `.replace(/\s+/g, ' ').trim();

  return 'javascript:' + encodeURIComponent(code);
};

/**
 * Simple bookmarklet for production use
 * User needs to replace API_URL and TOKEN
 */
export const BOOKMARKLET_TEMPLATE = `javascript:(function(){var t=document.title,u=window.location.href;fetch('API_URL/applications/bookmarklet',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer TOKEN'},body:JSON.stringify({formTitle:t,formUrl:u})}).then(r=>r.json()).then(d=>{alert(d.success?'✅ Saved: '+t:'❌ '+d.message)}).catch(e=>alert('❌ Failed'))})();`;
