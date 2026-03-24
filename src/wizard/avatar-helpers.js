;(function () {
  function getAvatarAnimationUrl(stepNum) {
    return './assets/avatar-animations/step' + stepNum + '.json';
  }

  window.AvatarHelpers = {
    getAvatarAnimationUrl: getAvatarAnimationUrl
  };
})();
