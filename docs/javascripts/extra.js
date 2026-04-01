document.addEventListener('DOMContentLoaded', function () {
  const path = window.location.pathname;
  if (!path.endsWith('/')) {
    return;
  }
  const anchors = document.querySelectorAll('a[href^="http"]');
  anchors.forEach(function (anchor) {
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', 'noopener noreferrer');
  });
});
