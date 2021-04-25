import Perfume from "perfume.js";
import { IPerfumeNavigationTiming } from "perfume.js/dist/types/types";
import { http } from "./utils";

const domain = "http://geektower.emoh";
const eventUrl = `${domain}/api/v1/e/`;
let pageViewId: string = "";

const eventBaseData = () => {
  let tz: string;
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    tz = "null";
  }
  const tzo = -new Date().getTimezoneOffset();

  return {
    url: document.URL,
    pt: document.title,
    ref: document.referrer,
    tz: tz,
    tzo: tzo.toString(),
  };
};

const perfume = new Perfume({
  resourceTiming: false,
  analyticsTracker: async ({ metricName, data }) => {
    data = data as IPerfumeNavigationTiming;
    switch (metricName) {
      case "navigationTiming":
        {
          const performance = window.performance?.getEntriesByType(
            "navigation"
          )[0] as any;
          const { encodedBodySize } = performance;
          const { timeToFirstByte, totalTime, downloadTime } = data;

          const urlParams = new URLSearchParams({
            ...eventBaseData(),
            et: "page_view",
            ttfb: timeToFirstByte?.toString() || "null",
            tt: totalTime?.toString() || "null",
            psb: encodedBodySize.toString(),
            dt: downloadTime?.toString() || "null",
          });
          const url = `${eventUrl}?${urlParams.toString()}`;
          const resp = await http(url);
          const result = await resp.json();
          pageViewId = result.pvid;
        }
        break;
      case "lcp":
      case "fid":
      case "fp":
      case "cls":
      case "lcpFinal":
        const reportMetric = async () => {
          const urlParams = new URLSearchParams({
            ...eventBaseData(),
            et: "metric",
            pvid: pageViewId,
            mn: metricName,
            mv: data.toString(),
          });
          const url = `${eventUrl}?${urlParams.toString()}`;
          const resp = await http(url);
          const result = await resp.json();
        };
        const waitForPageViewId = async () => {
          if (!pageViewId) {
            setTimeout(waitForPageViewId, 500);
          } else {
            await reportMetric();
          }
        };
        await waitForPageViewId();
    }
  },
});
