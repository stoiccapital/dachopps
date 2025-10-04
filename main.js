/* Simple modal handling */
function openModal(id){ document.getElementById(id).showModal(); }
function closeModal(el){ el.closest('dialog').close(); }
document.querySelectorAll('[data-open-modal]').forEach(el=>{
  el.addEventListener('click', (e)=>{ e.preventDefault(); openModal(el.getAttribute('data-open-modal')); });
});
document.querySelectorAll('[data-close]').forEach(el=>{
  el.addEventListener('click', ()=> closeModal(el));
});

/* Mobile menu toggle */
function toggleMobileMenu() {
  const navLinks = document.querySelector('.nav-links');
  const toggle = document.querySelector('.mobile-menu-toggle');
  
  if (navLinks && toggle) {
    navLinks.classList.toggle('mobile-open');
    toggle.textContent = navLinks.classList.contains('mobile-open') ? '✕' : '☰';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', toggleMobileMenu);
  }
});

/* Lead form: store to local CSV for download */
function serializeCSVRow(obj){
  const esc = (v)=> `"${String(v??'').replace(/"/g,'""')}"`;
  return Object.keys(obj).map(k=>esc(obj[k])).join(',') + '\n';
}
function appendToLocalCSV(filename, headers, rowObj){
  const key = 'csv:'+filename;
  let csv = localStorage.getItem(key);
  if(!csv){ csv = headers.join(',') + '\n'; }
  csv += serializeCSVRow(rowObj);
  localStorage.setItem(key, csv);
}
function downloadLocalCSV(filename){
  const key = 'csv:'+filename;
  const csv = localStorage.getItem(key);
  if(!csv) return;
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

/* Lead capture handlers */
const leadForm = document.getElementById('lead-form');
if(leadForm){
  leadForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(leadForm).entries());
    appendToLocalCSV('leads.csv', ['name','email','company','timestamp'], {
      ...data, timestamp: new Date().toISOString()
    });
    alert('Thanks! We'll email you a scheduling link.');
    leadForm.reset();
  });
}
const magnetForm = document.getElementById('magnet-form');
if(magnetForm){
  magnetForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(magnetForm).entries());
    appendToLocalCSV('playbook-subs.csv', ['email','timestamp'], {
      ...data, timestamp: new Date().toISOString()
    });
    document.getElementById('playbook-link').classList.remove('hidden');
  });
}

/* Utility: expose CSV download via console */
window.dlLeads = ()=> downloadLocalCSV('leads.csv');
window.dlPlaybookSubs = ()=> downloadLocalCSV('playbook-subs.csv');

/* Keyboard close for dialogs */
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape'){
    document.querySelectorAll('dialog[open]').forEach(d=> d.close());
  }
});

/* Enhance modal close buttons after dialogs render */
window.addEventListener('load', ()=>{
  document.querySelectorAll('.modal .modal-close').forEach(btn=>{
    btn.setAttribute('data-close','');
  });
});
