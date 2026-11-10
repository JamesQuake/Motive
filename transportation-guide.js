// Browser-only reading checklist. No submission, storage, or quote workflow.
document.querySelectorAll('.detail-review-checklist').forEach(checklist => {
  const items = [...checklist.querySelectorAll('input[type="checkbox"]')];
  const progress = checklist.querySelector('output');
  const update = () => {
    progress.textContent = `${items.filter(item => item.checked).length} of ${items.length} items reviewed`;
  };
  checklist.addEventListener('change', update);
  update();
});
