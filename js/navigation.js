document.addEventListener("DOMContentLoaded", () => {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  if (window.location.protocol === "file:") {
    return;
  }

  var controllerChangeCount = 0;
  var lastReloadTime = 0;
  
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/sw.js")
      .then(function (registration) {
        registration.update();

        registration.addEventListener("updatefound", function () {
          var newWorker = registration.installing;
          if (!newWorker) return;
        });
      })
      .catch(() => undefined);

    navigator.serviceWorker.addEventListener("controllerchange", function () {
      var now = Date.now();
      controllerChangeCount++;
      
      if (now - lastReloadTime < 10000) {
        if (controllerChangeCount > 3) {
          return;
        }
      } else {
        controllerChangeCount = 1;
      }
      
      lastReloadTime = now;
      
      setTimeout(function() {
        window.location.reload();
      }, 500);
    });
  });
});