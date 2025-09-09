/* Phase 2 - Content depth interactions (case studies, timeline)
   Keep light, no heavy libs. Accessible and performant.
*/
(function(){
  document.addEventListener('DOMContentLoaded', () => {
    // Placeholder: hook for future phase-2-only interactions
    // Example: enhance timeline focus states or deep-linking
    setupTimelineFocus();
  });

  function setupTimelineFocus(){
    const items = document.querySelectorAll('.timeline-item');
    items.forEach(it => {
      it.addEventListener('focusin', () => it.classList.add('focus'));
      it.addEventListener('focusout', () => it.classList.remove('focus'));
    });
  }
})();
