(function () {
  var pageViewId = "";
  var reportServer = "nocookieanalytics.com";
  var protocol = "https";
  var me = document.currentScript;
  if (me) {
    var url = new URL(me.src);
    reportServer = url.hostname || me.attributes["data-report-domain"].value;
    protocol = protocol || me.attributes["data-protocol"].value;
  }
  var eventUrl = protocol + "://" + reportServer + "/api/v1/e";

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
        pageViewId = data.page_view_id;
      } catch (e) {
        pageViewId = "";
        console.error("JSONParseErr: ", e);
      }
    };
  }

  function reportCustomEvent(eventName, eventValue) {
    if (!pageViewId || !pageViewId.length) {
      console.error("No page view recorded yet");
    }
    if (eventName === undefined || eventName === null) {
      console.error("Missing event name");
      return;
    }
    var urlParams = new URLSearchParams({
      url: document.URL,
      page_view_id: pageViewId,
      event_name: eventName,
    });
    if (eventValue) {
      urlParams.set("event_value", eventValue);
    }
    var url = eventUrl + "/custom?" + urlParams.toString();
    httpGet(url);
  }

  function trackPageView() {
    var urlParams = new URLSearchParams({
      url: document.URL,
      ref: document.referrer,
      tz: getTimezone(),
      w: screen.width.toString(),
      h: screen.height.toString(),
    });
    var url = eventUrl + "/page_view?" + urlParams.toString();
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
  if (!window.nca_event) {
    window.nca_event = reportCustomEvent;
  } else {
    console.error("Two nocookieanalytics scripts detected");
  }
})();
