const helpers = {
  selected: function(target: string, toMatch: string) {
    return target === toMatch ? " selected" : "";
  },
  getValidationClass: function(validationErrors: any) {
    if (Array.isArray(validationErrors) && validationErrors.length) {
      return " is-invalid";
    }
    return "";
  },
  eachInMap: function(map: Map<string, string>, block: any) {
    let output = "";

    if (map) {
      for (const [ key, value ] of map) {
        output += block.fn({ key, value });
      }
    }

    return output;
  },
};

export default helpers;
