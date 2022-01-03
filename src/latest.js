(function () {
  var pageViewId = "";
  var reportServer = "nocookieanalytics.com";
  var protocol = "http";
  var me = document.currentScript;
  if (me && me.attributes["data-domain"]) {
    reportServer = me.attributes["data-domain"].value;
  }
  if (me && me.attributes["data-protocol"]) {
    protocol = me.attributes["data-protocol"].value;
  }
  var eventUrl = protocol + "://" + reportServer + "/api/v1/e/";

  function getTimezone() {
    var tz = "";
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {}
    return tz;
  }

  function httpGet(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send(null);
    xhr.onload = () => {
      try {
        var data = JSON.parse(xhr.response);
        pageViewId = data.pvid;
      } catch (e) {
        pageViewId = "";
        console.error("Error while parsing JSON: ", e);
      }
    };
  }

  function reportCustomEvent(eventName, eventValue) {
    if (!pageViewId || !pageViewId.length) {
      console.error("No page view has been recorded yet");
    }
    if (eventName === undefined || eventName === null) {
      console.error("Missing event name, event ignored");
      return;
    }
    var urlParams = new URLSearchParams({
      et: "custom",
      url: document.URL,
      pvid: pageViewId,
      event_name: eventName,
    });
    if (eventValue) {
      urlParams.set(event_value, eventValue);
    }
    var url = eventUrl + "?" + urlParams.toString();
    httpGet(url);
  }

  function trackPageView() {
    var urlParams = new URLSearchParams({
      et: "page_view",
      url: document.URL,
      ref: document.referrer,
      tz: getTimezone(),
      w: screen.width.toString(),
      h: screen.height.toString(),
    });
    var url = eventUrl + "?" + urlParams.toString();
    httpGet(url);
  }

  function trackURLChanges() {
    var historyPushState = history.pushState;
    if (historyPushState) {
      history.pushState = function (state, title, url) {
        trackPageView();
        historyPushState.apply(this, [state, title, url]);
      };
      addEventListener("popstate", trackPageView);
    }
  }

  trackPageView();
  trackURLChanges();
  window.nca_event = reportCustomEvent;
})();
