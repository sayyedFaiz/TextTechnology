const convertJsonToXml = (jsonObj) => {
  const root = document.createElement("root");

  const traverse = (parent, data) => {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];
        if (typeof value === "object" && value !== null) {
          const element = document.createElement(key);
          parent.appendChild(element);
          traverse(element, value);
        } else {
          const element = document.createElement(key);
          element.textContent = String(value);
          parent.appendChild(element);
        }
      }
    }
  };

  traverse(root, jsonObj);

  const xmlString = new XMLSerializer().serializeToString(root);
  return xmlString;
};
