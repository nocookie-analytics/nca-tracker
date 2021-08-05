// TODO: Make this into a dumb old-school javascript file, so it doesn't need to be transpiled
import Perfume from "perfume.js";
import { IPerfumeNavigationTiming } from "perfume.js/dist/types/types";
import { http } from "./utils";

const domainPrefix = process.env.DOMAIN_PREFIX ? process.env.DOMAIN_PREFIX : "";
const protocol = process.env.FORCE_INSECURE_HTTP === "true" ? "http" : "https";
const domain = `${protocol}://${domainPrefix}${process.env.ANALYTICS_DOMAIN}`;
const eventUrl = `${domain}/api/v1/e/`;
let pageViewId: string = "";

const getTimezone = (): string => {
  let tz: string = "";
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {}
  return tz;
};

const pendingEvents: Array<Array<string>> = [];

const reportMetric = async (metricName: string, metricValue: string) => {
  const urlParams = new URLSearchParams({
    et: "metric",
    url: document.URL,
    pvid: pageViewId,
    mn: metricName,
    mv: metricValue.toString(),
  });
  const url = `${eventUrl}?${urlParams.toString()}`;
  const resp = await http(url);
  await resp.json();
};

const trackPageView = async () => {
  const urlParams = new URLSearchParams({
    et: "page_view",
    url: document.URL,
    ref: document.referrer,
    tz: getTimezone(),
    w: screen.width.toString(),
    h: screen.height.toString(),
  });
  const url = `${eventUrl}?${urlParams.toString()}`;
  const resp = await http(url);

  const result = await resp.json();
  pageViewId = result.pvid;
  pendingEvents.forEach(async ([metricName, metricValue]) => {
    await reportMetric(metricName, metricValue);
  });
};

new Perfume({
  resourceTiming: false,
  analyticsTracker: async ({ metricName, data }) => {
    data = data as IPerfumeNavigationTiming;
    if (["lcp", "fid", "fp", "cls", "lcpFinal"].includes(metricName)) {
      if (!pageViewId) {
        pendingEvents.push([metricName, data.toString()]);
      } else {
        reportMetric(metricName, data.toString());
      }
    }
  },
});

(async function () {
  trackPageView();

  const historyPushState = history.pushState;
  if (historyPushState) {
    history.pushState = function (state, title, url) {
      trackPageView();
      historyPushState.apply(this, [state, title, url]);
    };
    addEventListener("popstate", trackPageView);
  }
})();
