document.addEventListener("DOMContentLoaded", function () {
  if (typeof mermaid === "undefined") return;
  const isDark =
    document.body.getAttribute("data-md-color-scheme") === "slate";
  mermaid.initialize({
    startOnLoad: true,
    theme: isDark ? "dark" : "default",
    themeVariables: {
      primaryColor: "#eef0ff",
      primaryTextColor: "#0f172a",
      primaryBorderColor: "#5a67d8",
      lineColor: "#94a3b8",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    },
    flowchart: {
      curve: "basis",
      htmlLabels: true,
      padding: 15,
    },
  });
});
