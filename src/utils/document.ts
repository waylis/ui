export const setFavicon = (url: string) => {
  let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']") || document.createElement("link");
  link.type = "image/png";
  link.rel = "icon";
  link.href = url;
  document.getElementsByTagName("head")[0].appendChild(link);
};
